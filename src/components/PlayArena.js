import React, { Component } from 'react';
import { Layer, Stage, Image } from 'react-konva';

export default class PlayArena extends Component {
  constructor(){
      super();
      this.state = {
          image : null
      };
  }

  componentDidMount() {
    const image = new window.Image();
    const piece = new window.Image();
    image.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Chessboard480.svg/1200px-Chessboard480.svg.png';
    piece.src = 'https://www.shareicon.net/data/128x128/2016/07/20/799015_chess_512x512.png';
    image.onload = () => {
        this.setState({
          image: image
        });
    }
    piece.onload = () => {
        this.setState({
          piece: piece
        });
    }
  }

  render() {
    return (
    <div>
      <Stage width={400} height={400}>
        <Layer>
          <Image ref='image' height={400} width={400} image={this.state.image} />
        </Layer>
        <Layer>
            <Image ref='image' draggable={true} height={50} width={50} image={this.state.piece} />
        </Layer>
      </Stage>
    </div>
    );
  }
}
