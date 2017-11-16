import React from 'react';
import './css/Social.css';
import { SocialIcon } from 'react-social-icons';
import {auth, facebookProvider, githubProvider, googleProvider, twitterProvider} from '../firebase';

export default class Social extends React.Component{
    handleSocialConnect(provider){
        let self = this;
        auth.currentUser.linkWithPopup(facebookProvider).then(function(result) {
            // Accounts successfully linked.
            var credential = result.credential;
            var user = result.user;
            // ...
            self.props.success();
        }).catch(function(error) {
            console.log('error linking facebook account');
            self.props.failed();
        });
    }

    render(){
        return(
            <div className="social-inner-container">
                <SocialIcon
                    onClick={this.handleSocialConnect.bind(this, twitterProvider)}
                    className='social-icon'
                    network="twitter"/>
                <SocialIcon
                    onClick={this.handleSocialConnect.bind(this, facebookProvider)}
                    className='social-icon'
                    network="facebook"/>
                <SocialIcon
                    onClick={this.handleSocialConnect.bind(this, googleProvider)}
                    className='social-icon'
                    network="google"/>
                <SocialIcon
                    onClick={this.handleSocialConnect.bind(this, githubProvider)}
                    className='social-icon'
                    network="github"/>
            </div>
        );
    }
}
