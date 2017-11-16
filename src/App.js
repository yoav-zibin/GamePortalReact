import React, { Component } from 'react';
import './App.css';
import { storageKey, auth, createUserIfNotExists } from './firebase';
import Login from './components/Login';
import Header from './components/Header';
import Footer from './components/Footer';
import Register from './components/Register';
import RouteManager from './components/RouteManager';
import Main from './components/Main';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

class App extends Component {
    state = {
      uid: -1
    };

    constructor(){
        super();

        this.muiTheme = getMuiTheme({
            palette: {
                textColor: '#FFF',
                primary1Color: '#0077D1',
                primary2Color: '#0077D1',
                accent1Color: '#FFF',
            },
            appBar: {
                height: 50,
            },
        });
    }

    componentDidMount() {
      auth.onAuthStateChanged(user => {
        // adding presence listeners here because when the app initially loads the
        // isAuthenticated function returns false, and after some time only
        // it stats returning true when the state of the auth changes
        if (user) {
          window.localStorage.setItem(storageKey, user.uid);
          this.setState({uid: user.uid});
          createUserIfNotExists();
        } else {
          window.localStorage.removeItem(storageKey);
          this.setState({uid: null});
        }
      });
    }

  render() {
        if (this.state.uid != -1) {

            return (
            <MuiThemeProvider muiTheme={this.muiTheme}>
                <div className='root'>
                    <div className="header-container">
                        <Header />
                    </div>
                    <div className="super-parent-container">
                    {this.state.uid ? (<RouteManager />) : (<Main />)}
                    </div>
                    <div className="footer-container">
                        <Footer />
                    </div>
                </div>
            </MuiThemeProvider>
            );
        } else {
            return (<div></div>);
        }
  }
}

export default App;
