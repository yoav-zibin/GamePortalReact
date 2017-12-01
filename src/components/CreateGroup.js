import React from 'react';
import './css/CreateGroup.css';
import { Button, Alert } from 'reactstrap';
import Social from './Social';

export default class CreateGroup extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            showSuccessLogin: false,
            showfailedLogin: false
        };
        this.alertTimeout = 3000;
    }

    handleCreateGroupButton(){
        if(this.props.createGroup){
            this.props.cancelCreateGroup();
        }else{
            this.props.create();
        }
    }

    successLogin(){
        let self = this;
        self.setState({
            showSuccessLogin: true
        });
        setTimeout(function () {
            self.setState({
                showSuccessLogin: false
            });
        }, self.alertTimeout);
    }

    failedLogin(){
        let self = this;
        self.setState({
            showfailedLogin: true
        });
        setTimeout(function () {
            self.setState({
                showfailedLogin: false
            });
        }, self.alertTimeout);
    }

    render(){
        return(
            <div className="create-group-inner-container">
                <div className="welcome-container">
                        <h1 className="title-h1">Board Games <br/> Heaven</h1>
                        <Social success={this.successLogin.bind(this)} failed={this.failedLogin.bind(this)}/>
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
                        <Button
                            className='create-group-button show-component-for-small-screens'
                            onClick={()=>{this.props.showMyGroups()}}
                            color='primary'
                            size='lg'
                            block>
                            My Groups
                        </Button>
                    </div>
                </div>
                <Alert color="success login-alert" isOpen={this.state.showSuccessLogin}>
                    Logged in Successfully
                </Alert>
                <Alert color="danger login-alert" isOpen={this.state.showfailedLogin}>
                    Invalid credentials or account already linked with other user.
                </Alert>
            </div>
        );
    }
}
