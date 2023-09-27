import React from "react";
import "./VoteEnded.css";

const VoteEnded = () => {
  return (
    <div className="success-container">
      <div className="icon-wrapper">
        <i className="fas fa-poll"></i>
      </div>
      <div className="success-message">
        මැතිවරණය අවසන් විය! <br /> <br />
        தேர்தல் முடிந்தது!
        <br /> <br />
        Election ended!
      </div>
    </div>
  );
};

export default VoteEnded;
