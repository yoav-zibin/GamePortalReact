import React, { Component } from 'react';
import logo from '../logo.svg';
import '../App.css';
import './css/Login.css';
import {firebaseApp, auth, googleProvider, isAuthenticated, db} from '../firebase';
import Hello from './Hello'
import PhoneAuth from './PhoneAuth'

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  withRouter
} from 'react-router-dom'

function setErrorMsg(error) {
  return {
    loginMessage: error
  }
}



const fakeAuth = {
  isAuthenticated: false,
  authenticate(cb) {
    this.isAuthenticated = true
    setTimeout(cb, 100) // fake async
  },
  signout(cb) {
    this.isAuthenticated = false
    setTimeout(cb, 100)
  }
}

export default class Login extends Component {

    createUserIfNotExists = () => {
      if (isAuthenticated()) {
        let user = auth.currentUser;
        // console.log(user);
        let usersRef = db.ref("users");
        let userData = {
          'privateFields': {
              'email': user.email
          },
          'publicFields': {
            'avatarImageUrl': user.photoURL || '',
            'displayName': user.displayName || user.email
          }
        };

        usersRef.child(user.uid).transaction(function(currentUserData) {
          if (currentUserData === null || !currentUserData.email) {
            return userData;
          }
        });
      }
    }


  handleSubmit = () => {
      if (auth.currentUser) {
        // [START signout]
        auth.signOut();
        // [END signout]
      } else {
        var email = document.getElementById('inputEmail').value;
        var password = document.getElementById('inputPassword').value;
        if (email.length < 4) {
          alert('Please enter an email address.');
          return;
        }
        if (password.length < 4) {
          alert('Please enter a password.');
          return;
        }
        // Sign in with email and pass.
        // [START authwithemail]
        auth.signInWithEmailAndPassword(email, password).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // [START_EXCLUDE]
          if (errorCode === 'auth/wrong-password') {
            alert('Wrong password.');
          } else {
            alert(errorMessage);
          }
          console.log(error);
          document.getElementById('signin').disabled = false;
          // [END_EXCLUDE]
        });
        // [END authwithemail]
      }
      this.createUserIfNotExists();
  }


  loginWithGoogle = ()=>{
    // console.log('signin with google');
    auth.signInWithPopup(googleProvider).then(function (result) {
    this.createUserIfNotExists();
    //   this.setState({redirectToReferrer: true});
    }.bind(this));
  }

  state = {
    redirectToReferrer: false
  }

  loginWithPhone = ()=>{
      window.location.reload();
  }

  render() {
    return (
        <div className="container text-center col-md-3">
        <br />
          <h2 className="form-signin-heading">
          Please Log in
          </h2>
          <label for="inputEmail" className="sr-only">Email address</label>
          <input type="email" id="inputEmail" className="form-control" placeholder="Email address" required autofocus/>
          <label for="inputPassword" className="sr-only">Password</label>
          <input type="password" id="inputPassword" className="form-control" placeholder="Password" required/>
          <br />
          <button id = "signin" className="btn btn-lg btn-primary btn-block" onClick={this.handleSubmit} > {<Link to='/' style={{decoration: 'none', color: 'white'}}>Log in with Email</Link>}</button>
          <button className="btn btn-lg btn-primary btn-block" onClick={this.loginWithGoogle} > {<Link to='/' style={{decoration: 'none', color: 'white'}}>Log in with Google</Link>}</button>
          <button className="btn btn-lg btn-primary btn-block" onClick={this.loginWithPhone} > {<Link to='/PhoneAuth' style={{decoration: 'none', color: 'white'}}>Log in with Phone</Link>}</button>
    </div>
    );
  }
}
