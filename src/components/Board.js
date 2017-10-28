import React, { Component } from 'react';
import { Layer, Stage, Image } from 'react-konva';
import CanvasImage from './CanvasImage';

export default class Board extends Component {
  constructor(){
      super();
      this.height = 500;
      this.width = 500;
      this.board = null;
      this.boardCanvas = null;
      this.pieces = null;
      this.piecesCanvases = null;
  }

  render() {
    let self = this;
    if (this.props.board){
        if(this.board !== this.props.board){
            this.board = this.props.board;
            this.boardCanvas = (<CanvasImage height={this.height} width={this.height} src={this.board.src} />);
        }
    }
    if(this.props.pieces.length > 0 && this.pieces !== this.props.pieces){
        this.pieces = this.props.pieces;
        this.piecesCanvases = this.pieces.map(
            (piece, index) => {
                return (
                    <CanvasImage ref='image'
                    key={index}
                    draggable={true}
                    height={piece.height*self.height/this.board.height}
                    width={piece.width*self.width/this.board.width}
                    x={piece.x*this.width/100}
                    y={piece.y*this.height/100}
                    src={piece.imageUrl} />
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
        <Layer>
            {this.piecesCanvases}
        </Layer>
      </Stage>
    </div>
    );
  }
}
