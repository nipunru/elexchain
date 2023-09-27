import React from "react";

import "./Footer.css";

const Footer = () => (
  <>
    <div className="footer-block"></div>
    <div className="footer">
      <div className="footer-container">
        <p>
          &copy; {new Date().getFullYear()} ElexChain: Blockchain based voting
          system
        </p>
      </div>
    </div>
  </>
);

export default Footer;
