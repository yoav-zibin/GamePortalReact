import React from 'react';
import { Button } from 'reactstrap';
import Select from 'react-select';

export default class AddParticipants extends React.Component {

  constructor(){
      super();
      this.state = {
          participant: ''
      };
  }

  addParticipant(){
      this.props.addParticipant(this.state.participant);
  }

  handleOnChange(event){
      let participant = event.target.value;
      this.setState({participant:participant});
  }

  style = {
      width: '300px'
  }

  style_button = {
      width: '120px'
  }

  render() {
    return (
        <div className='game-selector-container'>
        <input style={this.style} value={this.state.participant} onChange={this.handleOnChange.bind(this)}/>
        <Button style={this.style_button} color="success load-game-btn" onClick={this.addParticipant.bind(this)}>Add</Button>
        </div>
    );
  }
}
