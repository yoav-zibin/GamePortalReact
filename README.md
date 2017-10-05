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
5. The app can be viewed [here](https://yoav-zibin.github.io/GamePortalReact/)

### Steps to host on Surge:
- As react router has many issues with gh-pages we'll be using surge to host our app.
1. Install surge globally.   
`npm install -g surge`
2. Prepare code for deployment.   
`npm run build`
3. Run the surge command in your project’s root:   
`surge`
4. If this is your first time running surge you'll be prompted to create an account. Add an email and password, then hit enter.
5. If your project path is path/to/my-project, edit this to path/to/my-project/build. Once you’ve made this change, press enter to confirm.
6. Surge will suggest a random domain to use. You can delete it and add your own domain if you wish. It just needs to have the .surge.sh extension at the end.
7. The app can be viewed [here](http://gameportal.surge.sh/).
