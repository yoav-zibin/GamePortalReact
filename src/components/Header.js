import React from 'react';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';
import Hello from './Hello';
import { NavLink as RRNavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Login from './Login';

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
  render() {
    return (
      <div>
        <Navbar color="faded" light toggleable>
          <NavbarToggler right onClick={this.toggle} />
          <NavbarBrand href="/">GamePortal</NavbarBrand>
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink tag={Link} to="Hello" style={{}} activeClassName="active">Welcome</NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to="Login" style={{color: 'Green'}} >Sign in</NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to="Signup" style={{color: 'Blue'}} activeClassName="active">Sign up</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="https://github.com/yoav-zibin/GamePortalReact" style={{color: 'Red'}}>Github</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}
