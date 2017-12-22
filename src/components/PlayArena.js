import React, { Component } from 'react';
import Board from './Board';
import {db} from '../firebase';
import './css/PlayArena.css';

export default class PlayArena extends Component {
  constructor(props){
      super(props);
      this.state = {
          board: null,
          pieces: [],
          showTooltip: false,
          tooltipPosition: null,
          showCardOptions: false,
          visibleTo: []
      };
      this.spec = null;
      this.num = 0;
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
      let pieces = this.props.spec.pieces ? this.props.spec.pieces : [];
      this.allPieces = [];
      let self = this;
      let numPieces = pieces.length;
      for(let i in pieces){
          let piece_info = pieces[i];
          let elemRef = db.ref('gameBuilder/elements/'+piece_info.pieceElementId);
          let piece = {
              x:piece_info.initialState.x,
              y:piece_info.initialState.y,
              zDepth: piece_info.initialState.zDepth,
              cardVisibility: piece_info.initialState.cardVisibility ? piece_info.initialState.cardVisibility : {},
              deckPieceIndex: piece_info.deckPieceIndex,
              rotatableDegrees: 360,
          };
          elemRef.once('value').then(function(snapshot) {
              piece.draggable = snapshot.val().isDraggable;
              piece.kind = snapshot.val().elementKind;
              piece.height = snapshot.val().height;
              piece.width = snapshot.val().width;
              piece.rotatableDegrees = snapshot.val().rotatableDegrees;
              piece.pieceImages = [];
              let images = snapshot.val().images;
              let numImages = images.length;
              self.num = 0;
              images.forEach((imageId)=>{
                  let imageRef = db.ref('gameBuilder/images/'+imageId.imageId);
                  imageRef.once('value').then(function(snapshot) {
                      let pieceImage = snapshot.val().downloadURL;
                      piece.pieceImages.push(pieceImage);
                      if(piece.pieceImages.length === numImages){
                          //self.allPieces.push(piece);
                          self.num++;
                          self.allPieces[i] = piece;
                          if(self.num === numPieces){
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

  makeCardVisibleToSelf(){
      let refPath = `pieces/${this.cardIndex}/currentState/cardVisibility/${this.selfParticipantIndex}`;
      let visibilityRef = this.props.matchRef.child(refPath);
      visibilityRef.set(true);
  }

  makeCardVisibleToAll(){
      Object.keys(this.participantNames).forEach((pi)=>{
          let refPath = `pieces/${this.cardIndex}/currentState/cardVisibility/${pi}`;
          let visibilityRef = this.props.matchRef.child(refPath);
          visibilityRef.set(true);
      });
  }

  makeCardHiddedToAll(){
      let refPath = `pieces/${this.cardIndex}/currentState/cardVisibility`;
      let visibilityRef = this.props.matchRef.child(refPath);
      visibilityRef.set(null);
  }

  showTooltip(position, visibleTo){
      this.setState({
          showTooltip: true,
          tooltipPosition: position,
          visibleTo: visibleTo
      });
  }

  hideTooltip(){
      this.setState({
          showTooltip: false
      });
  }

  showCardOptions(cardIndex, selfParticipantIndex, participantNames, deckIndex){
      this.cardIndex = cardIndex;
      this.selfParticipantIndex = selfParticipantIndex;
      this.participantNames = participantNames;
      this.deckIndex = deckIndex;
      this.setState({
          showTooltip: false,
          showCardOptions: true
      });
  }

  hideCardOptions(){
      this.setState({
          showCardOptions: false
      });
  }

   shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

  shuffleDeck(){
      if(this.spec.pieces){
          let shuffledZindices = new Array(this.spec.pieces.length).fill(0);
          shuffledZindices.forEach((val, index)=>{
              shuffledZindices[index] = index+1;
          });
          shuffledZindices = this.shuffle(shuffledZindices);
          this.spec.pieces.forEach((piece, index)=>{
              if(piece.deckPieceIndex === this.deckIndex){
                  let currentState = piece.initialState;
                  currentState.zDepth = shuffledZindices[index];
                  this.props.matchRef.child(`pieces/${index}/currentState`).set(currentState);
              }
          });
      }
  }

  render() {
      if(this.props.spec !== this.spec){
          this.spec = this.props.spec;
          this.loadSpec();
      }
      let myBoard = this.state.board && this.state.pieces.length > 0 ?
                (<Board groupId={this.props.groupId}
                    showTooltip={this.showTooltip.bind(this)}
                    hideTooltip={this.hideTooltip.bind(this)}
                    showCardOptions={this.showCardOptions.bind(this)}
                    hideCardOptions={this.hideCardOptions.bind(this)}
                    board={this.state.board}
                    pieces={this.state.pieces}
                    matchRef={this.props.matchRef}/>) :
                null;
    return (
    <div>
        {
            this.state.showTooltip ?
            <div className='my-tooltip'
                style={{
                    left:this.state.tooltipPosition.x,
                    top: this.state.tooltipPosition.y
                }}>
                {
                    this.state.visibleTo.length > 0 ?
                    <span style={{textDecoration:'underline'}}>Card is Visible to:</span> :
                    'Card is visible to no one.'
                }
                <ul style={{padding:'0', listStyle:'none', margin:'0'}}>
                    {this.state.visibleTo.map((name, index)=>{
                        return (
                            <li key={this.props.groupId+'tooltip'+index}
                                style={{padding:'0', listStyle:'none', margin:'0'}}>
                                {name}
                            </li>
                        );
                    })}
                </ul>
            </div> :
            null
        }
        {
            this.state.showCardOptions ?
            <div className='my-card-options'
                style={{
                    left:this.state.tooltipPosition.x,
                    top: this.state.tooltipPosition.y
                }}>
                    <div className='close-card-options'
                        onClick={()=>{
                            this.setState({
                                showCardOptions: false
                            });
                        }}>
                        x
                    </div>
                    <span style={{textDecoration:'underline', textAlign:'center'}}>OPTIONS:</span>
                    <ul style={{padding:'0', listStyle:'none', margin:'0'}}>
                            <li className='card-options-item'
                                onClick={()=>{this.makeCardVisibleToSelf()}}>
                                Make Visible To me
                            </li>
                            <li className='card-options-item'
                                onClick={()=>{this.makeCardVisibleToAll()}}>
                                Make Visible To Everyone
                            </li>
                            <li className='card-options-item'
                                onClick={()=>{this.makeCardHiddedToAll()}}>
                                Hide From Everyone
                            </li>
                            <li className='card-options-item'
                                onClick={()=>{this.shuffleDeck()}}>
                                Shuffle Deck
                            </li>
                    </ul>
            </div> :
            null
        }
      {myBoard}
    </div>
    );
  }
}
