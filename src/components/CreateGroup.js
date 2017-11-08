import React from 'react';
import './css/CreateGroup.css';
import { Button } from 'reactstrap';

export default class CreateGroup extends React.Component {
    render(){
        return(
            <div className="create-group-inner-container">
                <div className="welcome-container">
                        <h1 className="title-h1">Board Games <br/> Heaven</h1>
                        <h1 className="welcome-h1">Welcome</h1>
                </div>
                <div className="add-members-container">
                    <div className="create-group-button-container">
                        <h1 className="welcome-h1">
                            Join A Group <br/> Or
                        </h1>
                        <Button className='create-group-button' color='primary' size='lg' block>
                            Create New Group
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}
