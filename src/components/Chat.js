import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import './css/Chat.css';
import {db, auth} from '../firebase';
import firebase from 'firebase';

export default class Chat extends Component {

    constructor(props){
        super(props);
        this.state = {
            content: [],
            members: {},
            imgs: {},
            message: '',
            groupName: '',
            nOfMembers: null
        };
        this.RETURN_KEYCODE = 13;
        this.videoRef = null;
    }

    scrollToBottom = (behavior) => {
        if(behavior==='smooth'){
            const node = ReactDOM.findDOMNode(this.messagesEnd);
            node.scrollIntoView({ behavior: behavior });
        }else if(behavior === 'instant'){
            this.messagesEnd.scrollIntoView();
        }
    }


    componentDidMount(){
        this.componentDidJustMount = true;
        this.initMembersFinish = false;
        this.initMembers();
        this.listenToVideoCall(true);
    }

    componentWillUnmount(){
        this.listenToVideoCall(false);
        this.chatRef.off();
    }

    listenToVideoCall(isListening){
        if(isListening){
            let self = this;
            const CALL_RECEIVE_WINDOW = 15 * 1000;
            if(self.videoRef === null)
                self.videoRef = db.ref(`users/${auth.currentUser.uid}/privateButAddable/signal`);
            self.videoRef.on('value',(snap) => {
                if(snap.exists()){
                    let signals = snap.val();
                    let now = new Date().getTime();
                    for(let key in signals){
                        if(now - CALL_RECEIVE_WINDOW < signals[key].timestamp){
                            self.videoCall('inComingCall');
                            break;
                        }
                    }
                }
            });
        }else{
            if(this.videoRef !== null){
                this.videoRef.off();
                this.videoRef = null;
            }
        }
    }

    initMembers(){
        let self = this;
        let membersRef = db.ref('gamePortal/groups/'+self.props.groupId+'/participants');
        membersRef.on('value', function(snapshot){
            if(snapshot.exists()){
                let members = {};
                let imgs = {};
                let memberIds = snapshot.val();
                let numMembers = Object.keys(snapshot.val()).length;
                Object.keys(memberIds).forEach((memberId)=>{
                    let userRef = db.ref('users/'+memberId+'/publicFields');
                    userRef.once('value').then((snapshot)=>{
                        let name = snapshot.child('/displayName').val();
                        let img = snapshot.child('/avatarImageUrl').val();

                        let id = snapshot.ref.parent.key;
                        members[id] = name;
                        imgs[id] = img;
                        if(Object.keys(members).length === numMembers){
                            self.initMembersFinish = true;
                            self.setState({
                                members: members,
                                imgs: imgs,
                            });
                        }
                    });
                });
            }
        });
    }

    timeago(timeStamp) {
        let now = new Date();
        timeStamp = new Date(timeStamp);
        let secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;
        if(secondsPast < 60){
          return parseInt(secondsPast, 10) + 's';
        }
        if(secondsPast < 3600){
          return parseInt(secondsPast/60, 10) + 'm';
        }
        if(secondsPast <= 86400){
          return parseInt(secondsPast/3600, 10) + 'h';
        }
        if(secondsPast <= 604800){
          return parseInt(secondsPast/86400, 10) + 'd';
        }
        // if(secondsPast <= 18144000){
        //   return parseInt(secondsPast/604800) + 'w';
        // }
        if(secondsPast > 604800){
            let day = timeStamp.getDate();
            let month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ","");
            let year = timeStamp.getFullYear() === now.getFullYear() ? "" :  " "+timeStamp.getFullYear();
            return day + " " + month + year;
        }
    }

    initChat(){
        let self = this;
        this.chatRef = db.ref('gamePortal/groups/'+self.props.groupId);
        this.chatRef.on('value', function(snapshot){
            if(snapshot.exists()){
                let chat = [];
                let messages = snapshot.child('/messages').val();
                let groupName = snapshot.child('/groupName').val();
                let nOfMembers = "("+Object.keys(snapshot.child('/participants').val()).length+")";
                self.setState({
                    groupName: groupName,
                    nOfMembers: nOfMembers
                });
                if(!(messages === null)){
                    Object.keys(messages).forEach((messageKey)=>{
                        let message = messages[messageKey];
                        let cssClass = auth.currentUser.uid===message.senderUid ? 'self' : 'friend';
                        let val = {
                            timestamp: message.timestamp,
                            sender: self.state.members[message.senderUid],
                            senderImg: self.state.imgs[message.senderUid],
                            senderUid: message.senderUid,
                            message: message.message,
                            cssClass: cssClass
                        };
                        chat.push(val);
                    });
                 }
                self.setState({
                    content: chat,
                });
                if(self.componentDidJustMount){
                    self.componentDidJustMount = false;
                    self.scrollToBottom('instant');
                } else{
                    self.scrollToBottom('smooth');
                }
            }
        });
    }

    sendMessage(message){
        let chatRef = db.ref('gamePortal/groups/'+this.props.groupId+'/messages');
        let messageInfo = {
            message: message,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            senderUid: auth.currentUser.uid
        };
        chatRef.push(messageInfo);
    }

    handleReturnPress(event){
        let keycode = event.keyCode;
        if(keycode===this.RETURN_KEYCODE){
            if(this.state.message.length > 0){
                let message = this.state.message;
                this.setState({
                    message: ''
                });
                this.sendMessage(message);
            }
        }
    }

    handleOnChange(event){
        let message = event.target.value;
        this.setState({
            message: message
        });
    }

  addMember(){
      this.props.addMember();
      // console.log(this.state.members);
  }

  deleteMember(){
      this.props.deleteMember();
  }

  videoCall(callType){
      if(callType==='inComingCall')
        this.props.videoCall(true);
      else
        this.props.videoCall(false);
  }

    render(){
        if(this.initMembersFinish){
            this.initChat();
            this.initMembersFinish = false;
        }
        let chats = this.state.content.map((chat, index)=>{
            return(
                <div key={'outer'+index} className={chat.cssClass}>
                    <span1>  {chat.sender}<br/> </span1>
                    <img src={chat.senderImg} alt='' />
                    <span>  {chat.message}<br/> </span>

                    <chat-timestamp>
                        {this.timeago(chat.timestamp)}
                    </chat-timestamp>
                </div>
            );
        });
        return(

            <div className='chat-inner-container'>
                <div className='group-title-container'>

                    <span className='chat-inner-container-title' onClick={this.deleteMember.bind(this)}>{this.state.groupName} {this.state.nOfMembers}</span>
                    <button onClick={this.videoCall.bind(this)}><span role='img' aria-label='phone' style={{color:'#fff'}}>&#128222;</span></button>
                    <button onClick={this.addMember.bind(this)}>+</button>
                 </div>
                <div className='chat-list-container'>
                    {chats}
                    <div style={{ float:"left", clear: "both" }}
                         ref={(el) => { this.messagesEnd = el; }}>
                    </div>
                </div>
                <input
                    className='message-input-field'
                    type="text"
                    value={this.state.message}
                    onKeyDown={this.handleReturnPress.bind(this)}
                    onChange={this.handleOnChange.bind(this)}/>
            </div>
        );
    }
}
