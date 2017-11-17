import React, { Component } from 'react';
import './css/ChooseGroup.css';
import RecentlyConnected from './RecentlyConnected';
import CreateGroup from './CreateGroup';
import MyGroups from './MyGroups';
import {Tabs, Tab} from 'material-ui/Tabs';

export default class ChooseGroup extends Component {
    constructor(props){
        super(props);
        this.state = {
            createGroup: false,
            groupName: 'Suicide Squad',
            tab: 'recently_connected',
            deSelectAll: false
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
        if(value!==this.state.tab){
            this.setState({
              tab: value,
              deSelectAll: true
            });
        }
    }

    doneDeSelecting(){
        this.setState({
            deSelectAll: false
        });
    }

  render() {

    return (
    <div className='choose-group-container'>
        <div className="recently-connected-container">
            <Tabs
                value={this.state.tab}
                onChange={this.handleTabChange.bind(this)}>
                    <Tab label="Users" value="recently_connected">
                        <RecentlyConnected
                            createGroup={this.state.createGroup}
                            doneCreating={this.cancelCreateGroup.bind(this)}
                            groupName={this.state.groupName}
                            deSelectAll={this.state.deSelectAll}
                            doneDeSelecting={this.doneDeSelecting.bind(this)}
                            path='recentlyConnected'/>
                    </Tab>
                    <Tab label="Friends" value="friends">
                        <RecentlyConnected
                            createGroup={this.state.createGroup}
                            doneCreating={this.cancelCreateGroup.bind(this)}
                            groupName={this.state.groupName}
                            deSelectAll={this.state.deSelectAll}
                            doneDeSelecting={this.doneDeSelecting.bind(this)}
                            path='friends'/>
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
