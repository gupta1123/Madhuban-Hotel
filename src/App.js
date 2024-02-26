// import React from "react";
// import { Layout } from "antd";
// import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
// import Navbar from "./components/Navbar";
// import Sidebar from "./components/Sidebar";
// import Footer from "./components/Footer.js";
// import Frontdesk from "./pages/Frontdesk";
// import Bookings from "./pages/Bookings";
// import Rooms from "./pages/Rooms";
// import Card from "./pages/Card";
// import RoomTypes from "./pages/RoomTypes";
// import FilterBar from "./pages/FilterBar";
// import { BookingProvider } from "./pages/BookingContext";
// import ViewBookings from "./pages/ViewBookings";
// import BookingConfirmation from "./pages/BookingConfirmation";
// import BookingDetails from "./pages/BookingDetails";
// import HouseKeeping from "./pages/HouseKeeping";
// import Payment from "./pages/Payment";
// import Invoice from "./pages/Invoice";

// import AddGuests from "./pages/AddGuest";
// import "./App.css";

// const { Content } = Layout;

// function App() {
//   return (
//     <Router>
//       <BookingProvider>
//         <Layout style={{ minHeight: "100vh" }}>
//           <Sidebar />
//           <Layout>
//             <Navbar />
//             <Content style={{ margin: "16px" }}>
//               <Switch>
//                 <Route path="/frontdesk" component={Frontdesk} />
//                 <Route path="/bookings" component={Bookings} />
//                 <Route path="/bookingDetails" component={BookingDetails} />
//                 <Route
//                   path="/bookingConfirmation"
//                   component={BookingConfirmation}
//                 />
//                 <Route path="/payments" component={Payment} />
//                 <Route path="/rooms" component={Rooms} />
//                 <Route path="/room-types" component={RoomTypes} />
//                 <Route path="/view-bookings" component={ViewBookings} />
//                 <Route path="/HouseKeeping" component={HouseKeeping} />
//                 <Route path="/invoice" component={Invoice} />
//                 <Route path="/add-guests" component={AddGuests} />
//               </Switch>
//             </Content>
//           </Layout>
//         </Layout>
//       </BookingProvider>
//     </Router>
//   );
// }

// export default App;


import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from "./components/Navbar.js";
import Sidebar from "./components/Sidebar.js";
import Footer from "./components/Footer.js";
import Frontdesk from "./pages/Frontdesk.js";
import Bookings from "./pages/Bookings.js";
import Rooms from "./pages/Rooms.js";
import FilterBar from "./pages/FilterBar.js";
import { BookingProvider } from "./pages/BookingContext.js";
import ViewBookings from "./pages/ViewBookings.js";
import BookingConfirmation from "./pages/BookingConfirmation.js";
import BookingDetails from "./pages/BookingDetails.js";
import HouseKeeping from "./pages/HouseKeeping.js";
import Payment from "./pages/Payment.js";
import Invoice from "./pages/Invoice.js";
import GroupInvoice from "./pages/GroupInvoice.js";

import { Button, Input, Form } from 'antd';
import { Provider } from "react-redux";
import { Select } from "antd";
import Ledger from "./pages/Ledger.js";
import AddRoom from "./pages/AddRoom.js";
import { useHistory } from 'react-router-dom';
import Settlement from "./pages/Settlement.js";
import GroupSettlement from './pages/GroupSettlement';
import AddGuests from "./pages/AddGuest.js";
import RoomType from "./pages/RoomType.js";
import Settings from "./pages/Settings.js";
import GroupBookingConfirmation from "./pages/GroupBookingConfirmation.js";
import Report from "./pages/Report.js";

import "./App.css";

const { Content } = Layout;

