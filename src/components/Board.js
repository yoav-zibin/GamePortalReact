import React, { Component } from 'react';
import { Layer, Stage } from 'react-konva';
import CanvasImage from './CanvasImage';
import Konva from 'konva';
import {db, auth} from '../firebase';

export default class Board extends Component {
  constructor(props){
      super(props);
      this.height = 650;
      this.width = 650;
      this.board = null;
      this.boardCanvas = null;
      this.piecesCanvases = null;
      this.maxZIndex = 0;
  }

  shouldComponentUpdate(nextProps, nextState){
      if(nextProps.board !== this.props.board || nextProps.pieces !== this.props.pieces || nextProps.matchRef !== this.props.matchRef){
          return true;
      }
      return false;
  }

  componentWillMount(){
      let thiz = this;
      this.createNewPieceCanvases = true;
      this.updatePiecesListener = false;
      this.canvasPiecesUpdated = null;
      this.pieceIndices = new Array(this.props.pieces.length).fill(0);
      this.pieceRotation = new Array(this.props.pieces.length).fill(0);
      this.groupParticipantsRef = db.ref(`gamePortal/groups/${this.props.groupId}/participants`);
      this.groupParticipantsRef.on('value', (snap)=>{
          let participants = snap.val();
          thiz.numParticipants = Object.keys(participants).length;
          thiz.selfParticipantIndex = participants[auth.currentUser.uid].participantIndex;
          thiz.participantNames = {};
          Object.keys(participants).forEach((uid)=>{
              let userRef = db.ref(`users/${uid}/publicFields/displayName`);
              userRef.once('value').then((snap)=>{
                  thiz.participantNames[participants[uid].participantIndex] = snap.val();
              });
          });
      });
  }

  componentDidMount(){
      this.preserveSavedState(this.props.matchRef);
      this.addPieceUpdateListener(this.props.matchRef);
      this.updateCardVisibility(this.props);
  }

  componentWillUnmount(){
      this.groupParticipantsRef.off();
  }

  componentDidUpdate(){
       if(this.updatePiecesListener && this.canvasPiecesUpdated){
           this.updatePiecesListener = false;
           this.preserveSavedState(this.props.matchRef);
           this.addPieceUpdateListener(this.props.matchRef);
       }
       this.canvasPiecesUpdated = false;
  }

  componentWillReceiveProps(nextProps){
      if(nextProps.pieces !== this.props.pieces){
          this.createNewPieceCanvases = true;
          this.pieceIndices = new Array(nextProps.pieces.length).fill(0);
          this.pieceRotation = new Array(this.props.pieces.length).fill(0);
          this.updateCardVisibility(nextProps);
      }
      if(nextProps.matchRef !== this.props.matchRef){
          this.removePieceUpdateListener(this.props.matchRef);
          this.updatePiecesListener = true;
      }
  }

  addPieceUpdateListener(dbRef){
      let thiz = this;
      dbRef.child('pieces').on('child_changed', function(snapshot) {
          if(snapshot.exists()){
              let val = snapshot.val();
              let index = snapshot.key;
              let zDepth = val.currentState.zDepth;
              let position = {
                  x:val.currentState.x/100*thiz.width,
                  y:val.currentState.y/100*thiz.height
              };
              let imageIndex = val.currentState.currentImageIndex;
              if(thiz.props.pieces[index].kind === 'dice' && imageIndex !== thiz.pieceIndices[index]){
                  thiz.rollDice('canvasImage'+index, index, thiz.props.pieces[index], true)
              }
              if(thiz.props.pieces[index].kind === 'cardsDeck' || thiz.props.pieces[index].kind === 'piecesDeck'){
                  return;
              }
              if(thiz.props.pieces[index].kind === 'card'){
                  thiz.cardVisibility[index] = val.currentState.cardVisibility;
                  if(thiz.cardVisibility[index] && thiz.cardVisibility[index][thiz.selfParticipantIndex]){
                      thiz.updateImage(index, 1);
                  } else{
                      thiz.updateImage(index, 0);
                  }
              } else{
                  thiz.updateImage(index, imageIndex);
              }
              if(thiz.props.pieces[index].kind === 'standard') {
                  thiz.pieceRotation[index] = val.currentState.rotationDegrees ? val.currentState.rotationDegrees : 0;
                  let degree = thiz.pieceRotation[index];
                  thiz.updateRotation(index, degree);
              }
              thiz.updatePosition(index, position.x, position.y);
              thiz.updateZIndex(index, zDepth);
          }
      });
  }

