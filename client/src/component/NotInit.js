// Node module
import React from "react";
import "./NotInit.css"; // Add this line to import the CSS

const NotInit = () => {
  return (
    <div className="not-init-container">
      <div className="loader"></div> {/* This is the loading animation */}
      <h3>The election has not been initialized.</h3>
      <p>Please Wait...</p>
    </div>
  );
};

export default NotInit;
