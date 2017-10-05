# GamePortalReact

### Instructions:
1. Install latest version of [node](https://nodejs.org/en/).
2. Clone the repository and run `npm install`.
3. Run `npm start` to run the dev server at port 3000.

### Tools for development:
- npm install -g firebase-tools  
- npm install -g create-react-app
- npm install firebaseui --save
- npm install react-router-dom
- npm install --save react-sidenav

### After installing firebase  
firebase init

### Resources:
1. [Adding firebase to react app](https://www.codementor.io/yurio/all-you-need-is-react-firebase-4v7g9p4kf)
2. [A Simple React Router v4 Tutorial](https://medium.com/@pshrmn/a-simple-react-router-v4-tutorial-7f23ff27adf)

### TODO:
1. for google signin : need to update isAuthenticated method in firebase.js
2. Remove anonymous user id from database on logoff or disconnect.

### Steps to host on gh-pages:
1. Open your package.json and add a homepage field:
```
  "homepage": "https://myusername.github.io/my-app",
```
2. `npm install --save gh-pages`
3. Add the following scripts in your package.json:
```
"scripts": {
+   "predeploy": "npm run build",
+   "deploy": "gh-pages -d build",
    "start": "react-scripts start",
    "build": "react-scripts build",
}
```
4. Deploy the site by running npm run deploy  
`npm run deploy`
