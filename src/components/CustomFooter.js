import React from "react";
import { Button } from "antd";

const CustomFooter = ({ primaryCTA, secondaryCTA }) => {
  return (
    <div className="custom-footer">
      <div className="custom-footer-content">
        {primaryCTA && (
          <Button type="primary" onClick={primaryCTA.onClick}>
            {primaryCTA.label}
          </Button>
        )}
        {secondaryCTA && (
          <Button onClick={secondaryCTA.onClick}>{secondaryCTA.label}</Button>
        )}
      </div>
    </div>
  );
};

export default CustomFooter;
