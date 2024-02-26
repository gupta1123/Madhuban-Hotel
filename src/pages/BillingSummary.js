import React, { useState, useEffect } from "react";
import { Card, Typography, Divider } from "antd";
import styled from "styled-components";

const { Title, Text } = Typography;

const BillingSummary = ({
  total_room_charges = 0,
  gstAmount = 0,
  total_addon_charges = 0,
  discount = 0,
  grossAmount = 0,
  paid_amount = 0,
  pending_amount = 0,
}) => {
  const calculateTotal = () => {
    // Ensure values are numbers and provide default value to avoid undefined
    const subtotal = (total_room_charges || 0) + (total_addon_charges || 0);
    const grandTotal = subtotal; // Assuming other calculations might be added here
    return {
      subtotal,
      grandTotal,
    };
  };

  const totals = calculateTotal();

return (
  <StyledCard>
    <Title level={4}>Billing Summary</Title>
    <StyledList>
      <ListItem>
        <Label>Total Room Charges:</Label>
        <Value>₹ {total_room_charges.toFixed(2)}</Value>
      </ListItem>
      <ListItem>
        <Label>GST Amount:</Label>
        <Value>₹ {gstAmount.toFixed(2)}</Value>
      </ListItem>
      <ListItem>
        <Label>Total Add-on Charges:</Label>
        <Value>₹ {total_addon_charges.toFixed(2)}</Value>
      </ListItem>
      <ListItem>
        <Label>Discount:</Label>
        <Value>₹ {discount.toFixed(2)}</Value>
      </ListItem>
      <ListItem>
        <Label>Gross Amount:</Label>
        <Value>₹ {grossAmount.toFixed(2)}</Value>
      </ListItem>
      <Divider />
      <ListItem>
        <Label>Amount Paid:</Label>
        <Value strong color="#52c41a">₹ {paid_amount.toFixed(2)}</Value>
      </ListItem>
      <ListItem>
        <Label>Amount Pending:</Label>
        <Value strong color="#f5222d">₹ {pending_amount.toFixed(2)}</Value>
      </ListItem>
    </StyledList>
  </StyledCard>
);
}

const StyledCard = styled(Card)`
  width: 350px;
  border: none;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  background-color: #f8f8f8;
`;

const StyledList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
`;

const Label = styled(Text)`
  font-weight: ${(props) => (props.strong ? "bold" : "normal")};
  color: #333;
  font-size: 14px;
`;

const Value = styled(Text)`
  font-weight: ${(props) => (props.strong ? "bold" : "normal")};
  color: ${(props) => props.color || "#333"};
  font-size: 16px;
`;

export default BillingSummary;