  preserveSavedState(dbRef){
      let thiz = this;
      dbRef.child('pieces').once('value').then(function(snapshot) {
          if(snapshot.exists()){
              let val = snapshot.val();
              val.forEach((pieceState, index)=>{
                  let position = {
                      x:pieceState.currentState.x/100*thiz.width,
                      y:pieceState.currentState.y/100*thiz.height
                  };
                  let zDepth = pieceState.currentState.zDepth;
                  let imageIndex = pieceState.currentState.currentImageIndex;
                  thiz.updatePosition(index, position.x, position.y);
                  if(thiz.props.pieces[index].kind === 'cardsDeck' || thiz.props.pieces[index].kind === 'piecesDeck'){
                      return;
                  }
                  if(thiz.props.pieces[index].kind === 'card'){
                      thiz.cardVisibility[index] = pieceState.currentState.cardVisibility;
                      if(thiz.cardVisibility[index] && thiz.cardVisibility[index][thiz.selfParticipantIndex]){
                          thiz.updateImage(index, 1);
                      } else{
                          thiz.updateImage(index, 0);
                      }
                  } else{
                      thiz.updateImage(index, imageIndex);
                  }
                  if(thiz.props.pieces[index].kind === 'standard') {
                    thiz.pieceRotation[index] = pieceState.currentState.rotationDegrees ? pieceState.currentState.rotationDegrees : 0;
                    let degree = thiz.pieceRotation[index];
                    thiz.updateRotation(index, degree);
                  }
                  thiz.updateZIndex(index, zDepth);
              });
          }
      });
  }

  updateRotation(index, degree) {
    let thiz = this;
    let canvasRef = 'canvasImage'+index;
    thiz.refs[canvasRef].refs.image.rotation(degree);
    thiz.refs.piecesCanvasesLayer.draw();
  }

  updateImage(index, imageIndex){
      let thiz = this;
      let canvasRef = 'canvasImage'+index;
      if(thiz.pieceIndices[index] !== imageIndex){
          thiz.pieceIndices[index] = imageIndex;
          let myImage = new Image();
          myImage.onload = function (){
              thiz.refs[canvasRef].refs.image.setImage(myImage);
              thiz.refs.piecesCanvasesLayer.draw();
          }
          myImage.src = this.props.pieces[index].pieceImages[thiz.pieceIndices[index]];
      }
  }

  removePieceUpdateListener(dbRef){
      dbRef.child('pieces').off();
  }

  updatePosition(index, x, y){
    if(this.refs['canvasImage'+index]){
        this.refs['canvasImage'+index].refs.image.to({
            x:x,
            y:y,
            duration: 0.5
        });
    }
  }

  handleDragStart(index){
      let canvasRef = 'canvasImage'+index;
      this.refs[canvasRef].refs.image.moveToTop();
      this.maxZIndex = this.refs[canvasRef].refs.image.getZIndex();
      this.refs.piecesCanvasesLayer.draw();
  }

  handleDragEnd(index){
      let canvasRef = 'canvasImage'+index;
      let position = this.refs[canvasRef].refs.image.getAbsolutePosition();
      let cardVisibility = null;
      if(this.cardVisibility[index]){
          cardVisibility ={};
          Object.keys(this.cardVisibility[index]).forEach((participantIndex)=>{
              cardVisibility[participantIndex] = true;
          });
      }
      let value = {
          currentImageIndex: this.pieceIndices[index],
          x: position.x/this.width*100,
          y: position.y/this.height*100,
          zDepth: ++this.maxZIndex,
          cardVisibility: cardVisibility
      };
      value = {currentState: value};
      let pieceRef = this.props.matchRef.child('pieces').child(index);
      pieceRef.set(value);
  }

