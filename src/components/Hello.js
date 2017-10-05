import React, { Component } from 'react';
import logo from '../logo.svg';
import '../App.css';
import firebase from 'firebase';
import './css/Login.css';
import {firebaseApp, auth, googleProvider, isAuthenticated, db} from '../firebase';
export default class Hello extends Component {

    constructor(){
        super();
        this.state = {content : []};
    }

    componentDidMount(){
        var usereference = firebaseApp.database().ref('users');
        var list = [];
        var updateUsers = (users) =>{
            console.log(users);
            this.setState({content : users});
        }
        usereference.on('value', function(snapshot) {
        var current_users = snapshot.val();
        for (var key in current_users){
            var is_online = "Offline";
            var username;
            if (snapshot.hasChild(key + '/privateFields')) {
                if (snapshot.hasChild(key + '/connections'))
                    is_online = "Online";
                if (snapshot.hasChild(key + '/privateFields/email'))
                    username = snapshot.child(key + '/privateFields/email').val();
                else
                    username = snapshot.child(key + '/privateFields/phone_number').val();

                list.push({
                  key : key,
                  user: username,
                  online: is_online
                });
              }
          }
          updateUsers(list);
        });
    }


  render() {

        var content = this.state.content.map((users) =>
        <div>
          <h3>{users.user}</h3>
          <p>{users.online}</p>
        </div>
        );

        console.log(content);

    return (
        <div className="container text-center col-md-6">
        <form className="form-signin">
          <h2 className="form-signin-heading">
            Welcome!
          </h2>
          {content}
          </form>
    </div>
    );
  }
}
