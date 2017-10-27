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
          textMessage: ""
      };
  }

  sendMessage(){
      let message_info = {
          senderUid: auth.currentUser.uid,
          message: this.state.textMessage,
          timestamp: firebase.database.ServerValue.TIMESTAMP
      };
      let messagesRef = db.ref('gamePortal/groups/'+this.props.chatId+'/messages');
      messagesRef.push(message_info);
  }

  handleInputChange(e){
      this.setState({textMessage : e.target.value});
  }

  render() {
    return (
        <div className={this.props.chatWindowVisible}>
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
