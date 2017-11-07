import React, { Component } from 'react';
import logo from '../logo.svg';
import '../App.css';
import './css/Login.css';
import {firebaseApp, auth, googleProvider, isAuthenticated, db} from '../firebase';
import firebase from 'firebase';
import Hello from './Hello';
import PhoneAuth from './PhoneAuth';
import {getName} from '../pokemon';
import Main from './Main';
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
        let userData = null;
        if(user.isAnonymous){
            userData = {
              'privateFields': {
                  'email': "anonymous.user@gmail.com",
                  'createdOn': firebase.database.ServerValue.TIMESTAMP,
                  facebookId: "",
                  githubId: "",
                  googleId: "",
                  phoneNumber: "",
                  pushNotificationsToken: "",
                  twitterId: "",
              },
              'publicFields': {
                'avatarImageUrl': 'https://ssl.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png',
                'displayName': getName(),
                'isConnected': true,
                'lastSeen':firebase.database.ServerValue.TIMESTAMP
              }
            };
        }else{
            userData = {
              'privateFields': {
                  'email': user.email,
                  'createdOn': firebase.database.ServerValue.TIMESTAMP,
                  facebookId: "",
                  githubId: "",
                  googleId: "",
                  phoneNumber: "",
                  pushNotificationsToken: "",
                  twitterId: "",
              },
              'publicFields': {
                'avatarImageUrl': user.photoURL || 'https://ssl.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png',
                'displayName': user.displayName || user.email,
                'isConnected': true,
                'lastSeen':firebase.database.ServerValue.TIMESTAMP
              }
            };
        }

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
        var loginPromise = auth.signInWithEmailAndPassword(email, password).catch(function(error) {
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
        loginPromise.then(this.createUserIfNotExists);
      }
  }


  loginWithGoogle = ()=>{
    // console.log('signin with google');
    auth.signInWithPopup(googleProvider).then(function (result) {
    this.createUserIfNotExists();
    //   this.setState({redirectToReferrer: true});
    }.bind(this));
  }

  // If the user logs in successfully using this API,
  // onAuthStateChanged will be called which is registered in App.js
  // User_id for anonymous user will be received there.
  loginAnonymous(){
      var loginPromise = auth.signInAnonymously().catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.error(errorCode, errorMessage);
      });
      loginPromise.then(this.createUserIfNotExists);
  }

  state = {
    redirectToReferrer: false
  }

  loginWithPhone = ()=>{
      window.location.reload();
  }

  render() {
    return (
        <div className="signin-super-container">
            <div className="container col-md-6 col-xs-12 signin-root">
                <h2 className="form-signin-heading">
                    Sign In
                </h2>
                <div className="login-container">
                    <div className="signin-container col-md-6 col-xs-12">
                        <label htmlFor="inputEmail" className="sr-only">Email address</label>
                        <input type="email" id="inputEmail" className="form-control" placeholder="Email address" required autoFocus/>
                        <label htmlFor="inputPassword" className="sr-only">Password</label>
                        <input type="password" id="inputPassword" className="form-control" placeholder="Password" required/>
                        <br />
                        <button id = "signin" className="btn btn-md btn-primary btn-block" onClick={this.handleSubmit} >Log In</button>
                    </div>
                    <div className="login-options-container col-md-6 col-xs-12">
                        <button className="btn btn-md btn-primary btn-block" onClick={this.loginWithGoogle} >Google Signin</button>
                        <button className="btn btn-md btn-primary btn-block" onClick={this.loginWithPhone} > {<Link to='/PhoneAuth' style={{decoration: 'none', color: 'white'}}>Signin with Phone</Link>}</button>
                        <button className="btn btn-md btn-primary btn-block" onClick={this.loginAnonymous.bind(this)}> Anonymous Signin</button>
                    </div>
                </div>
            </div>
        </div>
    );
  }
}
