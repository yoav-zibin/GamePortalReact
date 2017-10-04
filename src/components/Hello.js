import React, { Component } from 'react';
import logo from '../logo.svg';
import '../App.css';
import firebase from 'firebase';
import './css/Login.css';
import {firebaseApp, auth, googleProvider, isAuthenticated, db} from '../firebase';
import UserList from './UserList'
export default class Hello extends Component {


  render() {
        var usereference = firebaseApp.database().ref('users');
        var list = [];
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
        });

        var content = list.map((users) =>
        <div>
          <h3>{users.user}</h3>
          <p>{users.online}</p>
        </div>
        );

        console.log(list);
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