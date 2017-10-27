import React, { Component } from 'react';
import { Button } from 'reactstrap';
import ChatWindow from './ChatWindow';
import {db, auth} from '../firebase';
import firebase from 'firebase';

export default class Chat extends Component {

  constructor(){
      super();
      this.state = {
          chatId: "",
          partner: "",
          chatWindowVisible: "chatWindowInvisible"
      };
      this.chats = [];
      this.partner = "";
  }

  getSelfParticipatedChatIds(){
      var self = this;
      var selfChatIdsRef = db.ref("users/"+auth.currentUser.uid+"/privateButAddable/groups");
      selfChatIdsRef.on('value', function(snapshot) {
        self.selfChatIds = [];
        for (var key in snapshot.val()){
            self.selfChatIds.push(key);
        }
        if(self.selfChatIds.length > 0)
            self.loadChat(0);
      });
  }

  loadChat(index){
      if (index === 0){
          this.chats = [];
      }
      var self = this;
      var chatId = self.selfChatIds[index];
      var chatReference = db.ref("gamePortal/groups/"+chatId);
      index = index + 1;
      chatReference.once('value', function(snapshot) {
        var chat = snapshot.val();
        chat.id = chatId;
        self.chats.push(chat);
        if(index < self.selfChatIds.length)
            self.loadChat(index);
      });
  }

  componentWillMount(){
      this.getSelfParticipatedChatIds();
  }

  startChat(){
      var chatId = this.getOldChatIdOrStartNewChat();
      this.setState({
          chatId: chatId,
          chatWindowVisible: "chatWindowVisible"
      });
  }

  getOldChatIdOrStartNewChat(){
      for(var index in this.chats){
          var chat = this.chats[index];
          if(this.state.partner in chat.participants)
          {
            this.partner = this.state.partner;
            return chat.id;
          }
      }
      return this.startNewChat();
  }

  startNewChat(){
    let uidSelf = auth.currentUser.uid;
    let uidPartner = this.state.partner;
    let participants = {};
    participants[uidSelf] = true;
    participants[uidPartner]= true;
    let chatref = db.ref('gamePortal/groups');
    let newChat = chatref.push({
        participants:participants,
        createdOn: firebase.database.ServerValue.TIMESTAMP,
        groupName: "ReactPortal"
    });
    let newChatId = newChat.key;
    let newChatInfo = {
        addedByUid: auth.currentUser.uid,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    let selfRef = db.ref('users/'+uidSelf+'/privateButAddable/groups/'+newChatId);
    let partnerRef = db.ref('users/'+uidPartner+'/privateButAddable/groups/'+newChatId);
    selfRef.set(newChatInfo);
    partnerRef.set(newChatInfo);
    return newChatId;
  }

  handleUidChange(e){
      this.setState({partner: e.target.value})
  }

  render() {
    return (
        <div>
            <div>Individual Chat</div>
            <div>With: <input type="text" value={this.partner} onChange={this.handleUidChange.bind(this)} /></div>
            <input type="text" value={this.state.partner} onChange={this.handleUidChange.bind(this)} placeholder="Enter partner uid"/><br/>
            <Button color="success" onClick={this.startChat.bind(this)}>Start Chat</Button>
            <ChatWindow chatId={this.state.chatId} chatWindowVisible={this.state.chatWindowVisible}/>
        </div>
    );
  }
}
