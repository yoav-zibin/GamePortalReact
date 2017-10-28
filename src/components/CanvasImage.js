import { Image } from 'react-konva';
import React from 'react';

// try drag& drop rectangle
class CanvasImage extends React.Component {
  constructor(){
      super();
      this.state = {
          image: null
      };
      this.src = null;
  }
  loadImage() {
    const image = new window.Image();
    image.src = this.props.src;
    image.onload = () => {
      this.setState({
        image: image
      });
    };
  }

  render() {
    if(this.src != this.props.src){
        this.src = this.props.src;
        this.loadImage();
    }
    return <Image ref="image" {...this.props} image={this.state.image} />;
  }
}

export default CanvasImage;
