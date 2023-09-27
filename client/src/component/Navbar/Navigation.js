import React, { useState } from "react";
import { NavLink } from "react-router-dom";

import "./Navbar.css";

export default function Navbar({ title }) {
  const [open, setOpen] = useState(false);
  return (
    <nav>
      <NavLink to="/Voting" className="header2">
        <i className="fas fa-vote-yea"></i>{" "}
        {title != null ? title : "Election Commission"}
      </NavLink>
      <i onClick={() => setOpen(!open)} className="fas fa-bars burger-menu"></i>
    </nav>
  );
}
