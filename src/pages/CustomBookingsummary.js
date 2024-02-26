import React, { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Space, Tag, Divider } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  TagsOutlined,
  DollarOutlined,
  WalletTwoTone,
  CarOutlined,
} from "@ant-design/icons";

const getStatusColor = (status) => {
  switch (status) {
    case "Due in":
      return "#FFD700"; // Gold - Color for future bookings
    case "Occupied":
      return "#FF6347"; // Tomato - Color for currently checked-in bookings
    case "Due Out":
      return "#00CED1"; // Dark Turquoise - Color for past checkout time but not checked out
    case "Reserved":
      return "#4169E1"; // Royal Blue - Color for reserved but not checked in
    case "Checked out":
      return "#32CD32"; // Lime Green - Color for completed check-out
    case "Cancelled":
      return "#DC143C"; // Crimson - Color for cancelled bookings
    default:
      return "#808080"; // Gray - Default color for unknown statuses
  }
};

const CustomBookingsummary = ({ isLoading, bookingDetails, authToken }) => {
  const formatTime = (time) => {
    if (!time) {
      return "Time not available";
    }
    const [hours, minutes] = time.split(":");
    const formattedHours = parseInt(hours, 10) % 12 || 12;
    const ampm = parseInt(hours, 10) < 12 ? "AM" : "PM";
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  // Determine the booking status based on check-in and checkout status
  let bookingStatus; // Initialize without a default status

  if (bookingDetails.checkinStatus && !bookingDetails.checkoutStatus) {
    const currentDate = new Date();
    const checkinDate = new Date(bookingDetails.checkIn);
    const checkoutDate = new Date(bookingDetails.checkOut);

    if (currentDate < checkinDate) {
      bookingStatus = "Due in"; // Future booking
    } else if (currentDate >= checkinDate && currentDate < checkoutDate) {
      bookingStatus = "Occupied"; // Currently checked in and not yet checked out
    } else if (currentDate >= checkoutDate) {
      bookingStatus = "Due Out"; // The check-out process hasn't been completed, but it's past the checkout time
    }
  } else if (!bookingDetails.checkinStatus && !bookingDetails.checkoutStatus) {
    bookingStatus = "Reserved"; // Reserved but not yet checked in
  } else if (bookingDetails.checkinStatus && bookingDetails.checkoutStatus) {
    bookingStatus = "Checked out"; // Both check-in and check-out processes have been completed
  } else {
    bookingStatus = "Unknown"; // Fallback for any unhandled cases
  }

  return (
    <Card
      title="Booking Details"
      bordered={false}
      style={{
        width: "100%",
        backgroundColor: "#f0f2f5",
        borderRadius: "10px",
      }}
      extra={<Tag color={getStatusColor(bookingStatus)}>{bookingStatus}</Tag>} // Display status as a tag in the top right corner
    >
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Space align="center">
                <UserOutlined style={{ fontSize: "24px", color: "#108ee9" }} />
                <Typography.Title level={5} style={{ color: "#108ee9" }}>
                  {bookingDetails.customerName}
                </Typography.Title>
              </Space>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Space align="center">
                <CalendarOutlined style={{ fontSize: "24px", color: "#faad14" }} />
                <Typography.Text strong>Check-in Date:</Typography.Text>
                <Typography.Text strong type="success">
                  {bookingDetails.checkIn}
                </Typography.Text>
              </Space>
            </Col>
            <Col span={12}>
              <Space align="center">
                <CalendarOutlined style={{ fontSize: "24px", color: "#faad14" }} />
                <Typography.Text strong>Check-out Date:</Typography.Text>
                <Typography.Text strong type="success">
                  {bookingDetails.checkOut}
                </Typography.Text>
              </Space>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Space align="center">
                <ClockCircleOutlined style={{ fontSize: "24px", color: "#52c41a" }} />
                <Typography.Text strong>Check-in Time:</Typography.Text>
                <Typography.Text strong type="success">
                  {formatTime(bookingDetails.checkInTime)}
                </Typography.Text>
              </Space>
            </Col>
            <Col span={12}>
              <Space align="center">
                <ClockCircleOutlined style={{ fontSize: "24px", color: "#52c41a" }} />
                <Typography.Text strong>Check-out Time:</Typography.Text>
                <Typography.Text strong type="success">
                  {formatTime(bookingDetails.checkOutTime)}
                </Typography.Text>
              </Space>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Space align="center">
                <TagsOutlined style={{ fontSize: "24px", color: "#2db7f5" }} />
                <Typography.Text strong>Room Type:</Typography.Text>
                <Typography.Text strong type="success">
                  {bookingDetails.roomType}
                </Typography.Text>
              </Space>
            </Col>
            <Col span={12}>
              <Space align="center">
                <CarOutlined style={{ fontSize: "24px", color: "#eb2f96" }} />
                <Typography.Text strong>Room Number:</Typography.Text>
                <Typography.Text strong type="success">
                  #{bookingDetails.roomNumber}
                </Typography.Text>
              </Space>
            </Col>
          </Row>
          <Divider style={{ backgroundColor: "#108ee9" }} />
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Space align="center">
                <DollarOutlined style={{ fontSize: "24px", color: "#fa541c" }} />
                <Typography.Text strong>Total Amount:</Typography.Text>
                <Typography.Text strong type="success">
                  {(bookingDetails.grossTotal || 0).toFixed(2)}
                </Typography.Text>
              </Space>
            </Col>
            <Col span={12}>
              <Space align="center">
                <WalletTwoTone twoToneColor="#fa8c16" style={{ fontSize: "24px" }} />
                <Typography.Text strong>Pending Amount:</Typography.Text>
                <Typography.Text strong type="success">
                  {(bookingDetails.pendingAmt || 0).toFixed(2)}
                </Typography.Text>
              </Space>
            </Col>
          </Row>
          <Divider style={{ backgroundColor: "#108ee9" }} />
          
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Space align="center">
                <TagsOutlined style={{ fontSize: "24px", color: "#2db7f5" }} />
                <Typography.Text strong>Add-Ons:</Typography.Text>
                <div>
                  {Object.keys(bookingDetails.addOnMap || {}).map((addon) => (
                    <Tag key={addon} color="#108ee9">
                      {addon} (+{bookingDetails.addOnMap[addon].toFixed(2)})
                    </Tag>
                  ))}
                </div>
              </Space>
            </Col>
          </Row>

          {/* Display booking status */}
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Space align="center">
                <TagsOutlined style={{ fontSize: "24px", color: "#2db7f5" }} />
                <Typography.Text strong>Booking Status:</Typography.Text>
                <Typography.Text strong type="success">
                  {bookingStatus}
                </Typography.Text>
              </Space>
            </Col>
          </Row>
        </div>
      )}
    </Card>
  );
};

export default CustomBookingsummary;