  rotatePiece(canvasRef, index, piece){
    let thiz = this;
    let position = thiz.refs['canvasImage'+index].refs.image.getAbsolutePosition();
    let degree = (piece.rotatableDegrees + thiz.pieceRotation[index]) % 360;
    thiz.pieceRotation[index] = degree;
    thiz.refs[canvasRef].refs.image.rotation(degree);
    thiz.refs.piecesCanvasesLayer.draw();
    let value = {
      currentImageIndex:thiz.pieceIndices[index],
      x: position.x/thiz.width*100,
      y: position.y/thiz.height*100,
      rotationDegrees:degree,
      zDepth: ++thiz.maxZIndex
    };
    value = {currentState: value};
    let pieceRef = thiz.props.matchRef.child('pieces').child(index);
    pieceRef.set(value);
    
  }

  togglePiece(canvasRef, index, piece){
      let thiz = this;
      thiz.pieceIndices[index] = (thiz.pieceIndices[index] + 1) % piece.pieceImages.length;
      let position = thiz.refs['canvasImage'+index].refs.image.getAbsolutePosition();
      let myImage = new Image();
      myImage.onload = function (){
          thiz.refs[canvasRef].refs.image.setImage(myImage);
          thiz.refs.piecesCanvasesLayer.draw();
          let value = {
              currentImageIndex:thiz.pieceIndices[index],
              x: position.x/thiz.width*100,
              y: position.y/thiz.height*100,
              zDepth: ++thiz.maxZIndex
          };
          value = {currentState: value};
          let pieceRef = thiz.props.matchRef.child('pieces').child(index);
          pieceRef.set(value);
      }
      myImage.src = piece.pieceImages[thiz.pieceIndices[index]];
  }

  rollDice(canvasRef, index, piece, justAnimate=false){
      let thiz = this;
      let position = thiz.refs[canvasRef].refs.image.getAbsolutePosition();
      let tweenDuration = 0.5;
      let tween = new Konva.Tween({
        node: thiz.refs[canvasRef].refs.image,
        rotation:1080,
        easing: Konva.Easings.EaseInOut,
        duration: tweenDuration
      });
      tween.play();
      setTimeout(function () {
          tween.reverse();
      }, tweenDuration*1000);
      if(justAnimate){
          return;
      }
      let newPieceImageIndex = Math.floor(Math.random() * piece.pieceImages.length);
      if(thiz.pieceIndices[index] === newPieceImageIndex){
          let pieceRef = thiz.props.matchRef.child('pieces').child(index)
                        .child('currentState').child('currentImageIndex');
          pieceRef.set((newPieceImageIndex+1)%piece.pieceImages.length);
          pieceRef.set(newPieceImageIndex);
      }else{
          let myImage = new Image();
          myImage.onload = function (){
              thiz.refs[canvasRef].refs.image.setImage(myImage);
              thiz.refs.piecesCanvasesLayer.draw();
          }
          thiz.pieceIndices[index] = newPieceImageIndex;
          myImage.src = piece.pieceImages[newPieceImageIndex];
          let value = {
              currentImageIndex:newPieceImageIndex,
              x: position.x/thiz.width*100,
              y: position.y/thiz.height*100,
              zDepth: ++thiz.maxZIndex
          };
          value = {currentState: value};
          let pieceRef = thiz.props.matchRef.child('pieces').child(index);
          pieceRef.set(value);
      }
  }

