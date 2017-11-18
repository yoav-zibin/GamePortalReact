import firebase from 'firebase';
import {getName} from './pokemon';

let config = {
  apiKey: "AIzaSyDA5tCzxNzykHgaSv1640GanShQze3UK-M",
  authDomain: "universalgamemaker.firebaseapp.com",
  databaseURL: "https://universalgamemaker.firebaseio.com",
  projectId: "universalgamemaker",
  storageBucket: "universalgamemaker.appspot.com",
  messagingSenderId: "144595629077"
};
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
export const firebaseApp = firebase.initializeApp(config);
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const facebookProvider = new firebase.auth.FacebookAuthProvider();
export const twitterProvider = new firebase.auth.TwitterAuthProvider();
export const githubProvider = new firebase.auth.GithubAuthProvider();
export const auth = firebaseApp.auth();
export const db = firebaseApp.database();
export const messaging = firebase.messaging();

export const storageKey = 'GAME_BUILDER_LOCAL_STORAGE_$UID';
export const isAuthenticated = () => {
  return !!auth.currentUser;
}
let firebaseui = require('firebaseui');
let ui = new firebaseui.auth.AuthUI(firebase.auth());
//ui.start('#firebaseui-auth-container', uiConfig);
let connectedRef = null;
let myConnectionsRef = null;
let lastOnlineRef = null;
let connection = null;
let hidePresenceIntentional = false;

ui.start('#firebaseui-auth-container', {
  signInSuccessUrl: 'http://localhost:3000/',
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

export const addPresenceListeners = () => {
    if(isAuthenticated()){
        const uid = auth.currentUser.uid;
        // stores the timestamp of my last disconnect (the last time I was seen online)
        lastOnlineRef = firebaseApp.database().ref('users/'+uid+'/publicFields/lastSeen');
        myConnectionsRef = firebaseApp.database().ref('users/'+uid+'/publicFields/isConnected');

        connectedRef = firebaseApp.database().ref('.info/connected');
        connectedRef.on('value', function(snapshot) {
          if (snapshot.val() === true) {
            // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)
            myConnectionsRef.set(true);

            // When I disconnect, remove this device
            myConnectionsRef.onDisconnect().set(false);

            // Add this device to my connections list
            // this value could contain info about the device or a timestamp too
            myConnectionsRef.set(true);
            // Attaching a listener so that whenever value is changed to false and if a user
            // is still logged in from some other device, it will again update its value to true
            myConnectionsRef.on('value', function(snapshot) {
                if(hidePresenceIntentional === false && isAuthenticated()){
                    myConnectionsRef.set(true);
                }
            });

            // When I disconnect, update the last time I was seen online
            lastOnlineRef.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
          }
        });
    }
}

export const addToRecentlyConnected = () => {
    let recentlyConnectedRef = db.ref('gamePortal/recentlyConnected');
    let uid = auth.currentUser.uid;
    let userInfo = {
        userId: uid,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    recentlyConnectedRef.push(userInfo);

    // let myKeyRef = recentlyConnectedRef.orderByChild("userId").equalTo(uid);
    // myKeyRef.once("value",snapshot => {
    //     const userData = snapshot.val();
    //     if (userData){
    //         for(let key in userData){
    //             db.ref('gamePortal/recentlyConnected/'+key).set(null);
    //         }
    //     }
    //     recentlyConnectedRef.push(userInfo);
    // });


}

export const createUserIfNotExists = () => {
  if (isAuthenticated()) {
    let user = auth.currentUser;
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
          privateFields: {
              'email': user.email || "anonymous.user@gmail.com",
              'createdOn': firebase.database.ServerValue.TIMESTAMP,
              facebookId: "",
              githubId: "",
              googleId: "",
              phoneNumber: "",
              pushNotificationsToken: "",
              twitterId: "",
          },
          publicFields: {
            'avatarImageUrl': user.photoURL || 'https://ssl.gstatic.com/images/branding/product/1x/avatar_circle_blue_512dp.png',
            'displayName': user.displayName || getName(),
            'isConnected': true,
            'lastSeen':firebase.database.ServerValue.TIMESTAMP
          }
        };
    }

    user.providerData.forEach((provider)=>{
        let providerId = provider.providerId;
        let providerUid = provider.uid;
        let key = providerId.split('.')[0]+'Id';
        if(userData.privateFields[key]===""){
            userData.privateFields[key] = providerUid;
        }
    });

    usersRef.child(user.uid).once('value').then((snapshot)=>{
        if(!snapshot.exists()){
            usersRef.child(user.uid).set(userData);
        }
        addPresenceListeners();
        addToRecentlyConnected();
    });
  }
}

export const hidePresence = () => {
    hidePresenceIntentional = true;
    if(myConnectionsRef)
        myConnectionsRef.set(false);
    if(lastOnlineRef)
        lastOnlineRef.set(firebase.database.ServerValue.TIMESTAMP);
}

export const signOut = () =>{
    auth.signOut();
    hidePresenceIntentional = false;
}

export const initPushNotification = ()=>{
    messaging.requestPermission().then(()=>{
        console.log("notification permission granted :)");
        return messaging.getToken();
    }).then((token)=>{
        sendTokenToServer(token);
    }).catch((error)=>{
        console.log('notification permission denied :/');
    });
    messaging.onTokenRefresh(function() {
        messaging.getToken()
        .then(function(refreshedToken) {
            if(auth.currentUser){
                sendTokenToServer(refreshedToken);
            }
        })
        .catch(function(err) {
            console.log('Unable to retrieve refreshed token ', err);
        });
    });
}

function sendTokenToServer(token){
    let userRef = db.ref(`users/${auth.currentUser.uid}/privateFields/fcmTokens/${token}`);
    userRef.set({
      "createdOn": firebase.database.ServerValue.TIMESTAMP,
      "lastTimeReceived": firebase.database.ServerValue.TIMESTAMP,
      "platform": "web",
      "app": "GamePortalReact"
    });
}
