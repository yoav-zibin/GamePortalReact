import React, { Component } from 'react';
import './css/ChooseGroup.css';
import RecentlyConnected from './RecentlyConnected';
import CreateGroup from './CreateGroup';
import MyGroups from './MyGroups';

export default class ChooseGroup extends Component {

  render() {

    return (
    <div className='choose-group-container'>
        <div className="recently-connected-container">
            <RecentlyConnected />
        </div>
        <div className="create-group-container">
            <CreateGroup />
        </div>
        <div className="my-groups-container">
            <MyGroups />
        </div>
    </div>
    );
  }
}
