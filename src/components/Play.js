import React, { Component } from 'react';
import '../App.css';
import firebase from 'firebase';
import './css/Play.css';
import {firebaseApp, auth, googleProvider, isAuthenticated, db} from '../firebase';
import SideNav, { Nav, NavIcon, NavText} from 'react-sidenav';
import ChatforGroup from './ChatforGroup';
import PlayArena from './PlayArena';
import GameSelector from './GameSelector';
import AddParticipants from './AddParticipants';


export default class Play extends Component {

    constructor(){
        super();
        this.state = {
            spec: null
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

  handleFirebaseException(exception){
      console.log(exception);
  }

  addParticipant(id){
      this.participants.push(id);
  }

  clearParticipants(){
      this.participants = [];
  }

  setSpecId(id){
      this.specId = id;
  }

  render() {

    if(this.state.spec){
        this.playArena = (<PlayArena spec={this.state.spec} matchRef={this.matchRef}/>);
    }

    return (
    <div className="root-container">
        <div className="play-arena-container">
            <GameSelector setSpec={this.setSpec.bind(this)} setSpecId={this.setSpecId.bind(this)}/>
            <div className="play-arena-component">
                {this.playArena}
            </div>
        </div>

        <div className="side-chat">
            chat
        </div>
    </div>
    );
  }
}
