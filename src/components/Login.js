import React, { Component } from 'react';
import logo from '../logo.svg';
import '../App.css';
import './css/Login.css';
import {firebaseApp, auth, googleProvider} from '../firebase'

export default class Login extends Component {

  loginWithGoogle = ()=>{
    console.log('signin with google');
    auth.signInWithPopup(googleProvider).then(function (result) {
    //   this.createUserIfNotExists();
    //   this.setState({redirectToReferrer: true});
    
    }.bind(this));
  }

  render() {
    return (
        <div className="container text-center col-md-6">
        <form className="form-signin">
          <h2 className="form-signin-heading">
            Please sign in
          </h2>
          <label for="inputEmail" className="sr-only">Email address</label>
          <input type="email" id="inputEmail" className="form-control" placeholder="Email address" required autofocus/>
          <label for="inputPassword" className="sr-only">Password</label>
          <input type="password" id="inputPassword" className="form-control" placeholder="Password" required/>
          <div className="checkbox">
            <label>
              <input type="checkbox" value="remember-me"/> Remember me
            </label>
          </div>
          <button className="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
        </form>
        <button className="btn btn-lg btn-primary btn-block" onClick={this.loginWithGoogle}>Google signin</button>
    </div>
    );
  }
}
