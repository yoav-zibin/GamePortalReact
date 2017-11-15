import React, { Component } from 'react';
import './css/DeleteMember.css';
import { Button } from 'reactstrap';

export default class DeleteMember extends Component {
    constructor(props){
        super(props);
    }

    deleteMembers(){
        // implement logic here
        this.props.doneDeleting();
    }

  render() {

    return (
        <div className="delete-member-container">
            Hello! <br/>
            You can get groupd id by this.props.groupId <br/>
            {this.props.groupId} <br/>
            The css is in ./css/DeleteMember.css <br/>
            <Button color="success del-btn" onClick={this.deleteMembers.bind(this)}>
                Delete
            </Button>
        </div>
    );
  }
}
