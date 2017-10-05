import React, { Component } from 'react';
import logo from '../logo.svg';
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
        var usereference = firebaseApp.database().ref('users');
        var list = [];
        var updateUsers = (users) =>{
            this.setState({content : users});
        }
        usereference.on('value', function(snapshot) {
        var current_users = snapshot.val();
        for (var key in current_users){
            var username;
            if (snapshot.child(key + '/isConnected').val() == true) {
                if (snapshot.hasChild(key + '/privateFields/email'))
                    username = snapshot.child(key + '/privateFields/email').val();
                else if(snapshot.hasChild(key + '/privateFields/phone_number'))
                    username = snapshot.child(key + '/privateFields/phone_number').val();
                if(username != null){
                    list.push({
                      user: username.toString(),
                    });
                }
              }
          }
          updateUsers(list);
        });
    }


  render() {

        var content = this.state.content.map((users) =>
          <Nav>
          <NavText>{users.user}</NavText>
          </Nav>
        );

    return (
    <div style={{background: '#2c3e50', color: '#FFF', width: 200}}>
        <SideNav>
          <Nav>
            <NavText>
            Online Users
            </NavText>
            {content}
          </Nav>
        </SideNav>
    </div>

    );
  }
}
