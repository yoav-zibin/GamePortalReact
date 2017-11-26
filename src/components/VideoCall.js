import React, { Component } from 'react';
import './css/VideoCall.css';
import {Button} from 'reactstrap';
import {db, auth} from '../firebase';
import firebase from 'firebase';
import { toast } from 'react-toastify';

export default class VideoCall extends Component {

    constructor(props){
        super(props);
        this.state = {
            callOngoing: false,
            groupMembers: {},
            localStream: null,
            remoteStream: null
        };
        this.targetUserId = null;
        this.initGroupMembers(props.groupId)
        this.listenToMessages();
    }

    initGroupMembers(groupId){
        let self = this;
        let groupRef = db.ref(`gamePortal/groups/${groupId}/participants`);
        groupRef.on('value', (snap)=>{
            let content = {};
            Object.keys(snap.val()).forEach((uid)=>{
                if(auth.currentUser.uid === uid){
                    return;
                }
                let userRef = db.ref(`users/${uid}/publicFields/displayName`);
                userRef.once('value').then((snap)=>{
                    if(snap.exists){
                        content[snap.val()] = uid;
                        self.setState({
                            groupMembers: content
                        });
                    }
                });
            });
        });
    }

    prettyJson(obj) {
        return JSON.stringify(obj, null, '  ');
    }

    dbSet(ref, writeVal) {
        // let writeValJson = this.prettyJson(writeVal);
        // console.log(`Writing path=`, ref.toString(), ` writeVal=`, writeValJson, `...`);
        ref.set(writeVal);
    }

    start(isCaller){
        let self = this;
        console.log('calling Started');
        const configuration = {
            'iceServers': [{
              'urls': 'stun:stun.l.google.com:19302'
            }]
        };
        const offerOptions = {
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        };
        self.pc = new RTCPeerConnection(configuration);

        // send any ice candidates to the other peer
        self.pc.onicecandidate = function (evt) {
            // console.log("onicecandidate: ", evt);
            if (evt.candidate) {
                self.sendMessage("candidate", evt.candidate);
            }
        };

        // once remote stream arrives, show it in the remote video element
        self.pc.onaddstream = function (evt) {
            // console.log("onaddstream: ", evt);
            self.setVideoStream(false, evt.stream);
        };

        self.pc.oniceconnectionstatechange = function(event) {
            if(self.pc && self.pc.iceConnectionState === "disconnected"){
                self.endVideoCall();
            }
        }

        // get the local stream, show it in the local video element and send it
        // console.log('Requesting getUserMedia...');
        navigator.mediaDevices.getUserMedia({ "audio": true, "video": true })
        .then(function (stream) {
                // console.log("getUserMedia response: ", stream);
                self.setVideoStream(true, stream);
                self.pc.addStream(stream);

                if (isCaller) {
                    self.pc.createOffer(offerOptions).then(
                        self.gotDescription.bind(self),
                        (err: any) => { console.error("Error in createOffer: ", err); }
                    );
                } else {
                    self.pc.createAnswer().then(
                        self.gotDescription.bind(self),
                        (err: any) => { console.error("Error in createAnswer: ", err); }
                    );
                }

            }, (err: any) => { console.error("Error in getUserMedia: ", err); });
    }

    sendMessage(signalType, signalData){
        let ref = db.ref(`users/${this.targetUserId}/privateButAddable/signal`).push();
        let signalMsg = {
          addedByUid: auth.currentUser.uid,
          timestamp: firebase.database.ServerValue.TIMESTAMP,
          signalData: JSON.stringify(signalData),
          signalType: signalType,
        };
        this.dbSet(ref, signalMsg);
    }

    setVideoStream(isLocal, stream){
        if(isLocal){
            this.setState({
                localStream: stream
            });
        }else{
            this.setState({
                remoteStream: stream
            });
        }
    }

    hideVideoStream(){
        this.setState({
            localStream: null,
            remoteStream: null
        });
    }

    stopLocalStream(){
        if(this.state.localStream !== null){
            for (let track of this.state.localStream.getTracks()) {
                track.stop()
            }
        }
    }

