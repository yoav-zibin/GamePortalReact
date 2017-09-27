import React from 'react'
import { Link } from 'react-router-dom'
import Hello from './Hello';

// The Header creates links that can be used to navigate
// between routes.
const PhoneAuth = () => (
        <div className="container text-center col-md-6">
        <form className="form-signin">
        	<div id="firebaseui-auth-container"></div>
          </form>
    </div>
)

export default PhoneAuth
