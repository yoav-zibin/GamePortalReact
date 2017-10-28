import React, { Component } from 'react';
import '../App.css';
import firebase from 'firebase';
import './css/Hello.css';
import {firebaseApp, auth, googleProvider, isAuthenticated, db} from '../firebase';
import SideNav, { Nav, NavIcon, NavText} from 'react-sidenav';
import ChatforGroup from './ChatforGroup'
import PlayArena from './PlayArena'


export default class Hello extends Component {
    spec = {
      "board" : {
        "backgroundColor" : "FFFFFF",
        "imageId" : "-KuZltt2rBvN2NZvCKGw",
        "maxScale" : 1
      },
      "createdOn" : 1508992894222,
      "gameIcon50x50" : "-KwqEPnE2xzAON9V2mcP",
      "gameIcon512x512" : "-KwqEjlZ_sv95XrfTn5z",
      "gameName" : "3 Man Chess",
      "pieces" : [ {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 40.48,
          "y" : 88.09,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRU"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 48.69,
          "y" : 88.87,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRU"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 57.48,
          "y" : 88.09,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRU"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 65.29,
          "y" : 85.16,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRU"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 72.32,
          "y" : 81.45,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRU"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 79.16,
          "y" : 75.59,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRU"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 84.23,
          "y" : 68.16,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRU"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 87.55,
          "y" : 60.55,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRU"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 19,
          "y" : 75.98,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRT"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 13.73,
          "y" : 68.55,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRT"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 10.41,
          "y" : 60.35,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRT"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 8.45,
          "y" : 52.54,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRT"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 8.45,
          "y" : 44.14,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRT"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 10.01,
          "y" : 35.55,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRT"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 13.53,
          "y" : 28.32,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRT"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 18.41,
          "y" : 20.7,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRT"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 40.68,
          "y" : 8.79,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRS"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 48.88,
          "y" : 7.81,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRS"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 57.67,
          "y" : 8.79,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRS"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 65.09,
          "y" : 10.94,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRS"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 72.51,
          "y" : 15.23,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRS"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 79.16,
          "y" : 20.7,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRS"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 84.04,
          "y" : 27.73,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRS"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 87.75,
          "y" : 36.33,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_0rYL_IFUzesRS"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 39.51,
          "y" : 92.77,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_4QT05qtFWuLEd"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 91.66,
          "y" : 62.89,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_4QT05qtFWuLEd"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 15.09,
          "y" : 78.52,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_4QT05qtFWuLEc"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 15.09,
          "y" : 18.36,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_4QT05qtFWuLEc"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 39.7,
          "y" : 4.69,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_3-H2EMQgLwYe9"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 92.05,
          "y" : 35.16,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_3-H2EMQgLwYe9"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 48.1,
          "y" : 93.75,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_-drzu4G07fQK2"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 87.75,
          "y" : 71.68,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_-drzu4G07fQK2"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 9.23,
          "y" : 70.7,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHdZz8vKvnfkaibg8"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 9.04,
          "y" : 26.17,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHdZz8vKvnfkaibg8"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 48.1,
          "y" : 3.52,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHdZz8vKvnfkaibg7"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 87.94,
          "y" : 25.98,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHdZz8vKvnfkaibg7"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 57.87,
          "y" : 4.3,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHdZy9A4raV9RJgMz"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 82.28,
          "y" : 17.77,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHdZy9A4raV9RJgMz"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 5.72,
          "y" : 62.5,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHdZy9A4raV9RJgN-"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 5.52,
          "y" : 34.18,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHdZy9A4raV9RJgN-"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 58.45,
          "y" : 92.58,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHdZy9A4raV9RJgN0"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 82.87,
          "y" : 78.52,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHdZy9A4raV9RJgN0"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 67.05,
          "y" : 90.04,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHdZz8vKvnfkaibg6"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 3.57,
          "y" : 43.36,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHdZz8vKvnfkaibg5"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 74.66,
          "y" : 11.52,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHdZz8vKvnfkaibg4"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 75.64,
          "y" : 84.77,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_3-H2EMQgLwYe8"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 3.57,
          "y" : 53.13,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_1aBJauEo66eiO"
      }, {
        "deckPieceIndex" : -1,
        "initialState" : {
          "currentImageIndex" : 0,
          "x" : 66.85,
          "y" : 7.23,
          "zDepth" : 1
        },
        "pieceElementId" : "-KxLHd_1aBJauEo66eiN"
      } ],
      "tutorialYoutubeVideo" : "",
      "uploaderEmail" : "yl4308@nyu.edu",
      "uploaderUid" : "Trh7WWsvmRa6yM8W713coQ6ebNm1",
      "wikipediaUrl" : "https://no-wiki.com"
  };

    constructor(){
        super();
        this.state = {
            content : [],
            chats: [],
            props: {name: "hello", id: null, displayName:null},
        };
    }

    componentDidMount(){
        var usereference = firebaseApp.database().ref('gamePortal/recentlyConnected');
        var updateUsers = (users) =>{
            this.setState({content : users});
        }
        usereference.on('value', function(snapshot) {
            var current_users = snapshot.val();
            var list = [];
            var myuid = auth.currentUser.uid;
            for (var key in current_users){
                var uid = snapshot.child(key + '/userId').val();
                if (uid == myuid) continue;
                var usernameRef = db.ref('users/'+uid+'/publicFields/displayName')
                usernameRef.once('value').then(function(snapshot) {
                    var username = snapshot.val();
                    if(username!=null){
                        list.push({
                          uid: snapshot.ref.parent.parent.key,
                          user: username.toString(),
                        });
                        updateUsers(list);
                    }
                });
              }
        });

        var uid = auth.currentUser.uid;
        var chatReference = firebaseApp.database().ref('users/'+uid+'/privateButAddable/groups');
        var updatechats = (chats) =>{
            this.setState({chats : chats});
        }
        chatReference.on('value', function(snapshot) {
            var chatIds = snapshot.val();
            var list = [];
            for (var key in chatIds){
                var groupref = db.ref('gamePortal/groups/' + key + '/groupName');
                groupref.once('value').then(function(snapshot) {
                    var groupname = snapshot.val();
                    list.push({
                        groupid: snapshot.ref.parent.key,
                        name : groupname
                    })
                    updatechats(list);
                });
            }
        });
    }


  handleclick(id, parent){
    if (parent != null) {
        parent = parent.toString()
        if (parent == 'recently-connected'){
            id = id.substring(19);
            let list = {
                name: 'person',
                id: id
            }
            this.setState({props: list});
        }
        else {
            id = id.substring(6);
            let list = {
                name: 'group',
                id: id

            }
            this.setState({props: list});
        }
    }
  }

  render() {
    var content = this.state.content.map((users) =>
      <Nav id={users.uid}>
      <NavText>{users.user}</NavText>
      </Nav>
    );

    var chats = this.state.chats.map((chats) =>
      <Nav id={chats.groupid}>
      <NavText>{chats.name}</NavText>
      </Nav>
    );

    return (
    <div className="root-container">
        <div className="side-nav">
            <SideNav highlightBgColor="#00bad4" onItemSelection={ (id, parent) => {this.handleclick(id, parent)}} >
              <Nav id="recently-connected">
                <NavText>
                Recently Connected
                </NavText>
                {content}
              </Nav>
              <Nav id="chats">
                <NavText>
                    Chats
                </NavText>
                {chats}
              </Nav>
            </SideNav>
        </div>
        <div className="play-arena">
            <PlayArena spec={this.spec}/>
        </div>

        <div className="side-chat">
            <ChatforGroup myprops={this.state.props}/>

        </div>
    </div>
    );
  }
}
