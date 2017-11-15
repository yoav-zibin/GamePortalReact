import React from 'react';
import './css/CreateGroup.css';
import { Button } from 'reactstrap';
import Social from './Social';

export default class CreateGroup extends React.Component {
    constructor(props){
        super(props);
    }

    handleCreateGroupButton(){
        if(this.props.createGroup){
            this.props.cancelCreateGroup();
        }else{
            this.props.create();
        }
    }

    render(){
        return(
            <div className="create-group-inner-container">
                <div className="welcome-container">
                        <h1 className="title-h1">Board Games <br/> Heaven</h1>
                        <Social/>
                        <h1 className="welcome-h1">Welcome</h1>
                </div>
                <div className="add-members-container">
                    <div className="create-group-button-container">
                        <h1 className="welcome-h1">
                            Join A Group <br/> Or
                        </h1>
                        {this.props.createGroup ?
                            <input
                                className='group-name-input'
                                type='text'
                                value={this.props.groupName}
                                onChange={this.props.updateGroupName}
                            />
                            :null}
                        <Button
                            className='create-group-button'
                            onClick={this.handleCreateGroupButton.bind(this)}
                            color='primary'
                            size='lg'
                            block>
                            {this.props.createGroup ? 'Cancel' : 'Create New Group'}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}