    disconnect(){
        if(this.pc){
            this.pc.close();
            this.pc = null;
        }
    }

    gotDescription(desc) {
        // console.log("gotDescription.bind(self): ", desc);
        this.pc.setLocalDescription(desc);
        this.sendMessage("sdp", desc);
    }

    listenToMessages() {
        let self = this;
        let path = `users/${auth.currentUser.uid}/privateButAddable/signal`;
        db.ref(path).on('value',(snap) => {
            let signals = snap.val();
            // console.log("Got signals=", signals);
            if (!signals) return;

            let signalIds = Object.keys(signals);
            signalIds.sort((signalId1, signalId2) => signals[signalId1].timestamp - signals[signalId2].timestamp); // oldest entries are at the beginning
            let updates = {};
            for (let signalId of signalIds) {
              updates[signalId] = null;
              self.receivedMessage(signals[signalId]);
            }
            db.ref(path).update(updates);
        });
    }

    receivedMessage(signalMsg) {
        const CALL_RECEIVE_WINDOW = 15 * 1000;
        // console.log("receivedMessage signalMsg=", signalMsg);
        const now = new Date().getTime();
        if (now - CALL_RECEIVE_WINDOW > signalMsg.timestamp) {
          console.warn("Ignoring signal because it's more than a minute old");
          return;
        }
        if (!this.pc) {
          this.targetUserId = signalMsg.addedByUid;
          this.setState({
              callOngoing: true
          });
          this.start(false);
        }

        let signalType = signalMsg.signalType
        let signalData = JSON.parse(signalMsg.signalData);
        if (signalType === "sdp") {
          this.pc.setRemoteDescription(new RTCSessionDescription(signalData)).then(
            () => { console.log("setRemoteDescription success"); },
            (err: any) => { console.error("Error in setRemoteDescription: ", err); }
          );
        } else if (signalType === "candidate")  {
          this.pc.addIceCandidate(new RTCIceCandidate(signalData)).then(
            () => { console.log("addIceCandidate success"); },
            (err: any) => { console.error("Error in addIceCandidate: ", err); }
          );
        }
      }

    initCall(targetUserId){
        this.setState({
            callOngoing: true
        });
        this.targetUserId = targetUserId;
        this.start(true);
        this.startTimer()
    }

    endVideoCall(){
        this.stopLocalStream()
        this.hideVideoStream();
        this.disconnect();
        this.props.doneVideoCall();
    }

    startTimer(){
        let FIVE_SECOND_MILLIS = 1000*5;
        let thiz = this;
        setTimeout(function () {
            if(!(thiz.state.localStream && thiz.state.remoteStream)){
                toast.error("Call Failed! Other user should be online and in same Game Room");
                thiz.endVideoCall();
            }
        }, FIVE_SECOND_MILLIS);
    }

    render(){
        let myComponent = this.state.localStream && this.state.remoteStream ?
            (
                <div>
                    <video src={URL.createObjectURL(this.state.remoteStream)} id="remotevideo" autoPlay/>
                    <video src={URL.createObjectURL(this.state.localStream)} id="localvideo" autoPlay/>
                    <Button
                        className='back-button'
                        color='success'
                        onClick={this.endVideoCall.bind(this)}>
                        Hang Up!
                    </Button>
                </div>
            ) :
            (
                <div>
                    <ul className='group-members'>
                        {Object.keys(this.state.groupMembers).map((member)=>{
                            return(
                                <li
                                    className='group-members-item'
                                    onClick={this.initCall.bind(this, this.state.groupMembers[member])}
                                    key={this.state.groupMembers[member]}>
                                    {member}
                                </li>
                            );
                        })}
                    </ul>
                    <Button
                        className='back-button'
                        color='success'
                        onClick={()=>{this.props.doneVideoCall()}}>
                        Back
                    </Button>
                </div>
            );

        return(
            <div className='web-rtc-inner-container'>
                <h5 className='video-call-title'>Video Call</h5>
                {myComponent}
            </div>
        );
    }
}
