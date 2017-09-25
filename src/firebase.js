import firebase from 'firebase'
var config = {
  apiKey: "AIzaSyDA5tCzxNzykHgaSv1640GanShQze3UK-M",
  authDomain: "universalgamemaker.firebaseapp.com",
  databaseURL: "https://universalgamemaker.firebaseio.com",
  projectId: "universalgamemaker",
  storageBucket: "universalgamemaker.appspot.com",
  messagingSenderId: "144595629077"
};
export const firebaseApp = firebase.initializeApp(config);
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const auth = firebaseApp.auth();
