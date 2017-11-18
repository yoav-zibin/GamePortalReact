// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  'messagingSenderId': '144595629077'
});
self.addEventListener('push', function(event) {
    // Just for logging, no need to do anything in this method.
    console.log("[firebase-messaging-sw.js] Push Received with this data: ", event);
});

firebase.messaging().setBackgroundMessageHandler((payload)=> {
  console.log("[firebase-messaging-sw.js] setBackgroundMessageHandler: Received background message payload=", payload);
});
