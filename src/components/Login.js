import React, { Component } from 'react';
import './css/Login.css';
import { auth, googleProvider, facebookProvider, twitterProvider, githubProvider, db} from '../firebase';
import {Link} from 'react-router-dom'
import { toast } from 'react-toastify';

export default class Login extends Component {

  handleSubmit = () => {
      if (auth.currentUser) {
        // [START signout]
        auth.signOut();
        // [END signout]
      } else {
        var email = document.getElementById('inputEmail').value;
        var password = document.getElementById('inputPassword').value;
        if (email.length < 4) {
          toast.error('Please enter an email address.', {position:toast.POSITION.TOP_CENTER});
          return;
        }
        if (password.length < 4) {
          toast.error('Please enter a password.', {position:toast.POSITION.TOP_CENTER});
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
            toast.error('Wrong password.',{position:toast.POSITION.TOP_CENTER});
          } else {
            toast.error(errorMessage, {position:toast.POSITION.TOP_CENTER});
          }
          document.getElementById('signin').disabled = false;
          // [END_EXCLUDE]
      });
        // [END authwithemail]
      }
  }


  loginWithGoogle = ()=>{
    // console.log('signin with google');
    auth.signInWithPopup(googleProvider).then(function (result) {
    //   this.setState({redirectToReferrer: true});
    }).catch(function(error){
        // let errorCode = error.code;
        toast.error(error.message, {position:toast.POSITION.TOP_CENTER});
    });
  }

  addFriends(friends, provider){
      friends.forEach((friend)=>{
          let fbRef = db.ref('gamePortal/userIdIndices/'+provider+'Id/'+friend);
          fbRef.once('value').then((snapshot)=>{
              if(snapshot.exists()){
                  Object.keys(snapshot.val()).forEach((friendUserId)=>{
                      let userRef = db.ref('users/'+auth.currentUser.uid+'/privateFields/friends/'+friendUserId);
                      userRef.once('value').then((snapshot)=>{
                          if(!snapshot.exists()){
                              userRef.set(true);
                          }
                      });
                  });
              }
          });
      });
  }

  loginWithFacebook(){
      let self = this;
      auth.signInWithPopup(facebookProvider).then(function (result) {
          let accessToken = result.credential.accessToken;
          let url = 'https://graph.facebook.com/v2.5/me/friends?limit=50&access_token=' + accessToken;
          fetch(url, {method:'GET'}).then((response)=>{
              if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' +
                  response.status);
                return;
              }
              response.json().then(function(result) {
                let friendsFbIds = [];
                result.data.forEach((friend)=>{
                    friendsFbIds.push(friend.id);
                });
                self.addFriends(friendsFbIds, 'facebook');
              });
          }).catch((error)=>{
              console.log(error);
          });
      }).catch(function(error){
        //   let errorCode = error.code;
          toast.error(error.message, {position:toast.POSITION.TOP_CENTER});
      });
  }

  loginWithTwitter(){
      auth.signInWithPopup(twitterProvider).then(function (result) {
      //   this.setState({redirectToReferrer: true});
      }).catch(function(error){
        //   let errorCode = error.code;
          toast.error(error.message, {position:toast.POSITION.TOP_CENTER});
      });
  }

  loginWithGithub(){
      auth.signInWithPopup(githubProvider).then(function (result) {
      //   this.setState({redirectToReferrer: true});
      }).catch(function(error){
        //   let errorCode = error.code;
          toast.error(error.message,{position:toast.POSITION.TOP_CENTER});
      });
  }

  // If the user logs in successfully using this API,
  // onAuthStateChanged will be called which is registered in App.js
  // User_id for anonymous user will be received there.
  loginAnonymous(){
      auth.signInAnonymously().catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.error(errorCode, errorMessage);
          toast.error(errorMessage,{position:toast.POSITION.TOP_CENTER});
      });
  }

  state = {
    redirectToReferrer: false
  }

  loginWithPhone = ()=>{
      window.location.reload();
  }

  handleKeyDown(event){
      if(event.keyCode === 13){
         this.handleSubmit();
      }
  }

  render() {
    return (
        <div className="signin-super-container">
            <div className="signin-root">
                <h2 className="form-signin-heading">
                    Sign In
                </h2>
                <div className="login-container">
                    <div className="signin-container">
                        <label htmlFor="inputEmail" className="sr-only">Email address</label>
                        <input type="email" id="inputEmail" className="form-control" placeholder="Email address" required autoFocus/>
                        <label htmlFor="inputPassword" className="sr-only">Password</label>
                        <input onKeyDown={this.handleKeyDown.bind(this)} type="password" id="inputPassword" className="form-control" placeholder="Password" required/>
                        <br />
                        <button id = "signin" className="btn btn-md btn-primary btn-block" onClick={this.handleSubmit.bind(this)} >Log In</button>
                    </div>
                    <div className="login-options-container">
                        <div className='login-button-container'>
                            <button className="btn btn-md btn-primary login-button" onClick={this.loginWithGoogle.bind(this)} >Google</button>
                            <button className="btn btn-md btn-primary login-button" onClick={this.loginWithFacebook.bind(this)} >Facebook</button>
                        </div>
                        <div className='login-button-container middle-button-container'>
                            <button className="btn btn-md btn-primary login-button" onClick={this.loginWithGithub.bind(this)} >Github</button>
                            <button className="btn btn-md btn-primary login-button" onClick={this.loginWithTwitter.bind(this)} >Twitter</button>
                        </div>
                        <div className='login-button-container'>
                            <button className="btn btn-md btn-primary login-button" onClick={this.loginWithPhone.bind(this)} > {<Link to='/PhoneAuth' className='link-with-phone' style={{decoration: 'none', color: 'white'}}>With Phone</Link>}</button>
                            <button className="btn btn-md btn-primary login-button" onClick={this.loginAnonymous.bind(this)}>Anonymous</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }
}
