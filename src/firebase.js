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
export const storageKey = 'GAME_BUILDER_LOCAL_STORAGE_$UID';
export const isAuthenticated = () => {
  return !!auth.currentUser;
}
var firebaseui = require('firebaseui');
var ui = new firebaseui.auth.AuthUI(firebase.auth());
//ui.start('#firebaseui-auth-container', uiConfig);
var connectedRef = null;
var myConnectionsRef = null;
var lastOnlineRef = null;
var connection = null;
var hidePresenceIntentional = false;

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
    var recentlyConnectedRef = db.ref('recentlyConnected');
    var uid = auth.currentUser.uid;
    var userInfo = {
        uid: uid,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    var myKeyRef = recentlyConnectedRef.orderByChild("uid").equalTo(uid);
    myKeyRef.once("value",snapshot => {
        const userData = snapshot.val();
        if (userData){
            for(var key in userData){
                db.ref('recentlyConnected/'+key).set(null);
            }
        }
        recentlyConnectedRef.push(userInfo);
    });
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
