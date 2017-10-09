import React, { Component } from 'react';
import '../App.css';
import firebase from 'firebase';
import './css/Hello.css';
import {firebaseApp, auth, googleProvider, isAuthenticated, db} from '../firebase';
import SideNav, { Nav, NavIcon, NavText} from 'react-sidenav';
import Chat from './Chat'


export default class Hello extends Component {

    constructor(){
        super();
        this.state = {
            content : [],
            chats: []
        };
    }

    componentDidMount(){
        var usereference = firebaseApp.database().ref('recentlyConnected');
        var updateUsers = (users) =>{
            this.setState({content : users});
        }
        usereference.on('value', function(snapshot) {
            var current_users = snapshot.val();
            var list = [];
            for (var key in current_users){
                var uid = snapshot.child(key + '/uid').val();
                var usernameRef = db.ref('users/'+uid+'/publicFields/displayName')
                usernameRef.once('value').then(function(snapshot) {
                    var username = snapshot.val();
                    list.push({
                      user: username.toString(),
                    });
                    updateUsers(list);
                });;
              }
        });

        var uid = auth.currentUser.uid;
        var chatReference = firebaseApp.database().ref('users/'+uid+'/privateButAddable/chats');
        var updatechats = (chats) =>{
            this.setState({chats : chats});
        }
        chatReference.on('value', function(snapshot) {
            var chatIds = snapshot.val();
            var list = [];
            for (var key in chatIds){
                list.push({
                  chat: key.toString(),
                });
            }
            updatechats(list);
        });
    }


  render() {

    var content = this.state.content.map((users) =>
      <Nav>
      <NavText>{users.user}</NavText>
      </Nav>
    );

    var chats = this.state.chats.map((chats) =>
      <Nav>
      <NavText>{chats.chat}</NavText>
      </Nav>
    );

    return (
    <div className="root-container">
        <div className="side-nav">
            <SideNav highlightBgColor="#00bcd4">
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

        <div className="play-arena">
            PLAY ARENA
        </div>
        <div className="side-chat">
            <Chat/>
        </div>

    </div>

    );
  }
}
