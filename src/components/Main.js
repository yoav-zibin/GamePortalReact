import React from "react";
import { Switch, Route } from "react-router-dom";
import Hello from "./Hello";
import PhoneAuth from "./PhoneAuth";
import Login from "./Login";
import Register from "./Register";

// The Main component renders one of the three provided
// Routes (provided that one matches). Both the /roster
// and /schedule routes will match any pathname that starts
// with /roster or /schedule. The / route will only match
// when the pathname is exactly the string "/"
const Main = () => (
  <main>
    <Switch>
      <Route path="/Hello" component={Hello} />
      <Route path="/PhoneAuth" component={PhoneAuth} />
      <Route path="/Login" component={Login} />
      <Route path="/Signup" component={Register} />
    </Switch>
  </main>
);

export default Main;
