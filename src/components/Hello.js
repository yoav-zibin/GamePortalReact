import React, { Component } from 'react';
import '../App.css';
import firebase from 'firebase';
import './css/Hello.css';
import {firebaseApp, auth, googleProvider, isAuthenticated, db} from '../firebase';
import SideNav, { Nav, NavIcon, NavText} from 'react-sidenav';
import Chat from './Chat'
import ChatforGroup from './ChatforGroup'


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
            var myuid = auth.currentUser.uid;
            for (var key in current_users){
                var uid = snapshot.child(key + '/uid').val();
                if (uid == myuid) continue;
                var usernameRef = db.ref('users/'+uid+'/publicFields/displayName')
                usernameRef.once('value').then(function(snapshot) {
                    var username = snapshot.val();
                    if(username!=null){
                        list.push({
                          uid: uid,
                          user: username.toString(),
                        });
                        updateUsers(list);
                    }
                });
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
            /*    var chatsReference = firebaseApp.database().ref('chats/'+ key +'/participants');
                chatsReference.once('value').then(function(snapshot) {
                    var participantIds = snapshot.val();
                    for(var key in participantIds) {
                        if(key!==uid) {
                            var displayNameReference = firebaseApp.database().ref('users/'+key+'/publicFields/displayName');
                            displayNameReference.once('value').then(function(snapshot) {
                                var participantName = snapshot.val();
                                list.push({
                                    chat: participantName.toString(),
                                })
                            })
                        }
                    }
                })*/
                list.push({
                    chat: key,
                })            
            updatechats(list);
         }
        });
    }


  render() {

    console.log(this.state.content);
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
            <SideNav highlightBgColor="#00bad4">
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
            <div>PLAY ARENA</div>
            <div>reactportal: R8KuDqOLXzL92SmSmm31WaxF21U2</div>
            <div>xw1449@nyu.edu: Kb72AVDAJdZNbV3QB1HDG8ESzvM2</div>
            <div>kathywxt@gmail.com: ngWOnVjnoISjeycllrr4yEeVNPl1</div>
            <div>ssg441@nyu.edu: p0t6ex7Wgaf6jWdBd5lG8SfXxcU2</div>
            <div>yq577@nyu.edu: LwnimAsjHsR9uOvfIaj0FqcTsrE2</div>
        </div>

        <div className="side-chat">
            <ChatforGroup/>
        </div>

    </div>

    );
  }
}
