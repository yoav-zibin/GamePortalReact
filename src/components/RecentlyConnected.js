import React from 'react';
import './css/RecentlyConnected.css';
import {db, auth} from '../firebase';

export default class RecentlyConnected extends React.Component {
    constructor(){
        super();
        this.state = {
            content : []
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

    // quiet complicated function
    // Do not modify if don't completely understand
    componentWillMount(){
        let self = this;
        let userReference = db.ref('gamePortal/recentlyConnected');
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
            for (let key in current_users){
                let uid = snapshot.child(key + '/userId').val();
                if (uid === myuid) continue;
                let usernameRef = db.ref('users/'+uid+'/publicFields')
                usernameRef.once('value').then(function(snapshot) {
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

    render(){
        let content = this.state.content.map((users, index) => {
            return(<li key={index} className="user-name-item">
                    <div className="userNameContainer">
                        <span>{users.user}</span>
                        <div className={users.online}></div>
                    </div>
                </li>
            );
        });
        return(
            <div className="recently-connected-inner-container">
                <ul>
                    {content}
                </ul>
            </div>
        );
    }
}
