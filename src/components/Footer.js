import React from "react";
import { Layout, Button } from "antd";
import "./Footer.css";

const { Footer: AntFooter } = Layout;

const Footer = () => {
  return (
    <AntFooter className="footer">
      <div className="footer-buttons">
        <Button type="primary">Next</Button>
        <Button type="secondary">Process</Button>
      </div>
    </AntFooter>
  );
};

export default Footer;
