import React, { useState,useEffect } from "react";
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
import { Button, Input, Form } from 'antd';
import { Provider } from "react-redux";
import { Select } from "antd";
import Ledger from "./pages/Ledger.js";
import AddRoom from "./pages/AddRoom.js";

import AddGuests from "./pages/AddGuest.js";
import RoomType from "./pages/RoomType.js";
import Settings from "./pages/Settings.js";
const { Content } = Layout;

const MainApp = ({ authToken, userRole }) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar userRole={userRole} />
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
                      path="/add-guests"
                      render={(routeProps) => <AddGuests {...routeProps} authToken={authToken} />}
                    />
                    <Route
                      path="/invoice"
                      render={(routeProps) => <Invoice {...routeProps} authToken={authToken} />}
                    />

                    <Route
                      path="/roomtype"
                      render={(routeProps) => <RoomType {...routeProps} authToken={authToken} />}
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
          </Switch>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainApp;
