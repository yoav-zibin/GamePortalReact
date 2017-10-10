import React, { Component } from 'react';
import {db, auth} from '../firebase';
import './css/ChatDisplay.css';

export default class ChatWindow extends Component {

  constructor(){
      super();
      this.state = {messages:[]};
      this.prevChatId = "";
  }

  loadMessages(){
      var self = this;
      var messagesRef = db.ref("chats/"+this.props.chatId+"/messages");
      messagesRef.on('value', function(snapshot) {
          var messages = snapshot.val();
          var list = [];
          for(var index in messages){
              list.push({
                  message: messages[index].message,
                  sentBySelf: messages[index].senderUid === auth.currentUser.uid
              });
          }
          self.setState({messages:list});
      });
  }

  render() {
    if(this.prevChatId!==this.props.chatId){
      this.prevChatId = this.props.chatId;
      this.loadMessages();
    }
    var prevChat = this.state.messages.map((message) =>{
        var applyClass = null;
      if(message.sentBySelf){
          applyClass = "sentBySelf";
      } else{
          applyClass = "sentByPartner";
      }
      return (<span className={applyClass}>{message.message}<br/></span>);
    });
    return (
        <div>
            {prevChat}
        </div>
    );
  }
}
