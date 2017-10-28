import React, { Component } from 'react';
import { Layer, Stage, Image } from 'react-konva';
import CanvasImage from './CanvasImage';

export default class Board extends Component {
  constructor(){
      super();
      this.height = 500;
      this.width = 500;
  }

  render() {
    let self = this;
    let board = this.props.board;
    let pieces = this.props.pieces.map(
        (piece, index) => {
            return (
                <CanvasImage ref='image'
                draggable={true}
                height={piece.height*self.height/board.height}
                width={piece.width*self.width/board.width}
                src={piece.src} />
            );
        }
    );

    return (
    <div>
      <Stage width={this.width} height={this.height}>
        <Layer>
          <CanvasImage height={this.height} width={this.height} src={board.src} />
        </Layer>
        <Layer>
            {pieces}
        </Layer>
      </Stage>
    </div>
    );
  }
}
