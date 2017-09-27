import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './components/Login';
import Header from './components/Header';
import Footer from './components/Footer';
import Register from './components/Register';
import Hello from './components/Hello';
import Main from './components/Main';

let authenticated = true;
class App extends Component {
  render() {
    if(authenticated)
      return (
        <div className='login-root'>
            <Header/>
            <Login />
            <Footer/>
        </div>
    )
    else return(
        <div className='login-root'>
            <Header/>
            <Hello />
            <Footer/>
        </div>
    )
  }
}

export default App;