  showCardVisibility(index){
      this.visibleTo = [];
      if(this.cardVisibility[index]){
          let thiz = this;
          Object.keys(this.cardVisibility[index]).forEach((participantIndex)=>{
              this.visibleTo.push(thiz.participantNames[participantIndex]);
          });
      }
      let cardPosition = this.refs['canvasImage'+index].refs.image.getAbsolutePosition();
      let cardWidth = this.refs['canvasImage'+index].refs.image.attrs.width;
      let parentContainerX = this.refs.parentContainer.getBoundingClientRect().x;
      let position = {
          x: cardPosition.x + cardWidth + parentContainerX,
          y: cardPosition.y
      };
      this.props.showTooltip(position, this.visibleTo);
  }

  hideCardVisibility(canvasRef, piece){
      this.props.hideTooltip();
  }

  handleCardClick(canvasRef, index, piece){
      this.props.showCardOptions(index, this.selfParticipantIndex, this.participantNames, this.props.pieces[index].deckPieceIndex);
  }

  updateCardVisibility(props){
      let thiz = this;
      thiz.cardVisibility = {};
      props.pieces.forEach((piece, index)=>{
          if(piece.kind === 'card'){
              thiz.cardVisibility[index] = piece.cardVisibility ? piece.cardVisibility : null;
          }
      });
  }

  updateZIndex(index, z){
      let zIndex = z ? z : this.maxZIndex;
      this.maxZIndex = Math.max(zIndex, this.maxZIndex);
      let canvasRef = 'canvasImage'+index;
      this.refs[canvasRef].refs.image.setZIndex(zIndex);
      this.refs.piecesCanvasesLayer.draw();
  }

  render() {
    let self = this;
    if (this.props.board){
        if(this.board !== this.props.board){
            this.board = this.props.board;
            this.boardCanvas = (<CanvasImage height={this.height} width={this.height} src={this.board.src} />);
        }
    }
    if(this.createNewPieceCanvases){
        this.createNewPieceCanvases = false;
        this.maxZIndex = 0;
        this.canvasPiecesUpdated = this.canvasPiecesUpdated === null ? false : true;
        this.piecesCanvases = this.props.pieces.map(
            (piece, index) => {
                this.maxZIndex = Math.max(this.maxZIndex, piece.zDepth);
                if(piece.kind === 'cardsDeck' || piece.kind === 'piecesDeck'){
                    // Return nothing and making deck invisible because no need to display deck
                    return null;
                } else{
                    return (
                        <CanvasImage
                        ref={'canvasImage' + index}
                        key={index}
                        draggable={piece.draggable || piece.kind === 'standard'}
                        onClick={()=>{
                            if(piece.kind === 'standard'){
                                this.rotatePiece('canvasImage'+index, index, piece);
                            } else if(piece.kind === 'toggable'){
                                this.togglePiece('canvasImage'+index, index, piece);
                            } else if(piece.kind === 'dice'){
                                this.rollDice('canvasImage'+index, index, piece);
                            } else if(piece.kind === 'card'){
                                this.handleCardClick('canvasImage'+index, index, piece);
                            }
                        }}
                        onMouseOver={()=>{
                            this.props.hideCardOptions();
                            if(piece.kind === 'card'){
                                this.showCardVisibility(index);
                            }
                        }}
                        onMouseOut={()=>{
                            if(piece.kind === 'card'){
                                this.hideCardVisibility('canvasImage'+index, piece);
                            }
                        }}
                        height={piece.height*self.height/self.board.height}
                        width={piece.width*self.width/self.board.width}
                        x={piece.x*self.width/100}
                        y={piece.y*self.height/100}
                        src={piece.pieceImages[self.pieceIndices[index]]}
                        onDragStart={() => {self.handleDragStart(index)}}
                        onDragEnd={() => self.handleDragEnd(index)}/>
                    );
                }
            }
        );
    }
    return (
    <div ref='parentContainer'>
      <Stage width={this.width} height={this.height}>
        <Layer>
          {this.boardCanvas}
        </Layer>
        <Layer ref='piecesCanvasesLayer'>
            {this.piecesCanvases}
        </Layer>
      </Stage>
    </div>
    );
  }
}
