import React, { Component } from 'react';
import firebase from 'firebase';
import './css/Play.css';
import {auth, db} from '../firebase';
import PlayArena from './PlayArena';
import GameSelector from './GameSelector';
import Chat from './Chat';
import RecentlyConnected from './RecentlyConnected';
import ShowGroupMembers from './ShowGroupMembers';

export default class Play extends Component {

    constructor(props){
        super(props);
        let groupId = props.location.pathname.split('/');
        groupId = groupId[groupId.length - 1];
        this.state = {
            spec: null,
            groupId: groupId,
            addMember: false,
            deleteMember: false
        };
        this.playArena = null;
        this.participants = [];
        this.specId = null;
    }

  setSpec(spec){
      let groupRef = db.ref('gamePortal/groups');
      let participants = {[auth.currentUser.uid]:{participantIndex:1} ,
          [this.participants[0]] :{participantIndex:0}};
      let group = {
          participants: participants,
          messages: '',
          matches: '',
          createdOn: firebase.database.ServerValue.TIMESTAMP,
          groupName: 'ReactPortal'
      };
      let ref = groupRef.push(group);
      this.matchRef = db.ref('gamePortal/groups/'+ref.key+'/matches');
      let match = {
          createdOn: firebase.database.ServerValue.TIMESTAMP,
          gameSpecId: this.specId,
          lastUpdatedOn: firebase.database.ServerValue.TIMESTAMP,
          pieces: ''
      };
      this.matchRef = this.matchRef.push(match);
      this.setState({
          spec: spec
      });
  }

  setSpecId(id){
      this.specId = id;
  }

  addMember(){
      this.doneDeletingMember();
      this.setState({
          addMember: !this.state.addMember
      });
  }

  doneAddingMember(){
      this.setState({
          addMember: false
      });
  }

  deleteMember(){
      this.doneAddingMember();
      this.setState({
          deleteMember: !this.state.deleteMember
      });
  }

  doneDeletingMember(){
      this.setState({
          deleteMember: false
      });
  }

  render() {

    if(this.state.spec){
        this.playArena = (<PlayArena spec={this.state.spec} matchRef={this.matchRef}/>);
    }

    let updateGroupComponent = null;
    if(this.state.addMember){
        updateGroupComponent = (
            <RecentlyConnected
            updateGroup={this.state.addMember}
            groupId={this.state.groupId}
            doneCreating={this.doneAddingMember.bind(this)}
            path='recentlyConnected'/>
        );
    } else{
        updateGroupComponent = (
            <ShowGroupMembers
            groupId={this.state.groupId}
            doneDeleting={this.doneDeletingMember.bind(this)}/>
        );
    }

    return (
    <div className="root-container">
        <div className="play-arena-container">
            <GameSelector
                setSpec={this.setSpec.bind(this)}
                setSpecId={this.setSpecId.bind(this)}/>
            <div className="play-arena-component">
                {this.playArena}
            </div>
        </div>

        <div className="side-chat">
            {
                this.state.addMember || this.state.deleteMember ?
                updateGroupComponent :
                <Chat groupId={this.state.groupId}
                addingMember={this.state.addMember}
                addMember={this.addMember.bind(this)}
                deletingMember={this.state.deleteMember}
                deleteMember={this.deleteMember.bind(this)}
                />}
        </div>
    </div>
    );
  }
}
