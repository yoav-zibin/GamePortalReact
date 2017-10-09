import React, { Component } from 'react';
import { Button } from 'reactstrap';
import ChatWindow from './ChatWindow';

export default class Chat extends Component {

  constructor(){
      super();
      this.state = {
          chatId: "",
          partner: "",
          chatWindowVisible: "chatWindowInvisible"
      };
  }

  loadChats(){
      console.log('loadChats');
  }

  componentWillMount(){
      this.loadChats();
  }

  startChat(){
      var chatId = "-Kw2Q76uMnXg-HSUMtkb";
      this.setState({
          chatId: chatId,
          chatWindowVisible: "chatWindowVisible"
      });
  }

  handleUidChange(e){
      this.setState({partner: e.target.value})
  }

  render() {
    return (
        <div>
            <input type="text" value={this.state.partner} onChange={this.handleUidChange.bind(this)} placeholder="partner uid"/><br/>
            <Button color="success" onClick={this.startChat.bind(this)}>Start Chat</Button>
            <ChatWindow chatId={this.state.chatId} chatWindowVisible={this.state.chatWindowVisible}/>
        </div>
    );
  }
}
