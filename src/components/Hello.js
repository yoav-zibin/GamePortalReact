import React, { Component } from 'react';
import '../App.css';
import firebase from 'firebase';
import './css/Hello.css';
import {firebaseApp, auth, googleProvider, isAuthenticated, db} from '../firebase';
import SideNav, { Nav, NavIcon, NavText} from 'react-sidenav';
import ChatforGroup from './ChatforGroup';
import PlayArena from './PlayArena';
import GameSelector from './GameSelector';


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
    }

    componentDidMount(){
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
                });
              }
        });

        let uid = auth.currentUser.uid;
        let chatReference = firebaseApp.database().ref('users/'+uid+'/privateButAddable/groups');
        let updatechats = (chats) =>{
            this.setState({chats : chats});
        }
        chatReference.on('value', function(snapshot) {
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
                });
            }
        });
    }

  setSpec(spec){
      this.setState({
          spec: spec
      });
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
        this.playArena = (<PlayArena spec={this.state.spec}/>);
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
            <GameSelector setSpec={this.setSpec.bind(this)}/>
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
