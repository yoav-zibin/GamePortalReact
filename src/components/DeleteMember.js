import React, { Component } from 'react';
import './css/DeleteMember.css';
import { Button } from 'reactstrap';
import firebase from 'firebase';
import {db, auth} from '../firebase';

export default class DeleteMember extends Component {
    constructor(props){
        super(props);
        this.state = {
            content : [],
            participants: []
        };
        this.isConnectedRefs = [];
    }

    updateStatus(uid){
        let users = this.state.content;
        let newUsers = []
        for (let index in users){
            let user = users[index];
            if(user.uid === uid){
                user.online = 'isOffline status-circle';
            }
            newUsers.push(user);
        }
        this.setState({
            content: newUsers
        });
    }

    clearParticipants(){
        if((!this.props.createGroup && !this.props.updateGroup) && this.state.participants.length > 0){
            this.setState({
                participants:[]
            });
        }
    }

    // quiet complicated function
    // Do not modify if don't completely understand
    componentWillMount(){
        let self = this;

        let userReference = db.ref('gamePortal/groups/' + this.props.groupId + '/participants' );
        let updateUsers = (users) =>{
            this.setState({content : users});
        }
        userReference.on('value', function(snapshot) {
            self.isConnectedRefs.forEach((ref)=>{
                ref.off();
            });
            self.isConnectedRefs = [];
            let current_participants = snapshot.val();
            let list = [];
            let myuid = auth.currentUser.uid;
            for (let key in current_participants){
                let uid = key;
                if (uid === myuid) continue;
                let usernameRef = db.ref('users/'+uid+'/publicFields')
                usernameRef.once('value').then(function(snapshot) {
                    if(!snapshot.exists()){
                        return;
                    }
                    let username = snapshot.val().displayName;
                    let isConnected = snapshot.val().isConnected ? 'isOnline' : 'isOffline';
                    isConnected += ' status-circle';
                    let userId = snapshot.ref.parent.key;
                    //If a user is online and then gets online
                    // Need to add this listener to update the status real-time
                    if(snapshot.val().isConnected){
                        let isConnectedRef = db.ref('users/'+userId+'/publicFields/isConnected');
                        self.isConnectedRefs.push(isConnectedRef);
                        isConnectedRef.on('value', function(snapshot){
                            if(!snapshot.val()){
                                self.updateStatus(snapshot.ref.parent.parent.key);
                                snapshot.ref.off();
                                let index = -1;
                                self.isConnectedRefs.forEach((ref, i)=>{
                                    if(ref.parent.parent.key === snapshot.ref.parent.parent.key){
                                        index = i;
                                    }
                                });
                                self.isConnectedRefs.splice(index, 1);
                            }
                        });
                    }
                    if(username!==null){
                        list.push({
                          uid: userId,
                          user: username.toString(),
                          online: isConnected
                        });
                        updateUsers(list);
                    }
                }).catch(self.handleFirebaseException);
              }
        });
    }

    handleUserClick(uid, event){
        if(!this.props.createGroup && !this.props.updateGroup){
            return;
        }
        let participants = this.state.participants;
        let indexOfUid = participants.indexOf(uid);
        if(indexOfUid === -1){
            participants.push(uid);
        } else{
            participants.splice(indexOfUid, 1);
        }
        this.setState({
            participants:participants
        });
    }

    deleteMembers(){
        // implement logic here
        let self = this;
        let groupRef = db.ref('gamePortal/groups/'+self.props.groupId);
        groupRef.once('value').then((snapshot)=>{
            let participantIndex = Object.keys(snapshot.val().participants).length;
            let groupMembers = snapshot.val().participants;

            self.state.participants.forEach((participant)=>{
                if(!(participant in groupMembers)){
                    return;
                }
                let participantRef = db.ref('gamePortal/groups/'+self.props.groupId+'/participants/'+participant);
                participantRef.remove();
                let userRef = db.ref('users/'+participant+'/privateButAddable/groups/'+self.props.groupId);
                userRef.remove();
                participantIndex -= 1;
            });
        });

        this.props.doneDeleting();
    }

  render() {
        if((!this.props.createGroup && !this.props.updateGroup) && this.state.participants.length > 0){
            this.state.participants = [];
        }
        let content = this.state.content.map((user) => {
            let listItemClass = 'user-name-item ';//space in the end is intentional
            if(this.props.createGroup || this.props.updateGroup){
                let indexOfUid = this.state.participants.indexOf(user.uid);
                if(indexOfUid !== -1){
                    listItemClass += 'selected';
                } else{
                    listItemClass += 'hoverable';
                }
            }

            return(
                <li
                key={user.uid}
                className={listItemClass}
                onClick={this.handleUserClick.bind(this, user.uid)}>
                    <div className="userNameContainer">
                        <span>{user.user}</span>
                        <div className={user.online}></div>
                    </div>
                </li>
            );
        });
    return (
        <div className="delete-member-container">
            <ul className='recently-connected-list-container'>
                 {content}
            </ul>
            <Button color="success del-btn" onClick={this.deleteMembers.bind(this)}>
                Delete
            </Button>
        </div>
    );
  }
}
