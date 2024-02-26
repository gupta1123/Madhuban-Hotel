import React, { useState } from "react";
import { BrowserRouter as Router, Route, Switch,Redirect } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import MainApp from "./MainApp";
import "./App.css";
import { useNavigate } from 'react-router-dom'; // For React Router v6

function App() {
  const [currentPage, setCurrentPage] = useState('initial'); // Use React Router for navigation if possible
  const [authToken, setAuthToken] = useState('');
  const [userRole, setUserRole] = useState('');

  const [loginError, setLoginError] = useState('');
  const handleLogin = async (values) => {
    console.log("Login with", values.username, values.password);
    const loginData = {
      username: values.username,
      password: values.password,
    };
    console.log("Payload for Login:", loginData);

    try {
      const response = await fetch(
        "http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        if (errorData.includes("Bad credentials")) {
          // Here, instead of alert, we set the error message to state
          setLoginError("Incorrect username or password. Please try again.");
        } else {
          setLoginError("Login failed due to server error. Please try again later.");
        }
        return; // Keep the user on the login page by not changing the current page state
      }

      // On successful login, reset any previous error messages
      setLoginError('');
      const responseData = await response.text();
      console.log("Login Response:", responseData);
      const [userRole, token] = responseData.split(' '); // Destructure assuming format "ROLE token"

      console.log("User Role:", userRole);
      setUserRole(userRole); // Set the user role in state
      setAuthToken(token); // Save the token in state

      // Store token and expiry in localStorage
      const expiryTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      localStorage.setItem('authToken', token);
      localStorage.setItem('expiryTime', expiryTime.toString());

      if (role === 'ADMIN' || role === 'RECEPTION') {
        navigate('/frontdesk');
      } else if (role === 'HOUSEKEEPING') {
        navigate('/housekeeping');
      } else {
        navigate('/'); // Default route if role doesn't match expected values
      }
        
        } catch (error) {
      console.error("Login error:", error);
      setLoginError("An error occurred during login. Please try again.");
    }
  };

  const handleLogoutSuccess = () => {
    setAuthToken('');

    setCurrentPage('initial'); // Or 'login', depending on where you want to redirect after logout
  };

  const handleRegister = async (values) => {
    if (values.password !== values.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    console.log("Register with", values.username, values.password, values.confirmPassword, "Role:", values.role);

    // Ensure 'role' field is correctly populated from form values
    const registrationData = {
      username: values.username,
      password: values.password,
      roles: values.roles, // This should match the 'name' attribute of the Select component in your form
    };
    console.log("Payload for Registration:", registrationData);

    try {
      const response = await fetch(
        "http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registrationData),
        }
      );

      if (!response.ok) {
        // Handle HTTP errors
        throw new Error('Failed to register');
      }

      const responseData = await response.json();
      console.log("Registration Response:", responseData);

      alert('Registration successful');
      setCurrentPage('login'); // Navigate to login page after successful registration
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed: " + error.message);
    }
  };

  return (
    <Router>
      <Switch>
        <Route path="/login">
          <Login onLogin={handleLogin} loginError={loginError} onNavigate={setCurrentPage} />
        </Route>
        <Route path="/register">
          <Register onRegister={handleRegister} onNavigate={setCurrentPage} />
        </Route>
        <Route path="/">
          {authToken ? <MainApp authToken={authToken} userRole={userRole} /> : <Redirect to="/login" />}
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
