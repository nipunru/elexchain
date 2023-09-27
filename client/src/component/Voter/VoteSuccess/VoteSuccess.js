import React from "react";
import "./VoteSuccess.css";

const VoteSuccess = () => {
  return (
    <div className="success-container">
      <div className="icon-wrapper">
        <i className="fas fa-vote-yea"></i>
      </div>
      <div className="success-message">
        ඔබේ ඡන්දය සාර්ථකව නැවත සටහන් විය! <br /> <br />
        உங்கள் வாக்கு வெற்றிகரமாக பதிவு செய்யப்பட்டது!
        <br /> <br />
        Your vote successfully recorded!
      </div>
    </div>
  );
};

export default VoteSuccess;
