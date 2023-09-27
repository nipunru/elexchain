// Login.js

import React, { useState } from "react";
import axios from "axios"; // You need to install axios using npm install axios

import "./Login.css";

export default function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:4001/user-service/v1/login",
        {
          email: email,
          password: password,
        }
      );

      if (response.data.success) {
        // Assuming you want to keep the token and user details in local storage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("level", response.data.level);

        // Redirect to Home page after successful login
        if (response.data.level == 1) {
          props.history.push("/");
        } else {
          props.history.push("/Voting");
        }
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError("Error logging in. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="login-btn">
          Login
        </button>
      </form>
    </div>
  );
}
