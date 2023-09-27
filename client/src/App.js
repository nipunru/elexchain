import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import {
  transitions,
  positions,
  Provider as AlertProvider,
  withAlert,
} from "react-alert";
import AlertTemplate from "react-alert-template-basic";

import Home from "./component/Home";
import Voting from "./component/Voter/Voting/Voting";
import Results from "./component/Admin/Results/Results";
import Login from "./component/Login/Login";
import Footer from "./component/Footer/Footer";

import "./App.css";

class App extends Component {
  render() {
    const options = {
      // you can also just use 'bottom center'
      position: positions.MIDDLE,
      timeout: 5000,
      offset: "30px",
      // you can also just use 'scale'
      transition: transitions.SCALE,
    };

    const CustomAlertTemplate = (props) => {
      return <AlertTemplate {...props} style={{ backgroundColor: "gray" }} />; //<---- customColor sets here
    };
    return (
      <AlertProvider template={CustomAlertTemplate} {...options}>
        <div className="App">
          <Router>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/Voting" component={Voting} />
              <Route exact path="/Results" component={Results} />
              <Route exact path="*" component={NotFound} />
            </Switch>
          </Router>
          <Footer />
        </div>
      </AlertProvider>
    );
  }
}
class NotFound extends Component {
  render() {
    return (
      <>
        <h1>404 NOT FOUND!</h1>
        <center>
          <p>
            The page your are looking for doesn't exist.
            <br />
            Go to{" "}
            <Link
              to="/"
              style={{ color: "black", textDecoration: "underline" }}
            >
              Home
            </Link>
          </p>
        </center>
      </>
    );
  }
}

export default App;
