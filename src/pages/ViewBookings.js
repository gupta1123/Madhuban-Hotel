import React, { useState, useEffect } from "react";
import { Table, Button, Card, Select, Input, DatePicker, Row, Col, Tag, Tooltip, Divider, Switch, Form, Dropdown, Drawer, message, Menu, Grid, Modal, Popover, Checkbox } from 'antd';
import { EditOutlined, CheckCircleOutlined, CloseCircleOutlined, PlusCircleOutlined, DownOutlined } from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import moment from "moment";
import './ViewBookings.css'; // Assume you create a CSS file for additional styles
import SettlementsPage from './Settlement'; // Adjust the path as per your file structure
import axios from 'axios';


const { RangePicker } = DatePicker;
const { Option } = Select;
const { useBreakpoint } = Grid;

const ViewBookings = ({ history, authToken }) => {
  const [responsedata, setResponsedata] = useState("");
  console.log(authToken)
  const [bookings, setBookings] = useState([]);
  const [filterRoomNumber, setFilterRoomNumber] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [roomNumbers, setRoomNumbers] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [showAllRooms, setShowAllRooms] = useState(false);
  const [tableView, setTableView] = useState(false);
  const [isAddTaskDrawerVisible, setIsAddTaskDrawerVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [form] = Form.useForm();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [filterPhoneNumber, setFilterPhoneNumber] = useState("");
  const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState(false);
  const [selectedCheckoutBooking, setSelectedCheckoutBooking] = useState(null);
  const [isSettlementModalVisible, setIsSettlementModalVisible] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [groupCheckInModalVisible, setGroupCheckInModalVisible] = useState(false);
  const [selectedGroupBooking, setSelectedGroupBooking] = useState(null);
  const [selectedGroupBookings, setSelectedGroupBookings] = useState([]);
  const [selectedBookingsForCheckin, setSelectedBookingsForCheckin] = useState([]);
  const [isCheckInModalVisible, setIsCheckInModalVisible] = useState(false);
  const [currentGroupBooking, setCurrentGroupBooking] = useState(null);
  const [selectedRoomsForCheckIn, setSelectedRoomsForCheckIn] = useState([]);


  const handleCheckAllRoomsChange = (e) => {
    if (e.target.checked) {
      // Select all room IDs for the current group booking
      const allRoomIds = currentGroupBooking.roomNumbers.map(room => room.bookingId);
      setSelectedRoomsForCheckIn(allRoomIds);
    } else {
      // Clear the selection if the "Check all" box is unchecked
      setSelectedRoomsForCheckIn([]);
    }
  };


  const handleRoomCheckChange = (roomId) => {
    setSelectedRoomsForCheckIn(prevSelectedRooms => {
      if (prevSelectedRooms.includes(roomId)) {
        // If the room is already selected, remove it from the selection
        return prevSelectedRooms.filter(id => id !== roomId);
      } else {
        // If the room is not selected, add it to the selection
        return [...prevSelectedRooms, roomId];
      }
    });
  };




  const handleCheckInClick = (booking) => {
    // Determine if it's a group booking
    const isGroupBooking = booking.groupId && Array.isArray(booking.roomNumbers) && booking.roomNumbers.length > 1;

    if (isGroupBooking) {
      // Group booking: Setup for modal
      setCurrentGroupBooking(booking);
      setSelectedRoomsForCheckIn(booking.roomNumbers.map(room => room.bookingId)); // Pre-select all rooms
      setIsCheckInModalVisible(true); // Display the modal
    } else {
      // Single booking: Direct check-in
      // Extract the booking ID. Adjust based on your data structure, especially for single room bookings.
      const bookingId = booking.bookingId || (booking.roomNumbers && booking.roomNumbers[0].bookingId);
      performIndividualCheckIn(bookingId); // Use the existing function for direct check-in
    }
  };


  const showCheckoutConfirmationModal = () => (
    <Modal
      title="Confirm Checkout"
      visible={isCheckoutModalVisible}
      onOk={handleConfirmCheckout}
      onCancel={() => setIsCheckoutModalVisible(false)}
      okText="Confirm Checkout"
      cancelText="Cancel"
    >
      <p>The pending amount for this booking is <strong>₹{selectedCheckoutBooking?.pendingAmt || 'N/A'}</strong>.</p>
      <p>Do you still want to proceed with the checkout?</p>
    </Modal>

  );

  useEffect(() => {
    console.log("Props in ViewBookings:", bookings);
  }, [bookings]);


  // const navigateToBookingConfirmation = (bookingId) => {
  //   console.log(bookingId);
  //   const customer = bookingId;

  //   history.push({
  //     pathname: "/bookingConfirmation",
  //     state: {
  //       customerId: customer,
  //     },
  //   });
  // };

  const navigateToBookingConfirmation = (booking) => {
    console.log(booking.bookingId);
    const isGroupBooking = booking.groupId && Array.isArray(booking.roomNumbers) && booking.roomNumbers.length > 1;

    if (isGroupBooking) {
      console.log(booking.groupId)
      history.push('/GroupBookingConfirmation', { groupId: booking.groupId, customerId: booking.bookingId })
    } else {
      history.push({
        pathname: "/bookingConfirmation",
        state: {
          customerId: booking.bookingId,
        },
      });
    }
  };



  const onAddTask = async () => {
    try {
      const values = await form.validateFields();
      console.log("Received values of form: ", values);

      const formattedDate = moment(values.date).format("YYYY-MM-DD");
      const taskData = {
        ...values,
        date: formattedDate, // Assuming you want to include the formatted date in your request
        status: "Assigned",
      };

      const response = await fetch("http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/task/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(taskData),
      });
      if (response) {
        const dataresponse = await response.text()
        console.log(dataresponse)
        if (dataresponse == 'Task already exist!') {
          message.error("Task already exist!");
        } else {
          message.success("Task Created Successfully!");
        }
      }
    } catch (errorInfo) {
      console.error(errorInfo);
      message.error("Failed to create task");
    }
    form.resetFields();
    setIsAddTaskDrawerVisible(false);
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(
          "http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getAll",
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const processedData = processData(data); // Assuming 'data' is your API response
        setBookings(processedData);
        const uniqueRoomNumbers = [
          ...new Set(data.map((booking) => booking.roomNumber)),
        ];
        console.log(bookings)
        setRoomNumbers(uniqueRoomNumbers);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, []);

  const handleEditClick = (booking) => {
    const customer = booking;

    history.push({
      pathname: "/bookingConfirmation",
      state: {
        customerId: customer,
      },
    });
  };

  const handleAllRoomClick = () => {
    setFilterRoomNumber("");
    setShowAllRooms(true);
  };

  const handleClearFilterClick = () => {
    setFilterRoomNumber("");
    setFilterStatus("");
    setFilterName("");
    setCheckInDate(null);
    setCheckOutDate(null);
    setShowAllRooms(false);
  };


  const handleAddTask = (booking) => {
    // Open the task drawer with room selection if it's a group booking
    if (booking.groupId && Array.isArray(booking.roomNumbers) && booking.roomNumbers.length > 1) {
      setIsAddTaskDrawerVisible(true);
      setSelectedBooking(booking);
    } else {
      // If it's a single booking, directly open the task drawer with the room number
      openTaskDrawer(booking, booking.roomNumber || '');
    }
  };

  const handleRoomSelect = (selectedRoom) => {
    // Set the selected room in the form
    form.setFieldsValue({
      roomNumber: selectedRoom,
      date: moment().format("YYYY-MM-DD"),
    });
  };

  const openTaskDrawer = (booking, roomNumber) => {
    if (booking.groupId && Array.isArray(booking.roomNumbers) && booking.roomNumbers.length > 1) {
      // If it's a group booking with multiple rooms, prepare options for selection
      const roomOptions = booking.roomNumbers.map(room => ({
        label: `Room ${room.roomNumber}`, // Assuming 'roomNumber' is the property
        value: room.roomNumber,
      }));
      form.setFieldsValue({
        roomNumber: roomOptions[0].value, // Set default value or keep it empty to force selection
        roomOptions, // You might need to handle this differently based on your form setup
        date: moment(), // Default date
        priority: "Low", // Default priority
      });
    } else {
      // Handle individual booking
      form.setFieldsValue({
        roomNumber: roomNumber || booking.roomNumber,
        date: moment(), // Set default date to today's date
        priority: "Low", // Set default priority to "Low"
      });
    }
    setSelectedBooking(booking);
    setIsAddTaskDrawerVisible(true);
  };



  const closeAddTaskDrawer = () => {
    form.resetFields();
    setIsAddTaskDrawerVisible(false);
    setIsAddingTask(false);
  };

  const handleShowAllBookings = () => {
    // Reset all filter states to their default values
    setFilterRoomNumber("");
    setFilterStatus("");
    setFilterName("");
    setCheckInDate(null);
    setCheckOutDate(null);
    setShowAllRooms(false);
    setFilterPhoneNumber("");
    // Optionally, you can set tableView to a default state if needed
    // setTableView(false); // Uncomment if you want to reset view mode to default

    // Trigger any additional actions needed to refresh the bookings list, if necessary
  };


  const calculateStatus = (bookingDetails) => {
    if (bookingDetails.cancelStatus) return "Cancelled"; // Check if booking is cancelled
    if (!bookingDetails.checkIn) return "Unknown"; // Handle null checkIn date
    const currentDate = new Date();
    const checkinDate = new Date(bookingDetails.checkIn);
    const checkoutDate = new Date(bookingDetails.checkOut);
    let bookingStatus = "Unknown";

    if (bookingDetails.checkinStatus && !bookingDetails.checkoutStatus) {
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
    }

    return bookingStatus;
  };



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




  const menu = (record) => (
    <Menu>
      <Menu.Item key="1" icon={<EditOutlined />} onClick={() => navigateToBookingConfirmation(record)}>
        Edit
      </Menu.Item>
      <Menu.Item key="2" icon={<CheckCircleOutlined />} onClick={() => handleCheckInClick(record)} disabled={record.checkinStatus || record.cancelStatus}>
        Check In
      </Menu.Item>
      <Menu.Item key="3" icon={<CloseCircleOutlined />} onClick={() => handleCheckOut(record)} disabled={!record.checkinStatus || record.checkoutStatus}>
        Check Out
      </Menu.Item>
      <Menu.Item key="4" icon={<PlusCircleOutlined />} onClick={() => handleAddTask(record)}>
        Add Task
      </Menu.Item>
    </Menu>
  );



  const columns = [
    {
      title: 'Booking ID',
      dataIndex: 'bookingId',
      key: 'bookingId',
      render: (text, booking) => (
        <span>
          {booking.groupId ? (
            <Tag color="green">Group ID: {booking.groupId}</Tag>
          ) : (
            <Tag color="blue">#{text}</Tag>
          )}
        </span>
      ),
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Check In",
      dataIndex: "checkIn",
      key: "checkIn",
      render: (text, record) => `${moment(record.checkIn).format('DD MMM')} - ${moment(record.checkIn + 'T' + record.checkInTime).format('hh:mm A')}`,
    },
    {
      title: "Check Out",
      dataIndex: "checkOut",
      key: "checkOut",
      render: (text, record) => `${moment(record.checkOut).format('DD MMM')} - ${moment(record.checkOut + 'T' + record.checkOutTime).format('hh:mm A')}`,
    },


    {
      title: "Total Amount",
      dataIndex: "grossTotal",
      key: "grossTotal",
    },
    {
      title: "Amount Due",
      dataIndex: "pendingAmt",
      key: "pendingAmt",
      render: (text, record) => {
        return record.pendingAmt !== undefined && record.pendingAmt !== null ? `₹${record.pendingAmt}` : 'N/A';
      },

    },
    {
      title: 'Room Numbers',
      key: 'roomNumbers',
      render: (record) => {
        // Check if it's a group booking
        const isGroupBooking = record.groupId && Array.isArray(record.roomNumbers) && record.roomNumbers.length > 1;

        if (isGroupBooking) {
          // For group bookings, show up to 3 room numbers and the rest as "..."
          const displayedRooms = record.roomNumbers.slice(0, 3).map(room => (
            <Tag key={room.roomNumber}>Room {room.roomNumber}</Tag>
          ));

          if (record.roomNumbers.length > 3) {
            const popoverContent = (
              <div>
                {record.roomNumbers.map(room => (
                  <div key={room.roomNumber} style={{ margin: '5px 0' }}>
                    Room {room.roomNumber}
                  </div>
                ))}
              </div>
            );

            return (
              <div>
                {displayedRooms}
                <Popover content={popoverContent} title="All Room Numbers" trigger={["hover", "click"]}>
                  <a>... {record.roomNumbers.length - 3} more</a>
                </Popover>
              </div>
            );
          } else {
            // If there are 3 or fewer rooms, just display them without a popover
            return displayedRooms;
          }
        } else {
          // For individual bookings, directly show the room number
          return <Tag color="geekblue">Room {record.roomNumber}</Tag>;
        }
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (_, record) => {
        // Check if it's a group booking
        const isGroupBooking = record.groupId && Array.isArray(record.roomNumbers) && record.roomNumbers.length > 1;
        if (isGroupBooking) {
          // For group bookings, show "Group Details" with a popover
          const popoverContent = (
            <div>
              {record.roomNumbers.map((room, index) => {
                const roomStatus = calculateStatus(room); // Calculate status for each room
                return (
                  <div key={index} style={{ marginBottom: '8px' }}> {/* Add line spacing here */}
                    Room {room.roomNumber}: <Tag color={getStatusColor(roomStatus)}>{roomStatus}</Tag>
                  </div>
                );
              })}
            </div>
          );
          return (
            <Popover
              content={popoverContent}
              title="Room Details"
              trigger={["hover", "click"]} // Open on hover and click
            >
              <Button type="link">Group Details</Button>
            </Popover>
          );
        } else {
          // For individual bookings, directly show the status
          return <Tag color={getStatusColor(calculateStatus(record))}>{calculateStatus(record)}</Tag>;
        }
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (_, record) => (
        <Dropdown overlay={menu(record)} trigger={['click']}>
          <Button type="link" icon={<DownOutlined />}>
            Actions
          </Button>
        </Dropdown>
      ),
  

    },
  ];

  const processData = (data) => {
    const groupBookings = {};
    const individualBookings = [];

    data.forEach((booking) => {
      if (booking.groupId) {
        if (!groupBookings[booking.groupId]) {
          groupBookings[booking.groupId] = {
            ...booking,
            roomNumbers: [{ roomNumber: booking.roomNumber, bookingId: booking.bookingId, checkIn: booking.checkIn, checkOut: booking.checkOut, checkInTime: booking.checkInTime, checkOutTime: booking.checkOutTime, checkinStatus: booking.checkinStatus, checkoutStatus: booking.checkoutStatus }],
          };
        } else {
          groupBookings[booking.groupId].roomNumbers.push({ roomNumber: booking.roomNumber, bookingId: booking.bookingId, checkIn: booking.checkIn, checkOut: booking.checkOut, checkInTime: booking.checkInTime, checkOutTime: booking.checkOutTime, checkinStatus: booking.checkinStatus, checkoutStatus: booking.checkoutStatus });
        }
      } else {
        individualBookings.push(booking);
      }
    });

    return [...individualBookings, ...Object.values(groupBookings)];
  };

  const handleConfirmCheckin = async () => {
    console.log(selectedGroupBooking)
    console.log(selectedGroupBookings)

    const payload = {
      bookingList: selectedBookingsForCheckin,
    };

    try {
      const response = await axios.put(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/checkInForGroup?groupId=${selectedGroupBooking}`, payload);
      console.log(response)
      if (response.status === 200) {
        // Handle successful check-in
        message.success('Check-in successful');
        setCheckinModalVisible(false);
        // Reset selected bookings for check-in
        setSelectedBookingsForCheckin([]);
        // Optionally refresh or update your booking data here
      } else {
        // Handle non-successful response
        message.error('Check-in failed');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      message.error('An error occurred during check-in');
    }
  };


  const renderBookingCard = (booking) => {
    // Check if booking is part of a group
    const isGroupBooking = booking.groupId && Array.isArray(booking.roomNumbers) && booking.roomNumbers.length > 1;
    const bookingStatus = calculateStatus(booking); // You'll need to implement calculateStatus based on your logic
    const hasReservedBooking = isGroupBooking && booking.roomNumbers.some(room => {
      const roomStatus = calculateStatus(room); // Assuming room has the necessary fields to calculate status
      return roomStatus === "Reserved";
    });

    // For individual bookings, simply check if the booking is reserved
    const isIndividualReserved = !isGroupBooking && calculateStatus(booking) === "Reserved";

    // Combine conditions for group and individual bookings to decide on enabling the check-in button
    const enableCheckInButton = isGroupBooking ? hasReservedBooking : isIndividualReserved;

    const roomNumbersPopoverContent = (
      <div>
        {isGroupBooking && booking.roomNumbers.map((roomNumber, index) => (
          <p key={index}>{roomNumber}</p>
        ))}
      </div>
    );

    const renderPopoverContent = (booking) => (
      <div style={{ lineHeight: '1.5' }}>
        {booking.roomNumbers.map((roomDetail, index) => {
          const status = calculateStatus({
            checkIn: roomDetail.checkIn,
            checkOut: roomDetail.checkOut,
            checkinStatus: roomDetail.checkinStatus,
            checkoutStatus: roomDetail.checkoutStatus,
            cancelStatus: booking.cancelStatus, // Assuming cancel status is shared across group bookings
          });
          return (
            <div key={index} style={{ marginBottom: '10px' }}>
              <p style={{ margin: '0' }}>
                <Tag color="blue">#{roomDetail.bookingId}</Tag>  <Tag color="blue">Room {roomDetail.roomNumber}</Tag> <Tag color={getStatusColor(status)}>{status}</Tag>
              </p>
            </div>
          );
        })}
      </div>
    );

    // Ensure you incorporate this function where the popover is used
    const roomNumbersPopover = isGroupBooking ? (
      <Popover content={renderPopoverContent(booking)} title="Room Bookings">
        <Tag color="geekblue">Group Details</Tag>
      </Popover>
    ) : (
      <Tag color="geekblue">Room {booking.roomNumber}</Tag>
    );


    return (
      <Col xs={24} sm={12} md={8} lg={6} key={booking.bookingId}>
        <Card
          actions={[
            <Tooltip title="Check In">
              <Button
                icon={<CheckCircleOutlined />}
                onClick={() => handleCheckInClick(booking)}
                disabled={!enableCheckInButton} // Use the calculated condition
                type="text"
              />
            </Tooltip>,
            <Tooltip title="Check Out">
              <Button
                icon={<CloseCircleOutlined />}
                onClick={() => handleCheckOut(booking)}
                disabled={!booking.checkinStatus || booking.checkoutStatus}
                type="text"
              />
            </Tooltip>,

            <Tooltip title="Add Task">
              <Button
                icon={<PlusCircleOutlined />}
                onClick={() => handleAddTask(booking)}
                type="text"
              />
            </Tooltip>,

          ]}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            {isGroupBooking ? (
              <Tag color="green">Group ID: {booking.groupId}</Tag>
            ) : (
              <Tag color="blue">#{booking.bookingId}</Tag>
            )}
            {!isGroupBooking && ( // Conditional rendering based on whether it's a group booking
              <div>
                <Tag color={getStatusColor(bookingStatus)}>{bookingStatus}</Tag>

              </div>
            )}
            <Tooltip title="Edit Booking">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => navigateToBookingConfirmation(booking)}
                style={{ marginLeft: "10px" }}
              />
            </Tooltip>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ fontSize: "16px", fontWeight: "bold" }}>{booking.customerName}</div>
            {isGroupBooking ? roomNumbersPopover : <Tag color="geekblue">Room {booking.roomNumber}</Tag>}
          </div>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div><strong>Check-In:</strong> <br /> {moment(booking.checkIn + 'T' + booking.checkInTime).format('DD MMM - hh:mm A')}</div>
              <div><strong>Check-Out:</strong> <br /> {moment(booking.checkOut + 'T' + booking.checkOutTime).format('DD MMM - hh:mm A')}</div>
            </Col>
            <Col span={12}>
              <div><strong>Total Amount:</strong> <br /> ₹{booking.grossTotal}</div>
              <div><strong>Amount Due:</strong> <br /> ₹{booking.pendingAmt}</div>
            </Col>
          </Row>
        </Card>
      </Col>
    );
  };

  const handleCheckIn = async (booking) => {
    // No need to find the booking by ID since the booking object is directly passed
    if (!booking) {
      console.error("No booking provided.");
      return; // Exit the function if no booking is provided
    }

    console.log(booking);

    const isGroupBooking = booking.roomNumbers && booking.roomNumbers.length > 1;

    if (isGroupBooking) {
      setSelectedGroupBooking(booking.groupId); // Set the current group ID for modal
      setSelectedGroupBookings(booking.roomNumbers.map(r => r.roomNumber)); // Extracting room numbers for the modal
      console.log(selectedGroupBookings)
      setGroupCheckInModalVisible(true);
    } else {

      await performIndividualCheckIn(booking.bookingId);
    }
  };





  const performIndividualCheckIn = async (bookingId) => {
    try {
      const response = await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/checkIn?bookingId=${bookingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (errorText === 'Customer Already Checked In!') {
          message.error(errorText);
        } else if (errorText === 'Customer Already Checked In and Checked Out!') {
          message.error(errorText);
        } else {
          message.error('Error Checking In');
        }
      } else {
        message.success('Checked In Successfully!');
        // Update the booking's checkinStatus to true
        const updatedBookings = bookings.map((booking) =>
          booking.bookingId === bookingId
            ? { ...booking, checkinStatus: true }
            : booking
        );
        setBookings(updatedBookings);
      }
    } catch (error) {
      console.error('Error checking in:', error);
      message.error('Error Checking In');
    }
  };

  const handleGroupCheckInConfirm = async () => {
    try {
      const response = await fetch('http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/checkInForGroup', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          bookingList: selectedGroupBookings,
        }),
      });

      if (response.ok) {
        message.success('Group check-in successful');
      } else {
        message.error('Failed to perform group check-in');
      }
    } catch (error) {
      console.error('Error during group check-in:', error);
      message.error('An error occurred. Please try again.');
    } finally {
      setGroupCheckInModalVisible(false);
    }
  };

  const handleCheckOut = (booking) => {
    if (booking.groupId) {
      // Navigate to GroupSettlement for group bookings
      history.push({
        pathname: "/GroupSettlement",
        state: { groupId: booking.groupId },
      });
    } else {
      // For individual bookings, navigate to the existing settlement page
      history.push({
        pathname: "/settlement",
        state: {
          customerId: booking.bookingId,
        },
      });
    }
  };


  const handleGroupCheckIn = async () => {
    if (!selectedRoomsForCheckIn.length) {
      message.error("No rooms selected for check-in.");
      return;
    }

    const payload = {
      bookingList: selectedRoomsForCheckIn,
    };

    try {
      const response = await axios.put(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/checkInForGroup?groupId=${currentGroupBooking.groupId}`, payload, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        message.success('Group check-in successful');
        setIsCheckInModalVisible(false);
        // Perform any state updates or refreshes here
      } else {
        message.error('Group check-in failed');
      }
    } catch (error) {
      console.error('Group check-in error:', error);
      message.error('An error occurred during group check-in');
    }
  };



  const handleConfirmCheckout = async () => {
    // Ensure selectedCheckoutBooking is not null
    if (selectedCheckoutBooking) {
      try {
        const response = await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/checkOut?bookingId=${selectedCheckoutBooking.bookingId}`, {
          method: "PUT",
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          message.error(errorText);
        } else {
          message.success("Checked Out Successfully!");
          // Update the bookings state as necessary
        }
      } catch (error) {
        console.error("Error checking out:", error);
        message.error("Error Checking Out");
      }
    }

    // Reset the modal and selected booking state
    setIsCheckoutModalVisible(false);
    setSelectedCheckoutBooking(null);

    // Refresh bookings or perform additional actions as needed
  };



  return (
    <div>
      <Card className="filter-card" style={{ marginBottom: "20px", width: "100%" }}>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={12} lg={8} xl={6}>
            <div><b>Room Number</b></div>
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Select room number(s)"
              defaultValue={[]}
              onChange={(values) => setFilterRoomNumber(values)}
              options={roomNumbers.map(roomNumber => ({
                label: roomNumber,
                value: roomNumber,
              }))}
            />
          </Col>


          <Col xs={24} sm={12} md={6} lg={4}>
            <div><b>Phone Number</b></div>
            <Input
              placeholder="Enter Phone Number"
              value={filterPhoneNumber}
              onChange={(e) => setFilterPhoneNumber(e.target.value)}
              style={{ width: "100%" }}
            />
          </Col>

          <Col xs={24} sm={12} md={6} lg={4}>
            <div><b>Check In</b></div>
            <DatePicker
              placeholder="Select Date"
              style={{ width: "100%" }}
              value={checkInDate}
              onChange={(date) => setCheckInDate(date)}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <div><b>Check Out</b></div>
            <DatePicker
              placeholder="Select Date"
              style={{ width: "100%" }}
              value={checkOutDate}
              onChange={(date) => setCheckOutDate(date)}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <div><b>Status</b></div>
            <Select
              style={{ width: "100%" }}
              placeholder="Select Status"
              onChange={(value) => setFilterStatus(value)}
              value={filterStatus}
              allowClear
            >
              {/* Add an option for each status */}
              <Option value="">All</Option> {/* Option to clear the filter */}
              <Option value="Due in">Due in</Option>
              <Option value="Occupied">Occupied</Option>
              <Option value="Due Out">Due Out</Option>
              <Option value="Reserved">Reserved</Option>
              <Option value="Checked out">Checked out</Option>
            </Select>

          </Col>

          <Col xs={24} sm={12} md={6} lg={4}>
            <Button type="primary" onClick={handleShowAllBookings}>
              Reset
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Switch
              checkedChildren="Table"
              unCheckedChildren="Cards"
              checked={tableView}
              onChange={() => setTableView(!tableView)}
            />
          </Col>
        </Row>
      </Card>

      {tableView ? (
        <Table
          columns={columns}
          dataSource={bookings.filter((record) => {

            const matchesRoomNumber = !filterRoomNumber || record.roomNumber.toString() === filterRoomNumber.toString() || null;
            const phoneNumberMatch = record.phoneNumber ? record.phoneNumber.toString().includes(filterPhoneNumber.toString()) : false;
            const checkInDateObj = record.checkIn ? new Date(record.checkIn) : null;
            const checkOutDateObj = record.checkOut ? new Date(record.checkOut) : null;
            const matchesCheckInDate = !checkInDate || (checkInDateObj && checkInDateObj >= checkInDate.startOf('day').toDate() && checkInDateObj <= checkInDate.endOf('day').toDate());
            const matchesCheckOutDate = !checkOutDate || (checkOutDateObj && checkOutDateObj >= checkOutDate.startOf('day').toDate() && checkOutDateObj <= checkOutDate.endOf('day').toDate());
            const dynamicStatus = calculateStatus(record);
            const matchesStatus = !filterStatus || dynamicStatus === filterStatus;
            return matchesRoomNumber && phoneNumberMatch && matchesCheckInDate && matchesCheckOutDate && matchesStatus;
          })}
          rowKey="bookingId"
          pagination={false}
        />

      ) : (
        <Row gutter={[16, 16]}>
          {bookings
            .filter((record) => {
              const phoneNumberMatch = record.phoneNumber ? record.phoneNumber.toString().includes(filterPhoneNumber.toString()) : false;
              const dynamicStatus = calculateStatus(record);
              const matchesRoomNumber = !filterRoomNumber || record.roomNumber.toString() === filterRoomNumber.toString() || null;
              const checkInDateObj = record.checkIn ? new Date(record.checkIn) : null;
              const checkOutDateObj = record.checkOut ? new Date(record.checkOut) : null;
              const matchesCheckInDate = !checkInDate || (checkInDateObj && checkInDateObj >= checkInDate.startOf('day').toDate() && checkInDateObj <= checkInDate.endOf('day').toDate());
              const matchesCheckOutDate = !checkOutDate || (checkOutDateObj && checkOutDateObj >= checkOutDate.startOf('day').toDate() && checkOutDateObj <= checkOutDate.endOf('day').toDate());
              const matchesStatus = !filterStatus || dynamicStatus === filterStatus;
              return matchesRoomNumber && phoneNumberMatch && matchesCheckInDate && matchesCheckOutDate && matchesStatus;
            })
            .map((booking) =>
              renderBookingCard(booking)
            )}
        </Row>
      )}
      {showCheckoutConfirmationModal()}

      <Drawer
        title="Add New Task"
        placement="right"
        closable={false}
        onClose={closeAddTaskDrawer}
        visible={isAddTaskDrawerVisible}
        width={300}
      >
        <Form layout="vertical" form={form} onFinish={onAddTask}>
          <Form.Item
            name="roomNumber"
            label="Room Number"
            rules={[{ required: true, message: "Please select a room number" }]}
          >
            <Select>
              {selectedBooking && selectedBooking.roomNumbers && selectedBooking.roomNumbers.map(room => (
                <Select.Option key={room.roomNumber} value={room.roomNumber}>
                  Room {room.roomNumber}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="taskName"
            label="Task Name"
            rules={[{ required: true, message: "Please select a task name" }]}
          >
            <Select placeholder="Select a task">
              <Option value="Cleaning">Cleaning</Option>
              <Option value="Room Service">Room Service</Option>
            </Select>
          </Form.Item>

          <Form.Item name="dueDate" label="Date" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: "Please select the priority" }]}
          >
            <Select placeholder="Select Priority">
              <Select.Option value="Low">Low</Select.Option>
              <Select.Option value="Medium">Medium</Select.Option>
              <Select.Option value="High">High</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="default" onClick={closeAddTaskDrawer} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
      <Modal
        title="Group Booking Check-In"
        visible={isCheckInModalVisible}
        onCancel={() => setIsCheckInModalVisible(false)}
        onOk={handleGroupCheckIn}
        okButtonProps={{ disabled: selectedRoomsForCheckIn.length === 0 }} // Disable the "Check in Selected Rooms" button if no rooms are selected
        okText="Check In Selected Rooms"
      >
        <Checkbox
          onChange={handleCheckAllRoomsChange}
          checked={selectedRoomsForCheckIn.length === currentGroupBooking?.roomNumbers?.length}
        >
          Check all
        </Checkbox>
        {currentGroupBooking?.roomNumbers?.map((room) => {
          const roomStatus = calculateStatus(room); // Calculate the status for each room
          const isReserved = roomStatus === "Reserved";
          return (
            <div key={room.bookingId}>
              <Checkbox
                checked={selectedRoomsForCheckIn.includes(room.bookingId)}
                onChange={() => handleRoomCheckChange(room.bookingId)}
                disabled={!isReserved} // Enable the checkbox only if the status is "Reserved"
              >
                {`Room ${room.roomNumber} - Booking ID: ${room.bookingId}`} <Tag color={getStatusColor(roomStatus)}>{roomStatus}</Tag>
              </Checkbox>
            </div>
          );
        })}
      </Modal>

    </div>
  );
};

export default withRouter(ViewBookings); 