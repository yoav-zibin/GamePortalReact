import React, { Component } from 'react';
import '../App.css';
import firebase from 'firebase';
import './css/Hello.css';
import {firebaseApp, auth, googleProvider, isAuthenticated, db} from '../firebase';
import SideNav, { Nav, NavIcon, NavText} from 'react-sidenav';
import ChatforGroup from './ChatforGroup';
import PlayArena from './PlayArena';
import GameSelector from './GameSelector';
import AddParticipants from './AddParticipants';


export default class Hello extends Component {

    constructor(){
        super();
        this.state = {
            content : [],
            chats: [],
            props: {name: "hello", id: null, displayName:null},
            chatInfoVisible: "chatInfoVisible",
            chatWindowVisible: "chatWindowInvisible",
            spec: null
        };
        this.playArena = null;
        this.participants = [];
        this.specId = null;
    }

    componentDidMount(){
        let self = this;
        let usereference = firebaseApp.database().ref('gamePortal/recentlyConnected');
        let updateUsers = (users) =>{
            this.setState({content : users});
        }
        usereference.on('value', function(snapshot) {
            let current_users = snapshot.val();
            let list = [];
            let myuid = auth.currentUser.uid;
            for (let key in current_users){
                let uid = snapshot.child(key + '/userId').val();
                if (uid === myuid) continue;
                let usernameRef = db.ref('users/'+uid+'/publicFields/displayName')
                usernameRef.once('value').then(function(snapshot) {
                    let username = snapshot.val();
                    if(username!==null){
                        list.push({
                          uid: snapshot.ref.parent.parent.key,
                          user: username.toString(),
                        });
                        updateUsers(list);
                    }
                }).catch(self.handleFirebaseException);
              }
        });

        let uid = auth.currentUser.uid;
        let chatReference = firebaseApp.database().ref('users/'+uid+'/privateButAddable/groups');
        let updatechats = (chats) =>{
            this.setState({chats : chats});
        }
        chatReference.on('value', function(snapshot) {
            if (!snapshot.exists()){
                return;
            }
            let chatIds = snapshot.val();
            let list = [];
            for (let key in chatIds){
                let groupref = db.ref('gamePortal/groups/' + key + '/groupName');
                groupref.once('value').then(function(snapshot) {
                    let groupname = snapshot.val();
                    list.push({
                        groupid: snapshot.ref.parent.key,
                        name : groupname
                    })
                    updatechats(list);
                }).catch(self.handleFirebaseException);
            }
        });
    }

  setSpec(spec){
      let groupRef = db.ref('gamePortal/groups');
      let participants = {[auth.currentUser.uid]:{participantIndex:1} ,
          [this.participants[0]] :{participantIndex:0}};
      let group = {
          participants: participants,
          messages: '',
          matches: '',
          createdOn: firebase.database.ServerValue.TIMESTAMP,
          groupName: 'ReactPortal'
      };
      let ref = groupRef.push(group);
      this.matchRef = db.ref('gamePortal/groups/'+ref.key+'/matches');
      let match = {
          createdOn: firebase.database.ServerValue.TIMESTAMP,
          gameSpecId: this.specId,
          lastUpdatedOn: firebase.database.ServerValue.TIMESTAMP,
          pieces: ''
      };
      this.matchRef = this.matchRef.push(match);
      this.setState({
          spec: spec
      });
  }

  handleFirebaseException(exception){
      console.log(exception);
  }

  addParticipant(id){
      this.participants.push(id);
  }

  clearParticipants(){
      this.participants = [];
  }

  handleclick(id, parent){
    if (parent !== null) {
        parent = parent.toString()
        if (parent === 'recently-connected'){
            id = id.substring(19);
            let list = {
                name: 'person',
                id: id
            }
            this.setState({props: list});
        }
        else {
            id = id.substring(6);
            let list = {
                name: 'group',
                id: id

            }
            this.setState({
                props: list,
                chatInfoVisible:"chatInfoInvisible",
                chatWindowVisible:"chatWindowVisible"
            });
        }
    }
  }

  setSpecId(id){
      this.specId = id;
  }

  render() {
    let content = this.state.content.map((users) =>
      <Nav id={users.uid}>
      <NavText>{users.user}</NavText>
      </Nav>
    );

    let chats = this.state.chats.map((chats) =>
      <Nav id={chats.groupid}>
      <NavText>{chats.name}</NavText>
      </Nav>
    );

    if(this.state.spec){
        this.playArena = (<PlayArena spec={this.state.spec} matchRef={this.matchRef}/>);
    }

    return (
    <div className="root-container">
        <div className="side-nav">
            <SideNav highlightBgColor="#00bad4" onItemSelection={ (id, parent) => {this.handleclick(id, parent)}} >
              <Nav id="recently-connected">
                <NavText>
                Recently Connected
                </NavText>
                {content}
              </Nav>
              <Nav id="chats">
                <NavText>
                    Chats
                </NavText>
                {chats}
              </Nav>
            </SideNav>
        </div>
        <div className="play-arena-container">
            <GameSelector setSpec={this.setSpec.bind(this)} setSpecId={this.setSpecId.bind(this)}/>
        <AddParticipants addParticipant={this.addParticipant.bind(this)} clearParticipants={this.clearParticipants.bind(this)}/>
            <div className="play-arena-component">
                {this.playArena}
            </div>
        </div>

        <div className="side-chat">
            <ChatforGroup myprops={this.state.props} chatInfoVisible={this.state.chatInfoVisible} chatWindowVisible={this.state.chatWindowVisible}/>
        </div>
    </div>
    );
  }
}
