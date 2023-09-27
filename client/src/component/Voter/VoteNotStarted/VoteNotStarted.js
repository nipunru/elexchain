import React from "react";
import "./VoteNotStarted.css";

const VoteNotStarted = () => {
  return (
    <div className="success-container">
      <div className="icon-wrapper">
        <i className="fas fa-person-booth"></i>
      </div>
      <div className="success-message">
        තවම මැතිවරණය ආරම්භ වී නැත! <br /> <br />
        இன்னும் தேர்தல் தொடங்கவில்லை!
        <br /> <br />
        Election not started yet!
      </div>
    </div>
  );
};

export default VoteNotStarted;
