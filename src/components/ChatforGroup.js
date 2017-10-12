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
          partnerList: [],
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
      if (index === 0){
          this.chats = [];
      }
      var self = this;
      var chatId = self.selfChatIds[index];
      var chatReference = db.ref("chats/"+chatId);
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

  addUser(){
    var isThere = false;
    for(var partner in this.state.partnerList) {
      if(this.state.partner === this.state.partnerList[partner]) {
        isThere = true;
      }
    }
    if(this.state.partnerList.length === 0 || isThere === false)
    {this.state.partnerList.push(this.state.partner);}
    this.setState({

    });
  }

  getOldChatIdOrStartNewChat(){
      for(var index in this.chats){
          var chat = this.chats[index];
          var exsistPartners = 0;
          var partnerCount = 0;

          for(var partnerIndex in this.state.partnerList) {
            partnerCount ++;
            if (this.state.partnerList[partnerIndex] in chat.participants) {
              exsistPartners ++;
            }
          }
          if (exsistPartners === partnerCount) return chat.id;
      }
      return this.startNewChat();
  }

  startNewChat(){
    let uidSelf = auth.currentUser.uid;
    let uidPartners = this.state.partnerList;
    let participants = {};
    participants[uidSelf] = true;
    for(var index in uidPartners) {
      participants[uidPartners[index]]= true;
    }
    
    let chatref = db.ref('chats');
    let newChat = chatref.push({
        participants:participants,
        createdOn: firebase.database.ServerValue.TIMESTAMP,
        groupName: "ReactPortaltest"
    });
    let newChatId = newChat.key;
    let newChatInfo = {
        addedByUid: auth.currentUser.uid,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    let selfRef = db.ref('users/'+uidSelf+'/privateButAddable/chats/'+newChatId);
    selfRef.set(newChatInfo);

    for(var index in uidPartners){
      let partnerRef = db.ref('users/'+uidPartners[index]+'/privateButAddable/chats/'+newChatId);
      partnerRef.set(newChatInfo);
    }
    
    return newChatId;
  }

  handleUidChange(e){
      this.setState({partner: e.target.value})
  }

  handleUidsChange(e){
      this.setState({partnerList: e.target.value})
  }

  render() {
    var partnerids = (
      <div>With: <input type="text" value={this.state.partnerList} onChange={this.handleUidsChange.bind(this)} /></div>
    );

    return (
        <div>
            {partnerids}
            <input type="text" value={this.state.partner} onChange={this.handleUidChange.bind(this)} placeholder="Enter partner uid"/><br/>
            <Button color="success" onClick={this.addUser.bind(this)}>Add User</Button>
            <Button color="success" onClick={this.startChat.bind(this)}>Start Chat</Button>
            <ChatWindow chatId={this.state.chatId} chatWindowVisible={this.state.chatWindowVisible}/>
        </div>
    );
  }
}
