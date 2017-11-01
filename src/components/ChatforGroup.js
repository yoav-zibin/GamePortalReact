import React, { Component } from 'react';
import { Button } from 'reactstrap';
import ChatWindow from './ChatWindow';
import {db, auth, firebaseApp} from '../firebase';
import firebase from 'firebase';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import './css/ChatforGroup.css'

export default class ChatforGroup extends Component {

  constructor(){
      super();
      this.state = {
          chatId: "",
          chatName: [],
          partner: [{value: '', label: ''}],
          partnerList: [],
          chatWindowVisible: "chatWindowInvisible",
          onlineUsers: [{value: '', label: ''}],
          chatInfoVisible: "chatInfoVisible",
      };
      this.chats = [];
      this.prevChatId = "";

  }

  getSelfParticipatedChatIds(){
      let self = this;
      let selfChatIdsRef = db.ref("users/"+auth.currentUser.uid+"/privateButAddable/groups");
      selfChatIdsRef.on('value', function(snapshot) {
        self.selfChatIds = [];
        for (let key in snapshot.val()){
            self.selfChatIds.push(key);
        }
        if(self.selfChatIds.length > 0)
            self.loadChat(0);
      });
  }

  getOnlineUsers(){
        let usereference = firebaseApp.database().ref('gamePortal/recentlyConnected');
        let updateUsers = (users) =>{
            this.setState({onlineUsers : users});
        }
        usereference.on('value', function(snapshot) {
            let current_users = snapshot.val();
            let list = [];
            let myuid = auth.currentUser.uid;
            for (let key in current_users){
                let uid = snapshot.child(key + '/userId').val();
                if (uid === myuid) continue;

                let usernameRef = db.ref('users/'+uid+'/publicFields')
                usernameRef.once('value').then(function(snapshot) {
                    let isConnected = snapshot.child('/isConnected').val();
                    if(isConnected === true) {
                      let username = snapshot.child('/displayName').val();
                      if(username!==null){
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
      let self = this;
      let chatId = self.selfChatIds[index];
      let chatReference = db.ref("gamePortal/groups/"+chatId);
      index = index + 1;
      chatReference.once('value', function(snapshot) {
        let chat = snapshot.val();
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


  componentDidUpdate() {
    if (this.prevChatId!==this.props.myprops)
      if (this.props.myprops.name === 'group') {
        this.prevChatId = this.props.myprops;
        let id = this.props.myprops.id;
        this.setState({
          chatId: this.props.myprops.id,
          chatWindowVisible: "chatWindowVisible"      
        });
      }
/*    if(this.props.chatInfoVisible === "chatInfoInvisible") {
      this.setState({
          chatInfoVisible:"chatInfoInvisible"
      });
    }*/

  }

  startChat(){
    if(this.state.partnerList.length !== 0)
    {
      let chatId = this.getOldChatIdOrStartNewChat();
      this.setState({
          chatId: chatId,
          chatWindowVisible: "chatWindowVisible",
          chatInfoVisible:"chatInfoInvisible"
      });
    }
  }

  addUser(){
    let isThere = false;
    for(let partner in this.state.partnerList) {
      if(this.state.partner.value === this.state.partnerList[partner].value) {
        isThere = true;
      }
    }
    if(this.state.partnerList.length === 0 || isThere === false)
    {this.state.partnerList.push(this.state.partner);
      this.state.chatName.push(this.state.partner.label);
    }
    this.setState({

    });
  }

  getOldChatIdOrStartNewChat(){
      for(let index in this.chats){
          let chat = this.chats[index];
          let exsistPartners = 0;
          let nofparticipants = 0;
          for(let partnerIndex in this.state.partnerList) {
            if (this.state.partnerList[partnerIndex].value in chat.participants) {
              exsistPartners ++;
            }
          }
          for(let pt in this.chats[index].participants) {
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

    let participantId = auth.currentUser.uid;

    let me = {};
    me[participantId] = {participantIndex : 0};
    let chatName = "";
    if(this.state.chatName[0].length > 10)
      {chatName = this.state.chatName[0].substring(0,9) + "... and " + (this.state.chatName.length).toString() + " others";}
    else
      {chatName = this.state.chatName[0] + " and " + (this.state.chatName.length).toString() + " others";}
    let newgroupinfo = {
        createdOn: firebase.database.ServerValue.TIMESTAMP,
        groupName: chatName,
        matches: "",
        messages: null,
        participants: me,
    }

    let newChat = chatRef.push(newgroupinfo);

    let newChatId = newChat.key;

    let st = 'gamePortal/groups/' + newChatId + "/participants/";
    let indexnum = 1;
    for(let index in uidPartners) {
      db.ref(st + uidPartners[index].value).set({participantIndex : indexnum});
      indexnum++;
    }

    let newChatInfo = {
        addedByUid: auth.currentUser.uid,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    let selfRef = db.ref('users/'+uidSelf+'/privateButAddable/groups/'+newChatId);
    selfRef.set(newChatInfo);

    for(let index in uidPartners){
      let partnerRef = db.ref('users/'+uidPartners[index].value +'/privateButAddable/groups/'+newChatId);
      partnerRef.set(newChatInfo);
    }

    return newChatId;
  }

  newChat(){
    this.setState({
          chatWindowVisible: "chatWindowInvisible",
          chatInfoVisible: "chatInfoVisible",
          chatId: "",
          chatName: [],
          partner: [{value: '', label: ''}],
          partnerList: []
    })
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

    let partnerids = this.state.partnerList.map((user) =>
      <div>{user.label}</div>
    );

    let options = [
      { value: 'R8KuDqOLXzL92SmSmm31WaxF21U2', label: 'reactportal' },
      { value: 'Kb72AVDAJdZNbV3QB1HDG8ESzvM2', label: 'Xintong Wang' },
      { value: 'p0t6ex7Wgaf6jWdBd5lG8SfXxcU2', label: 'ssg441@nyu.edu' },
      { value: 'LwnimAsjHsR9uOvfIaj0FqcTsrE2', label: 'yq577@nyu.edu' }     
    ];

    return (
        <div ChatforGroup>
          <Button className='Button1' onClick={this.newChat.bind(this)}>NewChat</Button>
          <div className={this.state.chatInfoVisible}>
            Chat
            Partners: <br/>
            {partnerids}
            Group Name: <input type="text" value={this.state.chatName} onChange={this.handleCNameChange.bind(this)} placeholder="Enter group name"/><br/>
            <hr/>
            
            <Select
              name="form-field-name"
              value={this.state.partner}
              options={this.state.onlineUsers}
              onChange={this.logChange.bind(this)}
            />

            <Button color="success" onClick={this.addUser.bind(this)}>Add User</Button>
            <Button color="success" onClick={this.startChat.bind(this)}>Start Chat</Button>
          </div>
            <ChatWindow chatId={this.state.chatId} chatWindowVisible={this.state.chatWindowVisible}/>
            
        </div>

    );
  }
}
