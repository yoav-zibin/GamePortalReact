import firebase from 'firebase'
var config = {
  apiKey: "AIzaSyDA5tCzxNzykHgaSv1640GanShQze3UK-M",
  authDomain: "universalgamemaker.firebaseapp.com",
  databaseURL: "https://universalgamemaker.firebaseio.com",
  projectId: "universalgamemaker",
  storageBucket: "universalgamemaker.appspot.com",
  messagingSenderId: "144595629077"
};
var uiConfig = {
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
export const firebaseApp = firebase.initializeApp(config);
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const auth = firebaseApp.auth();
export const db = firebaseApp.database();
export const isAuthenticated = () => {
  return !!auth.currentUser;
}
var firebaseui = require('firebaseui');
var ui = new firebaseui.auth.AuthUI(firebase.auth());
//ui.start('#firebaseui-auth-container', uiConfig);

ui.start('#firebaseui-auth-container', {
  signInSuccessUrl: 'http://localhost:3000/',
  tosUrl: '<your-tos-url>',
  signInOptions: [
    {
      provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
      recaptchaParameters: {
        type: 'image', // 'audio'
        size: 'normal', // 'invisible' or 'compact'
        badge: 'inline' //' bottomright' or 'inline' applies to invisible.
      },
      defaultCountry: 'US' // Set default country to the United Kingdom (+44).
    }
  ]
});