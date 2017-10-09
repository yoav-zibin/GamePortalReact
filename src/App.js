import React, { Component } from 'react';
import './App.css';
import { storageKey, auth, addPresenceListeners } from './firebase';
import Login from './components/Login';
import Header from './components/Header';
import Footer from './components/Footer';
import Register from './components/Register';
import Hello from './components/Hello';
import Main from './components/Main';

class App extends Component {
    state = {
      uid: -1
    };

    componentDidMount() {
      auth.onAuthStateChanged(user => {
        // adding presence listeners here because when the app initially loads the
        // isAuthenticated function returns false, and after some time only
        // it stats returning true when the state of the auth changes
        if (user) {
          window.localStorage.setItem(storageKey, user.uid);
          this.setState({uid: user.uid});
          addPresenceListeners();
        } else {
          window.localStorage.removeItem(storageKey);
          this.setState({uid: null});
        }
      });
    }

  render() {
        if (this.state.uid != -1) {

            return (<div className='root'>
                <Header/>
                {this.state.uid ? (<Hello />) : (<Main />)}
                <Footer/>
            </div>)
        } else {
            return (<div></div>)
        }
  }
}

export default App;
