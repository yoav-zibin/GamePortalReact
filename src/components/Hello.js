import React, { Component } from 'react';
import '../App.css';
import firebase from 'firebase';
import './css/Login.css';
import {firebaseApp, auth, googleProvider, isAuthenticated, db} from '../firebase';
import SideNav, { Nav, NavIcon, NavText} from 'react-sidenav';


export default class Hello extends Component {

    constructor(){
        super();
        this.state = {content : []};
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
    }


  render() {

        var content = this.state.content.map((users) =>
          <Nav>
          <NavText>{users.user}</NavText>
          </Nav>
        );

    return (
    <div style={{background: '#2c3e50', color: '#FFF', width: 300}}>
        <SideNav>
          <Nav>
            <NavText>
            Recently Connected
            </NavText>
            {content}
          </Nav>
        </SideNav>
    </div>

    );
  }
}
