import React, { Component } from 'react';
import {db, auth} from '../firebase';
import './css/ChatDisplay.css';

export default class ChatWindow extends Component {

  constructor(){
      super();
      this.state = {
        messages:[],
        participants: [],
      };
      this.prevChatId = "";
  }

  loadMessages(){
      let self = this;
      let messagesRef = db.ref("gamePortal/groups/"+this.props.chatId+"/messages");

      this.setState({messages:[]});
      messagesRef.on('value', function(snapshot) {
          let messages = snapshot.val();
          let list = [];
          let userName = "";

          for(let index in messages){
              let usernameRef = db.ref('users/'+messages[index].senderUid+'/publicFields/displayName');
              usernameRef.on("value",function(snapshot){
                  userName = snapshot.val();
                  list.push({
                    message: messages[index].message,
                    sentBySelf: messages[index].senderUid === auth.currentUser.uid,
                    sentUid: messages[index].senderUid,
                    sentdisplayname: userName
                });
                self.setState({messages:list});
              })
          }
      });
  }

  render() {
    if(this.prevChatId!==this.props.chatId){
      this.prevChatId = this.props.chatId;
      this.loadMessages();
    }

    let prevChat = this.state.messages.map((message) =>{
        let applyClass = null;
      if(message.sentBySelf){
          applyClass = "sentBySelf";
      } else{
          applyClass = "sentByPartner";
      }
      return (<span className={applyClass}>{message.sentdisplayname}:{message.message}<br/></span>);
    });

    return (
        <div>        
            {prevChat}
        </div>
    );
  }
}
