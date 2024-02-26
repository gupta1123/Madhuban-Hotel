import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Input, Button, Form, notification, InputNumber, Select, Tag, Badge, Divider, Switch, Radio } from 'antd';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import moment from "moment";
import { motion } from 'framer-motion';
import CountrySelect from '../components/CountrySelect'; // Adjust the import path as necessary

function BookingDetails({ location, authToken }) {
  const { state } = location;
  const { selectedRooms, checkInDate, checkOutDate, checkInTime, checkOutTime } = state;
  const history = useHistory();
  const {  adults, children } = location.state || {};
 
  const RoomContainer = styled.div`
  width: 100%;
  margin-bottom: 20px;
  border-radius: 10px;
  background-color: #e6f7ff; /* Pastel blue background color */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Slight shadow */
  padding: 20px;
  position: relative;
`;

const RoomTitle = styled.h3`
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;


  const RoomDetail = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
`;

  const RoomNumber = styled.span`
  color: #fff;
  background-color: #1890ff;
  padding: 5px 10px;
  border-radius: 5px;
`;

  const GuestContainer = styled.div`
width: 100%;
margin-bottom: 20px;
border-radius: 10px;
background-color: #fff; /* White background color */
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Slight shadow */
padding: 20px;
position: relative;
`;

  const GuestTitle = styled.h3`
margin-bottom: 10px;
display: flex;
justify-content: space-between;
align-items: center;
`;

  const GuestDetail = styled.div`
display: grid;
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
gap: 10px;
`;

  const GuestNumber = styled.span`
color: #fff;
background-color: #1890ff;
padding: 5px 10px;
border-radius: 5px;
`;

  const RoomPriceToggleContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 20px;
`;


  const [guestDetails, setGuestDetails] = useState({
    phoneNumber: '',
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    idType: '', // Added
    idNumber: '', // Added
    gstNumber: '',
  });

  const [discount, setDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdultChange = (value, index) => {
    const updatedRooms = [...rooms];
    updatedRooms[index].adults = value;
    updatedRooms[index].addons.mattress = value === 3 ? 1 : 0; // Automatically adjust mattress addon
    setRooms(updatedRooms);
  };
  

  const handleChildrenChange = (value, index) => {
    const updatedRooms = [...rooms];
    updatedRooms[index].children = value;
    setRooms(updatedRooms);
  };
  const handleAddonChange = (value, index, addonType) => {
    const updatedRooms = [...rooms];
    updatedRooms[index].addons[addonType] = value;
    setRooms(updatedRooms);
  };
  const handleRoomPriceChange = (value, index) => {
    const updatedRooms = [...rooms];
    updatedRooms[index].roomPrice = value;
    setRooms(updatedRooms);
  };

  const constructBookingData = () => {
    return rooms.map(room => ({
      customer: {
        title: guestDetails.title,
        firstName: guestDetails.firstName,
        lastName: guestDetails.lastName,
        email: guestDetails.email,
        address: guestDetails.address,
        city: guestDetails.city,
        state: guestDetails.state,
        country: guestDetails.country,
        phoneNumber: guestDetails.phoneNumber,
        pincode: guestDetails.pincode,
        gstNumber: guestDetails.gstNumber,

        // Assuming you have a way to input or retrieve these additional customer details
        customerDocs: {
          [guestDetails.idType]: guestDetails.idNumber
        },
        age: 35 // This needs to be obtained or set as per your application logic
      },
      booking: {
        roomNumber: room.room,
        custId: 2, // This should be dynamically set based on your application's logic
        totalGuestCount: room.adults + room.children,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        checkInTime: checkInTime,
        checkOutTime: checkOutTime,
        gstNumber: guestDetails.gstNumber, // Assuming this value is correctly set from the form
        discount: discount,
        toggleRoomType: room.roomPrice,
      }
    }));
  };


  const handleConfirmBooking = async () => {
    const bookingData = constructBookingData();
    const isGroup = rooms.length > 1;

    const apiUrl = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/addGroupNested?isGroup=${isGroup}`;

    try {
      const response = await axios.put(apiUrl, bookingData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const bookingId = await response.data;
      console.log("Received bookingId:", bookingId); // Debug log

      if (!isGroup) {

        history.push({
          pathname: "/bookingConfirmation",
          state: {
            customerId: bookingId,
            authToken: authToken,
          },
        });
      } else {
        const groupId = bookingId.split(":")[0];
        console.log(groupId)
        history.push({
          pathname: "/GroupBookingConfirmation",
          state: {
            groupId: groupId,
            authToken: authToken, // Assuming authToken is accessible in this scope
          },
        });
      }
    } catch (error) {
      console.error("Error during booking confirmation:", error);
    }
  };

  const roomTypeTagColor = {
    Deluxe: 'magenta',
    Standard: 'green',
    Suite: 'blue',
  };

  const triggerGetByPhoneAPI = () => {

    if (guestDetails.phoneNumber.length > 0) {
      setIsLoading(true);
      axios.get(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/customers/getByPhone?phone=${guestDetails.phoneNumber}`,

        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        }
      )
        .then(response => {
          const customerDocs = response.data.customerDocs;
          let idType = '';
          let idNumber = '';

          if (customerDocs) {
            // Assuming you want to extract the first available ID document
            const [firstDocType, firstDocNumber] = Object.entries(customerDocs)[0];
            idType = firstDocType; // e.g., "PAN Card"
            idNumber = firstDocNumber; // e.g., "1234abcd456"
          }

          setGuestDetails({
            ...guestDetails,
            ...response.data,
            idType, // Set extracted ID Type
            idNumber, // Set extracted ID Nu
          });
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Error fetching guest details:", error);
          notification.error({
            message: 'Guest Not Found',
            description: 'No guest found with the provided phone number.',
          });
          // Reset guest details except phone number
          setGuestDetails({
            phoneNumber: guestDetails.phoneNumber,
            title: '',
            firstName: '',
            lastName: '',
            email: '',
            address: '',
            city: '',
            state: '',
            country: '',
            pincode: '',
            idType, // Set extracted ID Type
            idNumber, // Set extracted ID Number
          });
          setIsLoading(false);
        });
    }


  }

  //   useEffect(() => {

  // }, [guestDetails.phoneNumber]);

  const handlePhoneNumberChange = (e) => {
    setGuestDetails({ ...guestDetails, phoneNumber: e.target.value });
  };

  const handleDiscountChange = (value) => {
    setDiscount(value);
  };

  // Form layout configuration
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };

  const initialRoomStates = selectedRooms.map(room => ({
    ...room,
    adults: adults || room.adults || 1, // Fallback to passed adults count, then room's default, then 1
    children: children || room.children || 0, // Similarly, fallback to passed children count
    addons: {
      mattress: adults === 3 ? 1 : 0, // Conditionally add a mattress based on the initial adults count
      breakfast: 0,
    },
  }));
  
  const [rooms, setRooms] = useState(initialRoomStates);
  



  return (
    <div style={{ padding: '20px' }}>
      <h2>Booking Details</h2>
      <Card title="Guest Details">
        {/* Adjust Form layout for labels to be on top */}
        <Form layout="vertical">
          <Col span={4}>
          <Form.Item label="Phone Number">
          
            <Input
              value={guestDetails.phoneNumber}
              onChange={handlePhoneNumberChange}
              onPressEnter={triggerGetByPhoneAPI}
              onBlur={triggerGetByPhoneAPI}
              placeholder="Enter phone number"
              allowClear
            />
            
          </Form.Item>
</Col>
          {guestDetails.phoneNumber && !isLoading && (
            <>
              <Row gutter={16}>
                <Col span={4}>
                  <Form.Item label="Title">
                    <Select
                      value={guestDetails.title}
                      onChange={(value) => setGuestDetails({ ...guestDetails, title: value })}
                      placeholder="Select a title"
                    >
                      <Select.Option value="Mr.">Mr.</Select.Option>
                      <Select.Option value="Miss">Miss</Select.Option>
                      <Select.Option value="Mrs.">Mrs.</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="First Name">
                    <Input
                      value={guestDetails.firstName}
                      onChange={(e) => setGuestDetails({ ...guestDetails, firstName: e.target.value })}
                      placeholder="First Name"
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Last Name">
                    <Input
                      value={guestDetails.lastName}
                      onChange={(e) => setGuestDetails({ ...guestDetails, lastName: e.target.value })}
                      placeholder="Last Name"
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Email">
                    <Input
                      value={guestDetails.email}
                      onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                      placeholder="Email"
                      allowClear
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item label="Address">
                    <Input
                      value={guestDetails.address}
                      onChange={(e) => setGuestDetails({ ...guestDetails, address: e.target.value })}
                      placeholder="Address"
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="City">
                    <Input
                      value={guestDetails.city}
                      onChange={(e) => setGuestDetails({ ...guestDetails, city: e.target.value })}
                      placeholder="City"
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="State">
                    <Input
                      value={guestDetails.state}
                      onChange={(e) => setGuestDetails({ ...guestDetails, state: e.target.value })}
                      placeholder="State"
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Country">
                    <CountrySelect
                      value={guestDetails.country}
                      onChange={(selectedOption) => {
                        setGuestDetails({
                          ...guestDetails,
                          country: selectedOption ? selectedOption.label : ''
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={4}>
                  <Form.Item label="GST Number">
                    <Input
                      value={guestDetails.gstNumber}
                      onChange={(e) => setGuestDetails({ ...guestDetails, gstNumber: e.target.value })}
                      placeholder="GST Number"
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Pincode">
                    <Input
                      value={guestDetails.pincode}
                      onChange={(e) => setGuestDetails({ ...guestDetails, pincode: e.target.value })}
                      placeholder="Pincode"
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item label="ID Type">
                    <Select
                      value={guestDetails.idType}
                      onChange={(value) => setGuestDetails({ ...guestDetails, idType: value })}
                      placeholder="Select an ID Type"
                      allowClear
                    >
                      <Select.Option value="Aadhar Card">Aadhar Card</Select.Option>
                      <Select.Option value="PAN Card">PAN Card</Select.Option>
                      <Select.Option value="Passport">Passport</Select.Option>
                      <Select.Option value="Driving License">Driving License</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="ID Number">
                    <Input
                      value={guestDetails.idNumber}
                      onChange={(e) => setGuestDetails({ ...guestDetails, idNumber: e.target.value })}
                      placeholder="Enter ID Number"
                      allowClear
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
        </Form>
      </Card>
      <br />
     
      {rooms.map((room, index) => (
        <RoomContainer key={index}>
          <RoomTitle>
            <div>
              {`Room No. `}
              <RoomNumber><Tag color="blue">{room.roomType}</Tag> {`#${room.room}`}  </RoomNumber>
              

            </div>

          </RoomTitle>

          <br />
          <RoomDetail>
            <div><strong>Check-in Date:</strong> {moment(checkInDate).format('DD MMM YYYY')}</div>
            <div><strong>Check-out Date:</strong> {moment(checkOutDate).format('DD MMM YYYY')}</div>
            <div><strong>Check-in Time:</strong> {moment(checkInTime, 'HH:mm').format('hh:mm A')}</div>
            <div><strong>Check-out Time:</strong> {moment(checkInTime, 'HH:mm').format('hh:mm A')} </div>
            <div><strong>Adults:</strong> <InputNumber min={1} max={4} value={room.adults} onChange={value => handleAdultChange(value, index)} /></div>
            <div><strong>Children:</strong> <InputNumber min={0} max={3} value={room.children} onChange={value => handleChildrenChange(value, index)} /></div>
            <div><strong>Mattress:</strong> <InputNumber min={0} max={3} value={room.addons.mattress} onChange={value => handleAddonChange(value, index, 'mattress')} disabled={room.adults === 3} /></div>
            <div><strong>Breakfast:</strong> <InputNumber min={0} max={room.adults + room.children} value={room.addons.breakfast} onChange={value => handleAddonChange(value, index, 'breakfast')} /></div>
            <RoomPriceToggleContainer>

              <div><strong>Room Price Toggle</strong>
                <Radio.Group value={room.roomPrice} onChange={(e) => handleRoomPriceChange(e.target.value, index)}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ display: 'inline-block' }}
                  >
                    <Radio.Button value="AC">AC</Radio.Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ display: 'inline-block' }}
                  >
                    <Radio.Button value="Non AC">Non AC</Radio.Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ display: 'inline-block' }}
                  >
                    <Radio.Button value="Deluxe">Deluxe</Radio.Button>
                  </motion.div>
                </Radio.Group>

              </div>
            </RoomPriceToggleContainer>

          </RoomDetail>
        </RoomContainer>
      ))}
      <Button type="primary" style={{ marginTop: 20 }} onClick={handleConfirmBooking}>Confirm Booking</Button>    </div>
  );
}

export default BookingDetails;