import React, {Component} from 'react';
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
            message: ''
        };
        this.RETURN_KEYCODE = 13;
    }

    componentDidMount(){
        this.initMembersFinish = false;
        this.initMembers();
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
                                imgs: imgs
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
          return parseInt(secondsPast) + 's';
        }
        if(secondsPast < 3600){
          return parseInt(secondsPast/60) + 'm';
        }
        if(secondsPast <= 86400){
          return parseInt(secondsPast/3600) + 'h';
        }
        if(secondsPast <= 604800){
          return parseInt(secondsPast/86400) + 'd';
        }
        // if(secondsPast <= 18144000){
        //   return parseInt(secondsPast/604800) + 'w';
        // }
        if(secondsPast > 604800){
            let day = timeStamp.getDate();
            let month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ","");
            let year = timeStamp.getFullYear() == now.getFullYear() ? "" :  " "+timeStamp.getFullYear();
            return day + " " + month + year;
        }
    }

    initChat(){
        let self = this;
        let chatRef = db.ref('gamePortal/groups/'+self.props.groupId+'/messages');
        chatRef.on('value', function(snapshot){
            if(snapshot.exists()){
                let chat = [];
                let messages = snapshot.val();
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
                self.setState({
                    content: chat
                });
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

    render(){
        if(this.initMembersFinish){
            this.initChat();
            this.initMembersFinish = false;
        }
        let chats = this.state.content.map((chat, index)=>{
            return(
                <div key={'outer'+index} className={chat.cssClass}>
                    <span1>  {chat.sender}<br/> </span1>
                    <img src={chat.senderImg} />
                    <span>  {chat.message}<br/> </span>

                    <chat-timestamp>
                        {this.timeago(chat.timestamp)}
                    </chat-timestamp>
                </div>
            );
        });
        return(
            <div className='chat-inner-container'>
                <div className='chat-list-container'>
                    {chats}
                </div>
                <input
                    className='message-input-field'
                    type="text"
                    value={this.state.message}
                    onKeyDown={this.handleReturnPress.bind(this)}
                    onChange={this.handleOnChange.bind(this)}
                />
            </div>
        );
    }
}
