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
      this.deckElements = [];
      let self = this;
      let numPieces = pieces.length;
      for(let i in pieces){
          let piece_info = pieces[i];
          let elemRef = db.ref('gameBuilder/elements/'+piece_info.pieceElementId);
          let piece = {
              x:piece_info.initialState.x,
              y:piece_info.initialState.y,
              zDepth: piece_info.initialState.zDepth
          };
          elemRef.once('value').then(function(snapshot) {
              piece.draggable = snapshot.val().isDraggable;
              piece.kind = snapshot.val().elementKind;
              piece.height = snapshot.val().height;
              piece.width = snapshot.val().width;
              piece.pieceImages = [];
              let images = snapshot.val().images;
              let numImages = images.length;
              if(piece.kind === 'cardsDeck'){
                  let deckElems = snapshot.val().deckElements;
                  let numDeckElems = deckElems.length;
                  deckElems.forEach((deckElem)=>{
                      let cardRef = db.ref(`gameBuilder/elements/${deckElem.deckMemberElementId}`);
                      cardRef.once('value').then((snap)=>{
                          let elem = {};
                          elem.draggable = snap.val().isDraggable;
                          elem.kind = snap.val().elementKind;
                          elem.height = snap.val().height;
                          elem.width = snap.val().width;
                          elem.pieceImages = [];
                          let elemImages = snap.val().images;
                          let numElemImages = elemImages.length;
                          elemImages.forEach((imageId)=>{
                              let imageRef = db.ref('gameBuilder/images/'+imageId.imageId);
                              imageRef.once('value').then(function(snapshot) {
                                  let pieceImage = snapshot.val().downloadURL;
                                  elem.pieceImages.push(pieceImage);
                                  if(elem.pieceImages.length === numElemImages){
                                      self.deckElements.push(elem);
                                      if(self.deckElements.length === numDeckElems){
                                          self.setState({
                                              deckElements: self.deckElements
                                          });
                                      }
                                  }
                              });
                          });
                      });
                  });
              }
              images.forEach((imageId)=>{
                  let imageRef = db.ref('gameBuilder/images/'+imageId.imageId);
                  imageRef.once('value').then(function(snapshot) {
                      let pieceImage = snapshot.val().downloadURL;
                      piece.pieceImages.push(pieceImage);
                      if(piece.pieceImages.length === numImages){
                          self.allPieces.push(piece);
                          if(self.allPieces.length === numPieces){
                              self.setState({
                                  pieces:self.allPieces
                              });
                          }
                      }
                  });
              });
          });
      }
  }

  render() {
      if(this.props.spec !== this.spec){
          this.spec = this.props.spec;
          this.loadSpec();
      }
      let myBoard = this.state.board && this.state.pieces.length > 0 ?
                (<Board deckElements={this.state.deckElements} board={this.state.board} pieces={this.state.pieces} matchRef={this.props.matchRef}/>) :
                null;
    return (
    <div>
      {myBoard}
    </div>
    );
  }
}
