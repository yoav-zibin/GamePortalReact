import React, { Component } from 'react';
import logo from '../logo.svg';
import '../App.css';
import './css/Login.css';
import {firebaseApp, auth, googleProvider, isAuthenticated, db} from '../firebase';


export default class Hello extends Component {
  render() {
    return (
        <div className="container text-center col-md-6">
        <form className="form-signin">
          <h2 className="form-signin-heading">
            Welcome!
          </h2>
          </form>
    </div>
    );
  }
}