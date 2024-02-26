import React, { useState, useEffect } from "react";
import { Input, Button, Typography, Card, Modal } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  SettingOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import "./Settings.css";

const { Title } = Typography;

function Settings({ authToken, onLogoutSuccess }) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [signOutVisible, setSignOutVisible] = useState(false);

  useEffect(() => {
    // Fetch user details from the API when the component mounts
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(
          'http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/user-details',
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setName(data.username || "");
          setPhoneNumber(data.phone || "");
          setEmail(data.email || "");
          setRole(data.roles || "");
        } else {
          throw new Error('Failed to fetch user details');
        }
      } catch (error) {
        console.error("Fetch user details error:", error);
      }
    };

    fetchUserDetails();
  }, [authToken]);

  const showSignOutModal = () => {
    setSignOutVisible(true);
  };

  const handleSignOut = async () => {
    try {
      const response = await fetch('http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        localStorage.clear();
        setSignOutVisible(false);

        if (onLogoutSuccess) {
          onLogoutSuccess();
        }
      } else {
        throw new Error('Failed to log out');
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleCancelSignOut = () => {
    setSignOutVisible(false);
  };

  return (
    <div className="settings-container">
      <Card
        className="settings-card"
        title={
          <Title level={3}>
            <SettingOutlined className="setting-icon" /> Settings
          </Title>
        }
      >
        <div className="setting-item">
          <UserOutlined className="setting-icon" />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <div className="setting-item">
          <PhoneOutlined className="setting-icon" />
          <Input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number"
          />
        </div>
        <div className="setting-item">
          <MailOutlined className="setting-icon" />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
          />
        </div>
        <div className="setting-item">
          <label>Role:</label>
          <Input
            value={role}
            disabled
          />
        </div>
        <Button
          type="default"
          icon={<ExclamationCircleOutlined />}
          onClick={showSignOutModal}
        >
          Sign Out
        </Button>
      </Card>
      <Modal
        title="Confirm Sign Out"
        visible={signOutVisible}
        onOk={handleSignOut}
        onCancel={handleCancelSignOut}
        okText="Yes"
        cancelText="No"
        width={300}
      >
        <p>Are you sure you want to sign out?</p>
      </Modal>
    </div>
  );
}

export default Settings;