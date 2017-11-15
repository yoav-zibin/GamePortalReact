import React, { Component } from 'react';
import firebase from 'firebase';
import './css/Play.css';
import {auth, db} from '../firebase';
import PlayArena from './PlayArena';
import GameSelector from './GameSelector';
import Chat from './Chat';
import RecentlyConnected from './RecentlyConnected';

export default class Play extends Component {

    constructor(props){
        super(props);
        let groupId = props.location.pathname.split('/');
        groupId = groupId[groupId.length - 1];
        this.state = {
            spec: null,
            groupId: groupId,
            addMember: false
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
      this.setState({
          addMember: !this.state.addMember
      });
  }

  doneAddingMember(){
      this.setState({
          addMember: false
      });
  }

  render() {

    if(this.state.spec){
        this.playArena = (<PlayArena spec={this.state.spec} matchRef={this.matchRef}/>);
    }

    return (
    <div className="root-container">
        <div className="play-arena-container">
            <GameSelector
                setSpec={this.setSpec.bind(this)}
                setSpecId={this.setSpecId.bind(this)}
                addingMember={this.state.addMember}
                addMember={this.addMember.bind(this)}/>
            <div className="play-arena-component">
                {this.playArena}
            </div>
        </div>

        <div className="side-chat">
            {
                this.state.addMember ?
                <RecentlyConnected
                    updateGroup={this.state.addMember}
                    groupId={this.state.groupId}
                    doneCreating={this.doneAddingMember.bind(this)}/>
                : <Chat groupId={this.state.groupId}/>}
        </div>
    </div>
    );
  }
}
