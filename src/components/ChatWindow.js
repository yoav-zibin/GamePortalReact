import React, { Component } from 'react';
import ChatDisplay from './ChatDisplay';
import { Button } from 'reactstrap';
import {db, auth} from '../firebase';
import firebase from 'firebase';
import './css/ChatWindow.css'

export default class ChatWindow extends Component {

  constructor(){
      super();
      this.state = {
          textMessage: "",
          participants: [],
      };
      this.prevChatId = "";
  }
  
  loadparticipants() {
    let self = this;
    let participantsRef = db.ref("gamePortal/groups/"+this.props.chatId+"/participants");
    participantsRef.on('value', function(snapshot) {
          let participants = snapshot.val();
          let list = [];
          let userName = "";

          for(let index in participants){
              if (index === auth.currentUser.uid) continue;
              let usernameRef = db.ref('users/'+index+'/publicFields')
              usernameRef.once("value",function(snapshot){
                  userName = snapshot.child('/displayName').val();
                  let isConnected = snapshot.child('/isConnected').val();
                  list.push({
                    uid: snapshot.ref.parent.parent.key,
                    displayname: userName,
                    isConnected : isConnected
                });
                self.setState({participants:list});
              })
          }
      });

  }

  sendMessage(){
      let message_info = {
          senderUid: auth.currentUser.uid,
          message: this.state.textMessage,
          timestamp: firebase.database.ServerValue.TIMESTAMP
      };
      let messagesRef = db.ref('gamePortal/groups/'+this.props.chatId+'/messages');
      messagesRef.push(message_info);
      this.setState({textMessage : ""});
  }

  handleInputChange(e){
      this.setState({textMessage : e.target.value});
  }

  render() {
    if(this.prevChatId !== this.props.chatId){
      this.prevChatId = this.props.chatId;
      this.setState({participants: []});
      this.loadparticipants();
    }

    let showparticipants = this.state.participants.map((participant) =>{
      if(participant.isConnected)
          return(<span className={'online'}>{participant.displayname}<br/></span>);
     else
        return(<span className={'offline'}>{participant.displayname}<br/></span>);
      
    });

    return (
        <div className={this.props.chatWindowVisible}>
            <h4>Group Members</h4>
            {showparticipants}
            <p></p>
            <h4>Messages</h4>    
            <ChatDisplay chatId={this.props.chatId}/>
            <textarea
                className="message"
                type="text"
                placeholder="Your message"
                value={this.state.textMessage}
                onChange={this.handleInputChange.bind(this)}/><br/>
            <Button color="success" onClick={this.sendMessage.bind(this)}>Send</Button>
        </div>
    );
  }
}
