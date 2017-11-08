import React from "react";
import { Switch, Route } from "react-router-dom";
import ChooseGroup from './ChooseGroup';
import Play from './Play';

const RouteManager = ()=> {
    let style = {
        height: '100%',
        position: 'relative'
    };
    return (
    <div style={style}>
        <Switch>
            <Route exact path="/" component={ChooseGroup} />
            <Route path="/play" component={Play}/>
        </Switch>
    </div>
    );
}

export default RouteManager;
