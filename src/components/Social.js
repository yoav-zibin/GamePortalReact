import React from 'react';
import './css/Social.css';
import { SocialIcon } from 'react-social-icons';
import {auth, facebookProvider, githubProvider, googleProvider, twitterProvider, db} from '../firebase';

export default class Social extends React.Component{

    handleSocialConnect(provider){
        let self = this;
        let providerId = provider.providerId;
        let providerExists = false;
        auth.currentUser.providerData.forEach((myProvider)=>{
            if(providerExists)
                return;
            if(providerId === myProvider.providerId)
                providerExists = true;
        });
        if(providerExists){
            self.props.success();
            return;
        }
        auth.currentUser.linkWithPopup(provider).then(function(result) {
            // Accounts successfully linked.
            var credential = result.credential;
            let user = result.user;
            user.providerData.forEach((provider)=>{
                if(provider.providerId===providerId){
                    let providerUid = provider.uid;
                    let uid = user.uid;
                    let userRef = db.ref('users/'+uid+'/privateFields/'+providerId.split('.')[0]+'Id')
                    userRef.set(providerUid);
                }
            });
            self.props.success();
        }).catch(function(error) {
            console.log('error linking account:'+error.message);
            self.props.failed();
        });
    }

    render(){
        return(
            <div className="social-inner-container">
                <SocialIcon
                    onClick={()=>{this.handleSocialConnect(twitterProvider)}}
                    className='social-icon'
                    network="twitter"/>
                <SocialIcon
                    onClick={()=>{this.handleSocialConnect(facebookProvider)}}
                    className='social-icon'
                    network="facebook"/>
                <SocialIcon
                    onClick={()=>{this.handleSocialConnect(googleProvider)}}
                    className='social-icon'
                    network="google"/>
                <SocialIcon
                    onClick={()=>{this.handleSocialConnect(githubProvider)}}
                    className='social-icon'
                    network="github"/>
            </div>
        );
    }
}
