import React, { Component } from 'react';
import { Layer, Stage } from 'react-konva';
import CanvasImage from './CanvasImage';
import Konva from 'konva';
import {db, auth} from '../firebase';
import './css/Board.css';

export default class Board extends Component {
  constructor(props){
      super(props);
      this.height = 650;
      this.width = 650;
      this.board = null;
      this.boardCanvas = null;
      this.piecesCanvases = null;
      this.state = {
          showTooltip: false,
          tooltipPosition: null,
          showCardOptions: false
      };
  }

  componentWillMount(){
      let thiz = this;
      this.createNewPieceCanvases = true;
      this.updatePiecesListener = false;
      this.canvasPiecesUpdated = null;
      this.pieceIndices = new Array(this.props.pieces.length).fill(0);
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
              let position = {
                  x:val.currentState.x/100*thiz.width,
                  y:val.currentState.y/100*thiz.height
              };
              let imageIndex = val.currentState.currentImageIndex;
              if(thiz.props.pieces[index].kind === 'dice' && imageIndex !== thiz.pieceIndices[index]){
                  thiz.rollDice('canvasImage'+index, index, thiz.props.pieces[index], true)
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
              thiz.updatePosition(index, position.x, position.y);
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
                  let imageIndex = pieceState.currentState.currentImageIndex;
                  thiz.updatePosition(index, position.x, position.y);
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
              });
          }
      });
  }

  updateImage(index, imageIndex){
      let thiz = this;
      let canvasRef = 'canvasImage'+index;
      if(thiz.pieceIndices[index] != imageIndex){
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

  handleDragEnd(index){
      let position = this.refs['canvasImage'+index].refs.image.getAbsolutePosition();
      let value = {
          currentImageIndex: this.pieceIndices[index],
          x: position.x/this.width*100,
          y: position.y/this.height*100,
          zDepth: 1
      };
      value = {currentState: value};
      let pieceRef = this.props.matchRef.child('pieces').child(index);
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
              zDepth: 1
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
              zDepth: 1
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
      this.setState({
          showTooltip: true,
          tooltipPosition: position,
          showCardOptions: false
      });
  }

  hideCardVisibility(canvasRef, piece){
      this.setState({
          showTooltip: false,
      });
  }

  handleCardClick(canvasRef, index, piece){
      this.setState({
          showTooltip: false,
          showCardOptions: true
      });
      this.cardIndex = index;
  }

  makeCardVisibleToSelf(cardIndex){
      let refPath = `pieces/${cardIndex}/currentState/cardVisibility/${this.selfParticipantIndex}`;
      let visibilityRef = this.props.matchRef.child(refPath);
      visibilityRef.set(true);
  }

  makeCardVisibleToAll(cardIndex){
      Object.keys(this.participantNames).forEach((pi)=>{
          let refPath = `pieces/${cardIndex}/currentState/cardVisibility/${pi}`;
          let visibilityRef = this.props.matchRef.child(refPath);
          visibilityRef.set(true);
      });
  }

  makeCardHiddedToAll(cardIndex){
      let refPath = `pieces/${cardIndex}/currentState/cardVisibility`;
      let visibilityRef = this.props.matchRef.child(refPath);
      visibilityRef.set(null);
  }

  updateCardVisibility(){
      let thiz = this;
      thiz.cardVisibility = {};
      this.props.pieces.forEach((piece, index)=>{
          if(piece.kind === 'card'){
              thiz.cardVisibility[index] = piece.cardVisibility ? piece.cardVisibility : null;
          }
      });
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
        this.canvasPiecesUpdated = this.canvasPiecesUpdated === null ? false : true;
        this.updateCardVisibility();
        this.piecesCanvases = this.props.pieces.map(
            (piece, index) => {
                if(piece.kind === 'cardsDeck' || piece.kind === 'piecesDeck'){
                    // Return nothing and making deck invisible because no need to display deck
                    return null;
                    // return(
                    //     <CanvasImage
                    //     ref={'canvasImage' + index}
                    //     key={index}
                    //     draggable={false}
                    //     height={1}
                    //     width={1}
                    //     x={piece.x*self.width/100}
                    //     y={piece.y*self.height/100}
                    //     src={piece.pieceImages[self.pieceIndices[index]]}/>
                    // );
                } else{
                    return (
                        <CanvasImage
                        ref={'canvasImage' + index}
                        key={index}
                        draggable={piece.draggable || piece.kind === 'standard'}
                        onClick={()=>{
                            if(piece.kind === 'standard'){
                                //do nothing, just make it draggable
                            } else if(piece.kind === 'toggable'){
                                this.togglePiece('canvasImage'+index, index, piece);
                            } else if(piece.kind === 'dice'){
                                this.rollDice('canvasImage'+index, index, piece);
                            } else if(piece.kind === 'card'){
                                this.handleCardClick('canvasImage'+index, index, piece);
                            }
                        }}
                        onMouseOver={()=>{
                            if(piece.kind === 'card'){
                                this.setState({showCardOptions:false});
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
                        onDragEnd={() => self.handleDragEnd(index)}/>
                    );
                }
            }
        );
    }
    return (
    <div ref='parentContainer'>
        {
            this.state.showTooltip ?
            <div className='my-tooltip'
                style={{
                    left:this.state.tooltipPosition.x,
                    top: this.state.tooltipPosition.y
                }}>
                {
                    this.visibleTo.length > 0 ?
                    <span style={{textDecoration:'underline'}}>Card is Visible to:</span> :
                    'Card is visible to no one.'
                }
                <ul style={{padding:'0', listStyle:'none', margin:'0'}}>
                    {this.visibleTo.map((name, index)=>{
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
                                onClick={()=>{this.makeCardVisibleToSelf(this.cardIndex);}}>
                                Make Visible To me
                            </li>
                            <li className='card-options-item'
                                onClick={()=>{this.makeCardVisibleToAll(this.cardIndex);}}>
                                Make Visible To Everyone
                            </li>
                            <li className='card-options-item'
                                onClick={()=>{this.makeCardHiddedToAll(this.cardIndex);}}>
                                Hide From Everyone
                            </li>
                    </ul>
            </div> :
            null
        }

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
