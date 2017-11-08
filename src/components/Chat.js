import React, {Component} from 'react';
import './css/Chat.css';
import {db, auth} from '../firebase';

export default class Chat extends Component {

    constructor(props){
        super(props);
        this.state = {
            content: [],
            members: {}
        };
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
                let memberIds = snapshot.val();
                let numMembers = Object.keys(snapshot.val()).length;
                Object.keys(memberIds).forEach((memberId)=>{
                    let userRef = db.ref('users/'+memberId+'/publicFields/displayName');
                    userRef.once('value').then((snapshot)=>{
                        let name = snapshot.val();
                        let id = snapshot.ref.parent.parent.key;
                        members[id] = name;
                        if(Object.keys(members).length === numMembers){
                            self.initMembersFinish = true;
                            self.setState({
                                members: members
                            });
                        }
                    });
                });
            }
        });
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
                    cssClass += ' message-item';
                    let val = {
                        timestamp: message.timestamp,
                        sender: self.state.members[message.senderUid],
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

    render(){
        if(this.initMembersFinish){
            this.initChat();
            this.initMembersFinish = false;
        }
        let chats = this.state.content.map((chat, index)=>{
            return(
                <li key={index} className={chat.cssClass}>
                    {chat.message}
                </li>
            );
        });
        console.log(this.state.content);
        return(
            <div className='chat-inner-container'>
                <ul>
                    {chats}
                </ul>
            </div>
        );
    }
}
