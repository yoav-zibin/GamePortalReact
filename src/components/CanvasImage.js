import { Image } from 'react-konva';
import React from 'react';

// try drag& drop rectangle
class CanvasImage extends React.Component {
  state = {
    image: null
  };
  componentDidMount() {
    const image = new window.Image();
    image.src = this.props.src;
    image.onload = () => {
      this.setState({
        image: image
      });
    };
  }

  render() {
      console.log('simi', this.props);
    return <Image ref="image" {...this.props} image={this.state.image} />;
  }
}

export default CanvasImage;
