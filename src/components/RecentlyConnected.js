import React from 'react';
import './css/RecentlyConnected.css';
import {db, auth} from '../firebase';

export default class RecentlyConnected extends React.Component {
    constructor(){
        super();
        this.state = {
            content : []
        };
    }

    componentWillMount(){
        let self = this;
        let usereference = db.ref('gamePortal/recentlyConnected');
        let updateUsers = (users) =>{
            this.setState({content : users});
        }
        usereference.on('value', function(snapshot) {
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
                    if(username!==null){
                        list.push({
                          uid: snapshot.ref.parent.key,
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
            return(<li>
                <div className="userNameContainer">
                    <span>{users.user}</span>
                    <div className={users.online}></div>
                </div>
                </li>
            );
        });
        return(
            <div>
                <ul>
                    {content}
                </ul>
            </div>
        );
    }
}
