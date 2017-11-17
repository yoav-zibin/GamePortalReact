import React, { Component } from 'react';
import './css/VideoCall.css';
import {Button} from 'reactstrap';
import {db, auth} from '../firebase';
import firebase from 'firebase';

export default class VideoCall extends Component {

    constructor(props){
        super(props);
        this.state = {
            callOngoing: false,
            groupMembers: {}
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
            console.log('dafq', snap.val());
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
        let writeValJson = this.prettyJson(writeVal);
        console.log(`Writing path=`, ref.toString(), ` writeVal=`, writeValJson, `...`);
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
            console.log("onicecandidate: ", evt);
            if (evt.candidate) {
                self.sendMessage(JSON.stringify({ "candidate": evt.candidate }));
            }
        };

        // once remote stream arrives, show it in the remote video element
        self.pc.onaddstream = function (evt) {
            console.log("onaddstream: ", evt);
            self.setVideoStream(false, evt.stream);
        };

        // get the local stream, show it in the local video element and send it
        console.log('Requesting getUserMedia...');
        navigator.mediaDevices.getUserMedia({ "audio": true, "video": true })
        .then(
            function (stream: any) {
                console.log("getUserMedia response: ", stream);
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

    sendMessage(msg){
        let ref = db.ref(`users/${this.targetUserId}/privateButAddable/signal`).push();
        let signalData: SignalData = {
          addedByUid: auth.currentUser.uid,
          timestamp: firebase.database.ServerValue.TIMESTAMP,
          signalData: msg,
        };
        this.dbSet(ref, signalData);
    }

    setVideoStream(isLocal, stream){
        if(isLocal){
            this.localVid.srcObject = stream;
        }else{
            this.remoteVid.srcObject = stream;
        }
    }

    gotDescription(desc) {
        console.log("gotDescription.bind(self): ", desc);
        this.pc.setLocalDescription(desc);
        this.sendMessage(JSON.stringify({ "sdp": desc }));
    }

    listenToMessages() {
        let self = this;
        let path = `users/${auth.currentUser.uid}/privateButAddable/signal`;
        db.ref(path).on('value',(snap) => {
            let signals = snap.val();
            console.log("Got signals=", signals);
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

    receivedMessage(signalData) {
        const ONE_MINUTE_MILLIS = 60 * 1000;
        console.log("receivedMessage signalData=", signalData);
        const now = new Date().getTime();
        if (now - ONE_MINUTE_MILLIS > signalData.timestamp) {
          console.warn("Ignoring signal because it's more than a minute old");
          return;
        }
        if (!this.pc) {
          this.targetUserId = signalData.addedByUid;
          this.setState({
              callOngoing: true
          });
          this.start(false);
        }

        var signal = JSON.parse(signalData.signalData);
        if (signal.sdp) {
          this.pc.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(
            () => { console.log("setRemoteDescription success"); },
            (err: any) => { console.error("Error in setRemoteDescription: ", err); }
          );
        } else {
          this.pc.addIceCandidate(new RTCIceCandidate(signal.candidate)).then(
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
    }

    render(){
        let myComponent = this.state.callOngoing ?
            (
                <div>
                    <video ref={(elem)=> {this.remoteVid = elem;}} id="remotevideo" autoPlay/>
                    <video ref={(elem)=> {this.localVid = elem;}} id="localvideo" autoPlay/>
                    <Button
                        className='back-button'
                        color='primary'
                        onClick={()=>{this.props.doneVideoCall()}}>
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
                        color='primary'
                        onClick={()=>{this.props.doneVideoCall()}}>
                        Back
                    </Button>
                </div>
            );

        console.log(this.state.groupMembers);
        return(
            <div className='web-rtc-inner-container'>
                {myComponent}
            </div>
        );
    }
}
