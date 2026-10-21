import React, { useState } from "react";

import { useNavigate } from "react-router-dom";

import { loginUser } from "../../API/authApi.jsx";

import {
  saveAuth,
  getRole,
} from "../../Utils/auth";

import roleRoutes from "../../Utils/roleRoutes";

import "./Login.css";


function Login() {

  const navigate = useNavigate();


  const [formData, setFormData] = useState({

    username: "",

    password: "",

  });


  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setFormData((previousData) => ({

      ...previousData,

      [name]: value,

    }));
  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    setLoading(true);


    try {

      // Call common login API
      const response =
        await loginUser(formData);


      console.log(
        "Login Response:",
        response
      );


      // Check token
      if (!response.token) {

        throw new Error(
          "Token was not returned by API."
        );
      }


      // Store username and JWT token
      saveAuth(
        response.username,
        response.token
      );


      // Get role from JWT
      const role = getRole();


      console.log(
        "Logged-in Role:",
        role
      );


      // Check role
      if (!role) {

        throw new Error(
          "Role was not found in token."
        );
      }


      // Find dashboard
      const dashboard =
        roleRoutes[role];


      if (!dashboard) {

        throw new Error(
          `No dashboard configured for role: ${role}`
        );
      }


      // Redirect according to role
      navigate(dashboard);

    }

    catch (error) {

      console.error(
        "Login Error:",
        error
      );


      localStorage.removeItem("token");

      localStorage.removeItem("username");


      setError(
        error.message ||
        "Login failed."
      );

    }

    finally {

      setLoading(false);
    }
  };


  return (

    <div className="login-page">

      <form
        className="login-form"
        onSubmit={handleSubmit}
      >

        <h1>
          Login
        </h1>


        {error && (

          <div className="login-error">
            {error}
          </div>

        )}


        <label>
          Username
        </label>


        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter username"
          required
        />


        <label>
          Password
        </label>


        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter password"
          required
        />


        <button
          type="submit"
          disabled={loading}
        >

          {loading
            ? "Logging in..."
            : "Login"}

        </button>

      </form>

    </div>
  );
}


export default Login;