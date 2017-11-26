import React, { Component } from 'react';
import { Layer, Stage } from 'react-konva';
import CanvasImage from './CanvasImage';

export default class Board extends Component {
  constructor(){
      super();
      this.height = 650;
      this.width = 650;
      this.board = null;
      this.boardCanvas = null;
      this.createNewPieceCanvases = false;
      this.piecesCanvases = null;
      this.numMoves = -1;
  }

  componentDidMount(){
      this.createNewPieceCanvases = true;
      this.addPieceUpdateListener(this.props.matchRef);
  }

  componentWillReceiveProps(nextProps){
      if(nextProps.pieces !== this.props.pieces){
          this.createNewPieceCanvases = true;
      }
      if(nextProps.matchRef !== this.props.matchRef){
          if(this.props.matchRef){
              this.props.matchRef.off();
          }
          this.numMoves = -1;
          this.removePieceUpdateListener(this.props.matchRef);
          this.addPieceUpdateListener(nextProps.matchRef);
      }
  }

  addPieceUpdateListener(dbRef){
      let self = this;
      dbRef.child('pieces').on('child_added', function(snapshot) {
          if(snapshot.exists()){
              let val = snapshot.val();
              self.numMoves = Math.max(self.numMoves, parseInt(snapshot.key));
              let index = val.currentState.currentImageIndex;
              let position = {
                  x:val.currentState.x/100*self.width,
                  y:val.currentState.y/100*self.height
              };
              self.updatePosition(index, position.x, position.y);
          }
      });
  }

  removePieceUpdateListener(dbRef){
      dbRef.child('pieces').off();
  }

  updatePosition(index, x, y){
    if(this.refs['canvasImage'+index]){
        this.refs['canvasImage'+index].refs.image.position({
            x:x,
            y:y
        });
        if(this.refs.piecesCanvasesLayer)
            this.refs.piecesCanvasesLayer.draw();
    }
  }

  handleDragEnd(index){
      let position = this.refs['canvasImage'+index].refs.image.getAbsolutePosition();
      let value = {
          currentImageIndex:index,
          x: position.x/this.width*100,
          y: position.y/this.height*100,
          zDepth: 1
      };
      value = {currentState: value};
      let pieceRef = this.props.matchRef.child('pieces').child(this.numMoves+1);
      pieceRef.set(value);
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
        this.piecesCanvases = this.props.pieces.map(
            (piece, index) => {
                return (
                    <CanvasImage
                    ref={'canvasImage' + index}
                    key={index}
                    draggable={true}
                    height={piece.height*self.height/self.board.height}
                    width={piece.width*self.width/self.board.width}
                    x={piece.x*self.width/100}
                    y={piece.y*self.height/100}
                    src={piece.imageUrl}
                    onDragEnd={() => self.handleDragEnd(index)}/>
                );
            }
        );
    }

    return (
    <div>
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
