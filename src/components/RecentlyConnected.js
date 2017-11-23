import React from 'react';
import './css/RecentlyConnected.css';
import {db, auth} from '../firebase';
import { Button } from 'reactstrap';
import firebase from 'firebase';

export default class RecentlyConnected extends React.Component {
    constructor(){
        super();
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

    componentWillReceiveProps(){
        if(this.props.deSelectAll){
            this.state.participants = [];
            this.props.doneDeSelecting();
        }
    }
    // quiet complicated function
    // Do not modify if don't completely understand
    componentWillMount(){
        let self = this;
        let userReference = this.props.path === 'recentlyConnected' ?
                            db.ref('gamePortal/recentlyConnected') :
                            db.ref('users/'+auth.currentUser.uid+'/privateFields/friends');
        let updateUsers = (users) =>{
            this.setState({content : users});
        }
        userReference.on('value', function(snapshot) {
            self.isConnectedRefs.forEach((ref)=>{
                ref.off();
            });
            self.isConnectedRefs = [];
            let current_users = snapshot.val();
            let list = [];
            let myuid = auth.currentUser.uid;
            for (let uid in current_users){
                if(self.props.path === 'recentlyConnected'){
                    uid = snapshot.child(uid + '/userId').val();
                }
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
                        let flag = true;
                        self.isConnectedRefs.push(isConnectedRef);
                        isConnectedRef.on('value', function(snapshot){
                            flag = snapshot.val();
                            if(!snapshot.val()){
                                setTimeout(function () {
                                    if(!flag){
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
                                }, 500);
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

    handleCreateGroup(){
        let participantIndex = 0;
        let participants = {
            [auth.currentUser.uid]: {
                participantIndex: participantIndex
            }
        };
        this.state.participants.forEach((participant)=>{
            participantIndex += 1;
            participants[participant] = {
                participantIndex: participantIndex
            };
        });
        let newGroup = {
            createdOn: firebase.database.ServerValue.TIMESTAMP,
            groupName: this.props.groupName,
            matches: '',
            messages: '',
            participants: participants
        };
        let groupsRef = db.ref('gamePortal/groups');
        let key = groupsRef.push(newGroup).key;
        Object.keys(participants).forEach((participant)=>{
            let userRef = db.ref('users/'+participant+'/privateButAddable/groups/'+key);
            userRef.set({
                addedByUid: auth.currentUser.uid,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
        });
        this.props.doneCreating();
    }

    handleUpdateGroup(){
        let self = this;
        let groupRef = db.ref('gamePortal/groups/'+self.props.groupId);
        groupRef.once('value').then((snapshot)=>{
            let participantIndex = Object.keys(snapshot.val().participants).length;
            let groupMembers = snapshot.val().participants;
            self.state.participants.forEach((participant)=>{
                if(participant in groupMembers){
                    return;
                }
                let participantRef = db.ref('gamePortal/groups/'+self.props.groupId+'/participants/'+participant);
                participantRef.set({
                        participantIndex: participantIndex
                });
                let userRef = db.ref('users/'+participant+'/privateButAddable/groups/'+self.props.groupId);
                userRef.set({
                    addedByUid: auth.currentUser.uid,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                });
                participantIndex += 1;
            });
        });
        self.props.doneCreating();
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

    render(){
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
        return(
            <div className="recently-connected-inner-container">
                <ul className='recently-connected-list-container'>
                    {content}
                </ul>
                {this.props.createGroup ?
                    <Button
                        className='create-group-final-button'
                        color='success'
                        onClick={this.handleCreateGroup.bind(this)}>
                        Create Group
                    </Button>
                : null}
                {this.props.updateGroup ?
                    <Button
                        className='create-group-final-button'
                        color='success'
                        onClick={this.handleUpdateGroup.bind(this)}>
                        Add Members
                    </Button>
                : null}
            </div>
        );
    }
}
