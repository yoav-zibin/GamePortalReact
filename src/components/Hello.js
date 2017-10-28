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
            spec: null
        };
        this.playArena = null;
    }

    componentDidMount(){
        var usereference = firebaseApp.database().ref('gamePortal/recentlyConnected');
        var updateUsers = (users) =>{
            this.setState({content : users});
        }
        usereference.on('value', function(snapshot) {
            var current_users = snapshot.val();
            var list = [];
            var myuid = auth.currentUser.uid;
            for (var key in current_users){
                var uid = snapshot.child(key + '/userId').val();
                if (uid == myuid) continue;
                var usernameRef = db.ref('users/'+uid+'/publicFields/displayName')
                usernameRef.once('value').then(function(snapshot) {
                    var username = snapshot.val();
                    if(username!=null){
                        list.push({
                          uid: snapshot.ref.parent.parent.key,
                          user: username.toString(),
                        });
                        updateUsers(list);
                    }
                });
              }
        });

        var uid = auth.currentUser.uid;
        var chatReference = firebaseApp.database().ref('users/'+uid+'/privateButAddable/groups');
        var updatechats = (chats) =>{
            this.setState({chats : chats});
        }
        chatReference.on('value', function(snapshot) {
            var chatIds = snapshot.val();
            var list = [];
            for (var key in chatIds){
                var groupref = db.ref('gamePortal/groups/' + key + '/groupName');
                groupref.once('value').then(function(snapshot) {
                    var groupname = snapshot.val();
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
    if (parent != null) {
        parent = parent.toString()
        if (parent == 'recently-connected'){
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
            this.setState({props: list});
        }
    }
  }

  render() {
    var content = this.state.content.map((users) =>
      <Nav id={users.uid}>
      <NavText>{users.user}</NavText>
      </Nav>
    );

    var chats = this.state.chats.map((chats) =>
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
            <ChatforGroup myprops={this.state.props}/>
        </div>
    </div>
    );
  }
}
