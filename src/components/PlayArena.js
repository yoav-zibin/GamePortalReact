import React, { Component } from 'react';
import { Layer, Stage, Image } from 'react-konva';
import CanvasImage from './CanvasImage';

export default class PlayArena extends Component {
  render() {
    //Temp variables
    var board = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Chessboard480.svg/1200px-Chessboard480.svg.png';
    var piece = 'https://www.shareicon.net/data/128x128/2016/07/20/799015_chess_512x512.png';

    return (
    <div>
      <Stage width={400} height={400}>
        <Layer>
          <CanvasImage height={400} width={400} src={board} />
        </Layer>
        <Layer>
            <CanvasImage ref='image' draggable={true} height={50} width={50} src={piece} />
        </Layer>
      </Stage>
    </div>
    );
  }
}
