import React from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/" className="nav-link">
            Home
          </Link>
        </li>
        <li>
          <Link to="/map" className="nav-link">
            Map
          </Link>
        </li>
        <li>
          <Link to="/graph" className="nav-link">
            Graph
          </Link>
        </li>
        <li>
          <Link to="/fileUploads" className="nav-link">
            File Uploads
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
