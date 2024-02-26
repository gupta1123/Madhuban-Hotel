import React from "react";
import { Layout, Menu } from "antd";
import {
  HomeOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  AppstoreAddOutlined,
  FileTextOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import "./Sidebar.css";
import { useHistory } from "react-router-dom"; // Import useHistory

const { Sider } = Layout;


const Sidebar = ({ userRole }) => {
  const history = useHistory(); // Get the history object
  console.log(userRole)
  return (
    <Sider width={200} theme="dark" className="sider">
      <div className="logo">
        <img src="/images/hotel-madhuban-logo.png" alt="Madhuban Hotel Logo" />
      </div>
      <Menu
        mode="vertical"
        theme="dark"
        defaultSelectedKeys={["1"]}
        className="menu"
      >
        {userRole === "RECEPTION" && (
          <>
            <Menu.Item key="1" icon={<HomeOutlined />} className="menu-item">
              <Link to="/frontdesk">Frontdesk</Link>
            </Menu.Item>
            {/* Reduce the spacing */}
            <Menu.Item key="2" icon={<CalendarOutlined />} className="menu-item">
              <Link to="/bookings">Create Booking</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<ApartmentOutlined />} className="menu-item">
              <Link to="/view-bookings">Booking List</Link>
            </Menu.Item>
           
            <Menu.Item key="6" icon={<FileTextOutlined />} className="menu-item">
              <Link to="/ledger">Ledger</Link>
            </Menu.Item>
            {/* Reduce the spacing */}
           
            {/* "Settings" icon at the bottom of "RECEPTION" */}
          </>
        )}
        {userRole === "HOUSEKEEPING" && (
          <Menu.Item key="1" icon={<AppstoreAddOutlined />} className="menu-item">
            <Link to="/HouseKeeping">HouseKeeping</Link>
          </Menu.Item>
        )}
        {userRole === "ADMIN" && (
          <>
            <Menu.Item key="1" icon={<HomeOutlined />} className="menu-item">
              <Link to="/frontdesk">Frontdesk</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<CalendarOutlined />} className="menu-item">
              <Link to="/bookings">Create Booking</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<ApartmentOutlined />} className="menu-item">
              <Link to="/view-bookings">Booking List</Link>
            </Menu.Item>
            <Menu.Item key="4" icon={<AppstoreAddOutlined />} className="menu-item">
              <Link to="/HouseKeeping">HouseKeeping</Link>{" "}
            </Menu.Item>
            <Menu.Item key="5" icon={<ApartmentOutlined />} className="menu-item">
              <Link to="/rooms">Rooms</Link>
            </Menu.Item>
            <Menu.Item key="6" icon={<FileTextOutlined />} className="menu-item">
              <Link to="/ledger">Ledger</Link>
            </Menu.Item>
            <Menu.Item key="7" icon={<ApartmentOutlined />} className="menu-item">
              <span onClick={() => history.push("/roomtype")}>Rooms Pricing</span>
            </Menu.Item>
            <Menu.Item key="8" icon={<FileTextOutlined />} className="menu-item">
              <Link to="/Report">Report</Link>
            </Menu.Item>
          </>
        )}
      </Menu>
    </Sider>
  );
};

export default Sidebar;