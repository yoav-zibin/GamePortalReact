# GamePortal

Welcome to GamePortal project. We use [React](https://reactjs.org/) for development of this project. If you wish to contribute please read the following rules of engagement.

### Instructions to start development:
1. Install latest version of [node](https://nodejs.org/en/).
2. Clone the repository and run `npm install`.
3. Run `npm start` to run the dev server at port 3000.
4. Documentation for this project can be found [here](https://github.com/yoav-zibin/GamePortalReact/wiki).

### Steps to host on gh-pages:
1. Deploy the app by using following command. Make sure to always deploy app from **master** branch.  
`npm run deploy`
2. Due to an unsolved issue with service worker, append following code on top of **service-worker.js** file in gh-pages branch after deployment.  
`service-worker.js` file is in root directory of gh-pages branch.
```
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');
firebase.initializeApp({
  'messagingSenderId': '144595629077'
});
self.addEventListener('push', function(event) {
});

firebase.messaging().setBackgroundMessageHandler(function(payload) {
});
```
3. The app can be viewed [here](https://yoav-zibin.github.io/GamePortalReact/). You may need to hard reload the app using <kbd>cmd</kbd>+<kbd>shift</kbd>+<kbd>R</kbd>.

### Rules:
1. Use **dev** branch for development and **gh-pages** branch to host the app.
2. Use **master branch** to deploy code. Master branch should always contain working code with no bugs.
3. The pull request to master branch should always be peer reviewed.

### Contributors:
- [Simranjyot Singh Gill](https://github.com/surgicaI)
- [Xintong Wang](https://github.com/xintong621)
- [Yara Qian](https://github.com/yaraqian)
