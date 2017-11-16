import React, { Component } from 'react';
import './css/ChooseGroup.css';
import RecentlyConnected from './RecentlyConnected';
import CreateGroup from './CreateGroup';
import MyGroups from './MyGroups';
import SocialFriends from './SocialFriends';
import {Tabs, Tab} from 'material-ui/Tabs';

export default class ChooseGroup extends Component {
    constructor(props){
        super(props);
        this.state = {
            createGroup: false,
            groupName: 'Suicide Squad',
            tab: 'recently_connected'
        };
    }

    createGroup(){
        this.setState({
            createGroup: true
        });
    }

    cancelCreateGroup(){
        this.setState({
            createGroup: false
        });
    }

    updateGroupName(event){
        this.setState({
            groupName: event.target.value
        });
    }

    handleTabChange = (value) => {
        this.setState({
          tab: value,
        });
    };

  render() {

    return (
    <div className='choose-group-container'>
        <div className="recently-connected-container">
            <Tabs
                color='primary'
                value={this.state.tab}
                onChange={this.handleTabChange.bind(this)}>
                    <Tab label="Users" value="recently_connected">
                        <RecentlyConnected
                            createGroup={this.state.createGroup}
                            doneCreating={this.cancelCreateGroup.bind(this)}
                            groupName={this.state.groupName}/>
                    </Tab>
                    <Tab label="Friends" value="friends">
                        <SocialFriends />
                    </Tab>
            </Tabs>
        </div>
        <div className="create-group-container">
            <CreateGroup
                createGroup={this.state.createGroup}
                create={this.createGroup.bind(this)}
                cancelCreateGroup={this.cancelCreateGroup.bind(this)}
                groupName={this.state.groupName}
                updateGroupName={this.updateGroupName.bind(this)}/>
        </div>
        <div className="my-groups-container">
            <MyGroups />
        </div>
    </div>
    );
  }
}
