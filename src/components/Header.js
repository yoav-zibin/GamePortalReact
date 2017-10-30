import React from 'react';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';
import Hello from './Hello';
import { NavLink as RRNavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Login from './Login';
import {auth, signOut, db, isAuthenticated, firebaseApp, googleProvider} from '../firebase';
import Register from './Register';
import { storageKey, hidePresence } from '../firebase';

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
          usernameRef.once('value').then(function(snapshot) {
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
  }

  handleSignUpClick() {
      authenticated = true;
  }

  render() {
    return (
      <div>
        <Navbar color="faded" light toggleable>
          <NavbarToggler right onClick={this.toggle} />
          <NavbarBrand href="/">GamePortal</NavbarBrand>
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              {this.state.uid ? (
              <NavItem>
                <NavLink tag={Link} onClick={this.handleLogoutClick.bind(this)} to="/"> {this.state.username}  Log Out</NavLink>
              </NavItem>
              ) : (
              <NavItem>
                <NavLink tag={Link} onClick={this.handleSignUpClick.bind(this)} to="Register" activeClassName="active">Sign up</NavLink>
              </NavItem>
              )}
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}
