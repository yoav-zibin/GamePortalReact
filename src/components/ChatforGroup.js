import React, { Component } from 'react';
import { Button } from 'reactstrap';
import ChatWindow from './ChatWindow';
import {db, auth, firebaseApp} from '../firebase';
import firebase from 'firebase';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

export default class ChatforGroup extends Component {

  constructor(){
      super();
      this.state = {
          chatId: "",
          chatName: "",
          partner: [{value: '', label: ''}],
          partnerList: [],
          chatWindowVisible: "chatWindowInvisible",
          onlineUsers: [{value: '', label: ''}]
      };
      this.chats = [];

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

  getOnlineUsers(){


        var usereference = firebaseApp.database().ref('gamePortal/recentlyConnected');
        var updateUsers = (users) =>{
            this.setState({onlineUsers : users});
        }
        usereference.on('value', function(snapshot) {
            var current_users = snapshot.val();
            var list = [];
            var myuid = auth.currentUser.uid;
            for (var key in current_users){
                var uid = snapshot.child(key + '/userId').val();
                if (uid == myuid) continue;

                var usernameRef = db.ref('users/'+uid+'/publicFields')
                usernameRef.once('value').then(function(snapshot) {
                    var isConnected = snapshot.child('/isConnected').val();
                    if(isConnected == true) {
                      var username = snapshot.child('/displayName').val();
                      if(username!=null){
                          list.push({
                            value: snapshot.ref.parent.key,
                            label: username.toString(),
                          })
                          updateUsers(list);
                      }
                     }
                });
              }
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
      this.getOnlineUsers();


  }

  startChat(){
      var chatId = this.getOldChatIdOrStartNewChat();
      console.log("mylog,", this.props.myprop);
      this.setState({
          chatId: chatId,
          chatWindowVisible: "chatWindowVisible"
      });
  }

  addUser(){
    var isThere = false;
    for(var partner in this.state.partnerList) {
      if(this.state.partner.value === this.state.partnerList[partner].value) {
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
          var nofparticipants = 0;
          for(var partnerIndex in this.state.partnerList) {
            if (this.state.partnerList[partnerIndex].value in chat.participants) {
              exsistPartners ++;
            }
          }

          for(var pt in this.chats[index].participants) {
            nofparticipants++;
          }

          if(nofparticipants === this.state.partnerList.length+1) {
            if (nofparticipants === exsistPartners+1) return chat.id;
          } 
      }
      return this.startNewChat();
  }

  startNewChat(){
    let uidSelf = auth.currentUser.uid;
    let uidPartners = this.state.partnerList;

    let chatRef = db.ref('gamePortal/groups');

    var participantId = auth.currentUser.uid;

    let me = {};
    me[participantId] = {participantIndex : 0};
    let newgroupinfo = {
        createdOn: firebase.database.ServerValue.TIMESTAMP,
        groupName: this.state.chatName,
        matches: "",
        participants: me,
    }

    let newChat = chatRef.push(newgroupinfo);

    let newChatId = newChat.key;

    var st = 'gamePortal/groups/' + newChatId + "/participants/";
    var indexnum = 1;
    for(var index in uidPartners) {
      db.ref(st + uidPartners[index].value).set({participantIndex : indexnum});
      indexnum++;
    }

    let newChatInfo = {
        addedByUid: auth.currentUser.uid,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    let selfRef = db.ref('users/'+uidSelf+'/privateButAddable/groups/'+newChatId);
    selfRef.set(newChatInfo);

    for(var index in uidPartners){
      let partnerRef = db.ref('users/'+uidPartners[index].value +'/privateButAddable/groups/'+newChatId);
      partnerRef.set(newChatInfo);
    }

    return newChatId;
  }

  handleUidChange(e){
      this.setState({partner: e.target.value})
  }

  handleUidsChange(e){
      this.setState({partnerList: e.target.value});

  }

  handleCNameChange(e){
      this.setState({chatName: e.target.value});

  }
  logChange(val) {
      console.log('Selected: ', val);
      this.setState({partner: val})
      console.log(this.state.partner);
    }

  render() {
    var partnerids = this.state.partnerList.map((user) =>
      <div>{user.label}</div>
    );

    var options = [
      { value: 'R8KuDqOLXzL92SmSmm31WaxF21U2', label: 'reactportal' },
      { value: 'Kb72AVDAJdZNbV3QB1HDG8ESzvM2', label: 'Xintong Wang' },
      { value: 'p0t6ex7Wgaf6jWdBd5lG8SfXxcU2', label: 'ssg441@nyu.edu' },
      { value: 'LwnimAsjHsR9uOvfIaj0FqcTsrE2', label: 'yq577@nyu.edu' }     
    ];

    return (

        <div>
            Chat
            Partners: <br/>
            {partnerids}
            <input type="text" value={this.state.chatName} onChange={this.handleCNameChange.bind(this)} placeholder="Enter group name"/><br/>
            <hr/>
            
            <Select
              name="form-field-name"
              value={this.state.partner}
              options={this.state.onlineUsers}
              onChange={this.logChange.bind(this)}
            />

            <Button color="success" onClick={this.addUser.bind(this)}>Add User</Button>
            <Button color="success" onClick={this.startChat.bind(this)}>Start Chat</Button>
            <ChatWindow chatId={this.state.chatId} chatWindowVisible={this.state.chatWindowVisible}/>

        </div>

    );
  }
}
