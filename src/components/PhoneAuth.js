import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import firebase from 'firebase';

let uiConfig = {
  signInSuccessUrl: '<url-to-redirect-to-on-success>',
  signInOptions: [
    firebase.auth.PhoneAuthProvider.PROVIDER_ID
  ],
  // Terms of service url.
  tosUrl: '<your-tos-url>',
  recaptchaParameters: {
    'size': 'visible',
  }
};

let firebaseui = require('firebaseui');
let ui = new firebaseui.auth.AuthUI(firebase.auth());


// The Header creates links that can be used to navigate
// between routes.
export default class PhoneAuth extends Component{

    componentDidMount(){
        ui.start('#firebaseui-auth-container', {
          signInSuccessUrl: 'https://yoav-zibin.github.io/GamePortalReact/',
          tosUrl: '<your-tos-url>',
          signInOptions: [
            {
              provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
              recaptchaParameters: {
                type: 'image', // 'audio'
                size: 'normal', // 'invisible' or 'compact'
                badge: 'bottomright' //' bottomright' or 'inline' applies to invisible.
              },
              defaultCountry: 'US' // Set default country to the United Kingdom (+44).
            }
          ]
        });
    }

    render(){
        return(
            <div className="container text-center col-md-6">
            <form className="form-signin">
            	<div id="firebaseui-auth-container"></div>
              </form>
            </div>
        )
    }
}