function App() {
  const history = useHistory();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPage, setCurrentPage] = useState('initial'); // 'initial', 'login', 'register'
  const [loginResponse, setLoginResponse] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [loginError, setLoginError] = useState('');
  const formCardStyle = {
    width: 300,
    margin: 'auto',
    marginTop: '20vh', // Adjust this value as needed to center vertically
  };

  const checkAuthToken = () => {
    const token = localStorage.getItem('authToken');
    const expiryTime = localStorage.getItem('expiryTime');
    const userRole = localStorage.getItem('userRole'); // Retrieve the user role
    const currentTime = new Date().getTime();

    if (token && expiryTime && currentTime < parseInt(expiryTime)) {
      setAuthToken(token);
      setUserRole(userRole); // Set the user role in state
      setCurrentPage('app'); // Keep the user logged in
    } else {
      handleLogout(); // Clear the auth state and redirect to login
    }
  };

  useEffect(() => {
    checkAuthToken();
  }, []);


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
      localStorage.setItem('userRole', userRole); // Assuming 'userRole' is obtained from login response

      console.log("User Role:", userRole);
      setUserRole(userRole); // Set the user role in state
      setAuthToken(token); // Save the token in state

      console.log('user', userRole)
      // Store token and expiry in localStorage
      const expiryTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      localStorage.setItem('authToken', token);
      localStorage.setItem('expiryTime', expiryTime.toString());

      setCurrentPage('app'); // Redirect user to the main app page
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("An error occurred during login. Please try again.");
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('expiryTime');
    localStorage.removeItem('userRole'); // Clear the user role
    setAuthToken('');
    setUserRole(''); // Reset user role in state
    setCurrentPage('initial');
  };


  const handleLogoutSuccess = () => {
    setAuthToken('');

    setCurrentPage('initial'); // Or 'login', depending on where you want to redirect after logout
  };

  // useEffect(() => {
  //   // Check if the user role is set to ADMIN and if so, navigate to the frontdesk route
  //   if (userRole === 'ADMIN') {
  //     history.push('/frontdesk');
  //   }
  // }, [userRole, history]);

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
      <div className="centered-card">
        {currentPage === "initial" && (
          <div className="custom-card">
            <h2>Welcome to Madhuban Hotel</h2>
            <Button
              type="primary"
              onClick={() => setCurrentPage("login")}
            >
              Login
            </Button>
            <Button
              type="default"
              onClick={() => setCurrentPage("register")}
              style={{ marginLeft: "10px" }} disabled
            >
              Register
            </Button>
          </div>
        )}
        {currentPage === "login" && (
          <div className="custom-card">
            <h2>Login</h2>
            <Form onFinish={handleLogin}>
              <Form.Item
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Please input your username!",
                  },
                ]}
              >
                <Input
                  className="custom-input"
                  placeholder="Username"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
              >
                <Input
                  className="custom-input"
                  type="password"
                  placeholder="Password"
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Login
                </Button>
                <Button
                  type="default"
                  onClick={() => setCurrentPage("initial")}
                  style={{ marginLeft: "10px" }}
                >
                  Back
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}

        {currentPage === "register" && (
          <div className="custom-card">
            <h2>Register</h2>
            <Form onFinish={handleRegister}>
              <Form.Item
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Please input your username!",
                  },
                ]}
              >
                <Input
                  className="custom-input"
                  placeholder="Username"
                />
              </Form.Item>
              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password placeholder="Password" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: 'Please confirm your password!',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords that you entered do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm Password" />
              </Form.Item>
              <Form.Item
                name="roles"
                rules={[{ required: true, message: 'Please select your role!' }]}
              >
                <Select placeholder="Select a role">
                  <Select.Option value="RECEPTION">RECEPTION</Select.Option>
                  <Select.Option value="ADMIN">ADMIN</Select.Option>
                  <Select.Option value="HOUSEKEEPING">HOUSE KEEPING</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Register
                </Button>
                <Button
                  type="default"
                  onClick={() => setCurrentPage("login")}
                  style={{ marginLeft: "10px" }}
                >
                  Back to Login
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
        {currentPage === 'app' && (
          <BookingProvider>
            <Layout style={{ minHeight: "100vh" }}>
              {userRole && <Sidebar userRole={userRole} />}
              <Layout>
                <Navbar />
                <Content style={{ margin: "16px" }}>
                  <Switch>
                    <Route path="/frontdesk" render={(props) => <Frontdesk {...props} authToken={authToken} />} />
                    <Route path="/bookings" render={(props) => <Bookings {...props} authToken={authToken} />} />
                    {/* <Route path="/bookingDetails" render={(props) => <BookingDetails {...props} authToken={authToken} />} /> */}
                    <Route
                      path="/bookingDetails"
                      render={(routeProps) => <BookingDetails {...routeProps} authToken={authToken} />}
                    />
                    <Route
                      path="/bookingConfirmation"
                      render={(routeProps) => <BookingConfirmation {...routeProps} authToken={authToken} />}
                    />
                    <Route
                      path="/payments"
                      render={(routeProps) => <Payment {...routeProps} authToken={authToken} />}
                    />
                    <Route
                      path="/rooms"
                      render={(routeProps) => <Rooms {...routeProps} authToken={authToken} />}
                    />
                    <Route
                      path="/addRoom"
                      render={(routeProps) => <AddRoom {...routeProps} authToken={authToken} />}
                    />

                    {/* <Route path="/view-bookings" render={(props) => <ViewBookings {...props} authToken={authToken} />} /> */}
                    <Route
                      path="/view-bookings"
                      render={(routeProps) => <ViewBookings {...routeProps} authToken={authToken} />}
                    />

                    <Route
                      path="/HouseKeeping"
                      render={(routeProps) => <HouseKeeping {...routeProps} authToken={authToken} />}
                    />
                    <Route
                      path="/Settlement"
                      render={(routeProps) => <Settlement {...routeProps} authToken={authToken} />}
                    />
                    <Route
                      path="/add-guests"
                      render={(routeProps) => <AddGuests {...routeProps} authToken={authToken} />}
                    />
                    <Route
                      path="/invoice"
                      render={(routeProps) => <Invoice {...routeProps} authToken={authToken} />}
                    />
                    <Route
                      path="/Groupinvoice"
                      render={(routeProps) => <GroupInvoice {...routeProps} authToken={authToken} />}
                    />
                    <Route
                      path="/roomtype"
                      render={(routeProps) => <RoomType {...routeProps} authToken={authToken} />}
                    />
                    <Route
                      path="/GroupBookingConfirmation"
                      render={(routeProps) => <GroupBookingConfirmation {...routeProps} authToken={authToken} />}
                    />
                    <Route
                      path="/settings"
                      render={(routeProps) => <Settings {...routeProps} authToken={authToken} onLogoutSuccess={handleLogoutSuccess} />}
                    />

                    <Route
                      path="/ledger"
                      render={(routeProps) => <Ledger {...routeProps} authToken={authToken} />}
                    />
                    <Route
                      path="/navbar"
                      render={(routeProps) => <Navbar {...routeProps} authToken={authToken} onLogoutSuccess={handleLogoutSuccess} />}
                    />
                   <Route
                      path="/GroupSettlement"
                      render={(routeProps) => <GroupSettlement {...routeProps} authToken={authToken} />}
                    />

                    <Route
                      path="/Settlement"
                      render={(routeProps) => <Settlement {...routeProps} authToken={authToken} />}
                    />
                    <Route
                      path="/Report"
                      render={(routeProps) => <Report {...routeProps} authToken={authToken} />}
                    />
                  </Switch>
                </Content>
              </Layout>
            </Layout>
          </BookingProvider>
        )}

      </div>
    </Router>
  );
}

export default App;  