import React from 'react';
import { Link } from 'react-router-dom';
import {auth, signOut, db, isAuthenticated, firebaseApp, googleProvider} from '../firebase';
import { storageKey, hidePresence } from '../firebase';
import './css/Header.css';
import createHistory from 'history/createBrowserHistory';

let  authenticated = true;

export default class Header extends React.Component {
    state = {
      uid: null,
      username: null
    };

    componentDidMount() {
      let  self = this;
      auth.onAuthStateChanged(user => {
        if (user) {
          window.localStorage.setItem(storageKey, user.uid);
          this.setState({uid: user.uid});
          let  usernameRef = db.ref('users/'+user.uid+'/publicFields/displayName');
          usernameRef.on('value', function(snapshot) {
            let  username = snapshot.val();
            self.setState({username: username});
          });

        } else {
          window.localStorage.removeItem(storageKey);
          this.setState({uid: null});
        }
      });
    }

  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  handleLogoutClick() {
      authenticated = false;
      // hidePresence has to be called before auth.signOut()
      hidePresence();
      signOut();
      let history = createHistory();
      history.push('/', {});
  }

  handleSignUpClick() {
      authenticated = true;
  }

  render(){
    return (
      <div className='header-inner-container'>
          <Link className='app-title' to="/"><h4 style={{margin:'0'}}>GamePortal</h4></Link>
          {this.state.uid ?
                <div className='signup-logout' onClick={this.handleLogoutClick.bind(this)}>
                    <h5 style={{margin:'0'}}>{this.state.username}  Log Out</h5>
                </div> :
                <Link className='signup-logout' onClick={this.handleSignUpClick.bind(this)} to="Register">
                    <h5 style={{margin:'0'}}>Sign up</h5>
                </Link>
          }
      </div>
    );
  }
}
