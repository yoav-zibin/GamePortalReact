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
          if (snapshot.exists()) {
          let messages = snapshot.val();
          let list = [];
          let keys =Object.keys(messages);
          keys.sort((key1, key2) => messages[key1].timestamp - messages[key2].timestamp);
          for (let index of keys) {
                list.push({
                    message: messages[index].message,
                    sentBySelf: messages[index].senderUid === auth.currentUser.uid,
                    sentUid: messages[index].senderUid,
                    //sentdisplayname: userName
                });
              self.setState({messages:list});
          }
        }
          /*
          let userName = "";
          let Promises = Object.keys(messages).map((message) => {
            return db.ref(`users/${message.senderUid}/publicFields/displayName`).once('value');
          });

          Promises.all((snapshots) => {
          let list = snapshots.map((snapshot, index) => {
            // Add code to check for failure also here, if it rejects
            userName = snapshot.val()
            return {
              message: messages[index].message,
              sentBySelf: messages[index].senderUid === auth.currentUser.uid,
              sentUid: messages[index].senderUid,
              sentdisplayname: userName
            }
          });
          */
          //self.setState({messages: list});
      //});
          /*
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
          */
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

      return (<div className = {applyClass}><p>{message.sentUid}:</p><span className = 'send'>    {message.message}     <br/></span></div>);
    });

    return (
        <div className='MessageDisplay'>        
            {prevChat}
        </div>
    );
  }
}
