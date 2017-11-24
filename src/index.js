import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import './index.css';
import App from './App';
// import registerServiceWorker from './registerServiceWorker';
import {messaging, auth, initPushNotification} from './firebase';

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(process.env.PUBLIC_URL + '/firebase-messaging-sw.js')
    .then((registration) => {
        // console.log(registration.scope);
        messaging.useServiceWorker(registration);
        auth.onAuthStateChanged(user => {
          if (user) {
            initPushNotification();
          }
        });
    }).catch((err) => {
        console.log('Unable to register Service Worker:', err);
    })
}

ReactDOM.render((
  <BrowserRouter basename={process.env.PUBLIC_URL}>
    <App />
  </BrowserRouter>
), document.getElementById('root'));
// registerServiceWorker();
