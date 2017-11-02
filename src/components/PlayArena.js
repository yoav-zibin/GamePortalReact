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
      this.spec = null;
  }

  loadSpec(){
      this.setBoardImage();
      this.setPieces();
  }

  setBoardImage(){
      let imageId = this.props.spec.board.imageId;
      let self = this;
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
      let pieces = this.props.spec.pieces;
      this.allPieces = [];
      let self = this;
      let numPieces = pieces.length;
      for(let i in pieces){
          let piece_info = pieces[i];
          let elemRef = db.ref('gameBuilder/elements/'+piece_info.pieceElementId);
          let piece = {
              x:piece_info.initialState.x,
              y:piece_info.initialState.y,
          };
          elemRef.once('value').then(function(p, snapshot) {
              let images = snapshot.val().images;
              let imageId = images[0].imageId;
              let imageRef = db.ref('gameBuilder/images/'+imageId);
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
      if(this.props.spec !== this.spec){
          this.spec = this.props.spec;
          this.loadSpec();
      }
    return (
    <div>
      <Board board={this.state.board} pieces={this.state.pieces} matchRef={this.props.matchRef}/>
    </div>
    );
  }
}
