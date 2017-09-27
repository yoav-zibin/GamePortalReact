import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './components/Login';
import Header from './components/Header';
import Footer from './components/Footer';
import Register from './components/Register';
import Hello from './components/Hello';
import Main from './components/Main';

class App extends Component {
  render() {
    return (
        <div className='login-root'>
            <Header/>
            <Main />
            <Footer/>
        </div>
    )
  }
}

export default App;
