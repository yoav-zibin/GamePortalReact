import React, { Component } from 'react';
import Board from './Board';
import {db} from '../firebase';

export default class PlayArena extends Component {
  constructor(props){
      super(props);
      this.state = {
          board: null,
          pieces: []
      };
      this.loadSpec();
  }

  loadSpec(){
      this.setBoardImage();
      this.setPieces();
  }

  setBoardImage(){
      var imageId = this.props.spec.board.imageId;
      var self = this;
      let imageRef = db.ref('gameBuilder/images/'+imageId);
      imageRef.once('value').then(function(snapshot) {
          let board = {
              src: snapshot.val().downloadURL,
              height:snapshot.val().height,
              width:snapshot.val().width
          };
          self.setState({board:board});
      });
  }

  setPieces(){
      var pieces = this.props.spec.pieces;
      this.allPieces = [];
      var self = this;
      var numPieces = pieces.length;
      for(var i in pieces){
          var piece_info = pieces[i];
          var elemRef = db.ref('gameBuilder/elements/'+piece_info.pieceElementId);
          var piece = {
              x:piece_info.initialState.x,
              y:piece_info.initialState.y,
          };
          elemRef.once('value').then(function(p, snapshot) {
              var images = snapshot.val().images;
              var imageId = images[0].imageId;
              var imageRef = db.ref('gameBuilder/images/'+imageId);
              imageRef.once('value').then(function(myPiece, snapshot) {
                  myPiece.imageUrl = snapshot.val().downloadURL;
                  myPiece.height = snapshot.val().height;
                  myPiece.width = snapshot.val().width;
                  self.allPieces.push(myPiece);
                  if(self.allPieces.length == numPieces){
                      self.setState({
                          pieces:self.allPieces
                      });
                  }
              }.bind(null, p));
          }.bind(null, piece));
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
