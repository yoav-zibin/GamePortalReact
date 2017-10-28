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
  }

  render() {
    let self = this;
    let pieces = null;
    if (this.props.board){
        if(this.board !== this.props.board){
            this.board = this.props.board;
            this.boardCanvas = (<CanvasImage height={this.height} width={this.height} src={this.board.src} />);
        }
        pieces = this.props.pieces.map(
            (piece, index) => {
                return (
                    <CanvasImage ref='image'
                    draggable={true}
                    height={piece.height*self.height/this.board.height}
                    width={piece.width*self.width/this.board.width}
                    src={piece.src} />
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
            {pieces}
        </Layer>
      </Stage>
    </div>
    );
  }
}
