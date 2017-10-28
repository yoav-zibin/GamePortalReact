import React, { Component } from 'react';
import Board from './Board';
import {db} from '../firebase';

export default class PlayArena extends Component {
  constructor(props){
      super(props);
      this.state = {
          board: null,
          pieces: [{
              src:'https://www.shareicon.net/data/128x128/2016/07/20/799015_chess_512x512.png',
              width:50,
              height:50
          }]
      };
      this.setBoardImage(this.props.spec.board.imageId);
      this.setPieces(this.props.spec.pieces);
  }

  setBoardImage(imageId){
      var self = this;
      let imageRef = db.ref('gameBuilder/images/'+imageId);
      imageRef.once('value').then(function(snapshot) {
          let board = {
              src: snapshot.val().downloadURL,
              height:400,
              width:400
          };
          self.setState({board:board});
      });
  }

  setPieces(pieces){
      for(var i in pieces){
          var piece_info = pieces[i];
          var elemRef = db.ref('gameBuilder/elements/'+piece_info.pieceElementId);
          elemRef.once('value').then(function(snapshot) {

          });
          var image_url = '';
          var piece = {
              src: image_url,
              x:piece_info.initialState.x,
              y:piece_info.initialState.y,
              height: 0,
              width: 0
          };
      }
  }

  render() {
    return (
    <div>
      <Board board={this.state.board} pieces={this.state.pieces}/>
    </div>
    );
  }
}
