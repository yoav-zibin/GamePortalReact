import React, { Component } from 'react';
import './css/ChooseGroup.css';

export default class ChooseGroup extends Component {

  render() {

    return (
    <div className='choose-group-container'>
        <div className="recently-connected-container">
            recently connected
        </div>
        <div className="welcome-container">
            welcome
        </div>
        <div className="my-groups-container">
            my Groups
        </div>
    </div>
    );
  }
}
