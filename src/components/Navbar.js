import React, { useState } from "react";
import { Layout, Menu, Dropdown } from "antd";
import { SettingOutlined, UserOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import "./Navbar.css";

const { Header } = Layout;

const Navbar = ({ onLogoutSuccess }) => {
  const history = useHistory();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleCancelDropdown = () => {
    setDropdownVisible(false);
  };

  const menu = (
    <Menu>
      <Menu.Item key="0" icon={<UserOutlined />} onClick={() => history.push("/settings")}>
        Settings
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="navbar">
      <div className="logo" />
      <Dropdown overlay={menu} trigger={['click']} visible={dropdownVisible} onVisibleChange={setDropdownVisible}>
        <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()} style={{ marginLeft: 'auto' }}>
          <SettingOutlined style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '20px', cursor: 'pointer' }} />
        </a>
      </Dropdown>
    </Header>
  );
};

export default Navbar;
