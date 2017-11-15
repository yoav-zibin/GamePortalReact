import React from 'react';
import './css/Social.css';
import { SocialIcon } from 'react-social-icons';

export default class Social extends React.Component{
    render(){

        return(
            <div className="social-inner-container">
                <SocialIcon className='social-icon' network="twitter"/>
                <SocialIcon className='social-icon' network="facebook"/>
                <SocialIcon className='social-icon' network="google"/>
            </div>
        );
    }
}
