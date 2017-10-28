import React, { Component } from 'react';
import Board from './Board';

export default class PlayArena extends Component {
  render() {
    let board = {
      src:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Chessboard480.svg/1200px-Chessboard480.svg.png',
      width:400,
      height:400
    };
    let pieces = [{
        src:'https://www.shareicon.net/data/128x128/2016/07/20/799015_chess_512x512.png',
        width:50,
        height:50
    }];

    return (
    <div>
      <Board board={board} pieces={pieces}/>
    </div>
    );
  }
}
