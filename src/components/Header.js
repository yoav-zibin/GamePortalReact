import React from 'react';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';
import Hello from './Hello';
import { NavLink as RRNavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Login from './Login';
import {auth} from '../firebase';

var authenticated = true;
export default class Header extends React.Component {

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
      auth.signOut();
  }

  render() {
    return (
      <div>
        <Navbar color="faded" light toggleable>
          <NavbarToggler right onClick={this.toggle} />
          <NavbarBrand href="/">GamePortal</NavbarBrand>
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              {authenticated ? (
              <NavItem>
                <NavLink tag={Link} onClick={this.handleLogoutClick.bind(this)} to="Login">Logout</NavLink>
              </NavItem>
              ) : (
              <NavItem>
                <NavLink tag={Link} to="Signup" activeClassName="active">Sign up</NavLink>
              </NavItem>
              )}
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}
