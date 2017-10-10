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
  }

  getSelfParticipatedChatIds(){
      var self = this;
      var selfChatIdsRef = db.ref("users/"+auth.currentUser.uid+"/privateButAddable/chats");
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
      var self = this;
      var chatId = self.selfChatIds[index];
      var chatReference = db.ref("chats/"+chatId);
      index = index + 1;
      chatReference.once('value', function(snapshot) {
        var chat = snapshot.val();
        self.chats.push(chat);
        if(index < self.selfChatIds.length)
            self.loadChat(index);
      });
  }

  componentWillMount(){
      this.getSelfParticipatedChatIds();
  }

  startChat(){
      var chatId = "-Kw2Q76uMnXg-HSUMtkb";
      var chatId = this.getOldChatIdOrStartNewChat();
      this.setState({
          chatId: chatId,
          chatWindowVisible: "chatWindowVisible"
      });
  }

  getOldChatIdOrStartNewChat(){
      if(0===1){
          console.log('');
      }else{
          return this.startNewChat();
      }
  }

  startNewChat(){
    let uidSelf = auth.currentUser.uid;
    let uidPartner = this.state.partner;
    let participants = {};
    participants[uidSelf] = true;
    participants[uidPartner]= true;
    let chatref = db.ref('chats');
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
    let selfRef = db.ref('users/'+uidSelf+'/privateButAddable/chats/'+newChatId);
    let partnerRef = db.ref('users/'+uidPartner+'/privateButAddable/chats/'+newChatId);
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
            R8KuDqOLXzL92SmSmm31WaxF21U2
            <input type="text" value={this.state.partner} onChange={this.handleUidChange.bind(this)} placeholder="Enter partner uid"/><br/>
            <Button color="success" onClick={this.startChat.bind(this)}>Start Chat</Button>
            <ChatWindow chatId={this.state.chatId} chatWindowVisible={this.state.chatWindowVisible}/>
        </div>
    );
  }
}
