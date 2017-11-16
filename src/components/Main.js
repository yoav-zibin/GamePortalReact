import React from "react";
import { Switch, Route } from "react-router-dom";
import PhoneAuth from "./PhoneAuth";
import Login from "./Login";
import Register from "./Register";

// The Main component renders one of the three provided
// Routes (provided that one matches). Both the /roster
// and /schedule routes will match any pathname that starts
// with /roster or /schedule. The / route will only match
// when the pathname is exactly the string "/"
const Main = () => {
    var myStyle = {
        height: '100%'
    };
    return (
      <div style={myStyle}>
        <Switch>
          <Route path="/PhoneAuth" component={PhoneAuth} />
          <Route path="/Register" component={Register} />
          <Route path="/" component={Login} />
        </Switch>
    </div>
    );
}

export default Main;
