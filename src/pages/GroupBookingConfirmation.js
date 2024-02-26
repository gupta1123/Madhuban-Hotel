import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Card, Tag, Button, Modal, Form, Input, Drawer, Space, List, Checkbox, TimePicker, message, Row, Col, Select } from 'antd';
import { Dropdown, Menu, Typography } from 'antd';
import { DownOutlined, ExclamationCircleOutlined, ArrowLeftOutlined, MinusOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { getNames } from 'country-list';
import { EditOutlined, PlusOutlined, SwapOutlined, DollarOutlined, UserOutlined, FileDoneOutlined, CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';
import AddGuest from "./AddGuest";
import GroupAddTransactions from "./GroupAddTransactions";
import BillingSummary from "./BillingSummary";
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import GroupSettlement from "./GroupSettlement";
import { EllipsisOutlined } from '@ant-design/icons';
moment.locale('en');
import { ChakraProvider,DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, FormControl, FormLabel,   } from '@chakra-ui/react';
import { DatePicker } from "@chakra-ui/react";


const PageLayout = styled.div`
    display: flex;
    padding: 24px;
    background-color: #f0f2f5;
  `;
const GroupHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  `;

const SettlementButton = styled(Button)`
    background-color: #1890ff;
    color: #fff;
    &:hover {
      background-color: #40a9ff;
      color: #fff;
    }
    &:focus {
      background-color: #096dd9; /* Slightly darker for focus */
      color: #fff;
    }
  `;

const GroupTitle = styled.h2`
    color: #333;
    font-weight: 600;
    margin-right: 20px; /* Adjust this value as needed to control spacing */
  `;

const ConfirmedBookingText = styled.span`
    color: #32CD32; /* Light green color */
    font-weight: 500;
    font-size: 16px;
    margin-left: 30px; /* Adjust this value as needed */
  `;


const LeftColumn = styled.div`
    flex: 1;
    margin-right: 20px;
  `;

const RightColumn = styled.div`
    width: 350px;
  `;

const GroupTitleAndConfirmation = styled.div`
    display: flex;
    align-items: center;
    color: #333; // Adjust the color as needed
`;

const StyledGroupAddTransactions = styled(GroupAddTransactions)`
    margin-top: 30px;
  `;

const GuestCard = styled(Card)`
    margin-bottom: 20px;
    border-radius: 10px;
  `;

  const RoomCardContainer = styled.div`
  margin-bottom: 20px;
`;

const RoomCard = styled(Card)`
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Slight shadow */
  padding: 20px;
  position: relative;
`;

const Info = styled.div`
    font-size: 16px;
  `;

const Title = styled.h2`
  color: #333;
  font-weight: 600;
  margin-bottom: 5px;
`;

const SubTitle = styled.span`
    font-size: 14px;
    color: #555;
  `;

const StatusTag = styled(Tag)`
  position: absolute;
  top: 10px;
  right: 10px;
`;

const MoreOptionsIcon = styled.span`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
    position: absolute;
    bottom: 10px;
    right: 10px;
  `;

const EditButton = styled(Button)`
    margin-right: 8px;
    color: #1890ff;
    border: none;
  `;
const CheckinButton = styled(Button)`
  background-color: #4CAF50; /* Green background */
  color: #fff;
  &:hover {
      background-color: #45a049; /* Darker green on hover */
  }
  &:focus {
      background-color: #397d39; /* Even darker green on focus */
  }
`;

const CheckoutButton = styled(Button)`
  background-color: #f44336; /* Red background */
  color: #fff;
  &:hover {
      background-color: #da3832; /* Darker red on hover */
  }
  &:focus {
      background-color: #b52f2c; /* Even darker red on focus */
  }
`;
const AddGuestButton = styled(Button)`
    color: #1890ff;
    border: none;
  `;

const StyledModal = styled(Modal)`
    .ant-modal-footer {
      border-top: none;
      padding: 10px 16px;
    }
  `;

const CompactFormItem = styled(Form.Item)`
    margin-bottom: 12px;
  `;

const handleCheckin = () => {
  console.log("Checkin action triggered");
  // Implement check-in logic here
};

const handleCheckout = () => {
  console.log("Checkout action triggered");
  // Implement check-out logic here
};

const EditModal = ({ visible, onCancel, bookingData }) => {
  const [form] = Form.useForm();
  return (
    <StyledModal
      title="Edit Booking"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={() => form.submit()}>
          Save
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        initialValues={bookingData}
        onFinish={(values) => {
          console.log('Edited booking:', values);
          onCancel();
        }}
        layout="vertical"
      >

      </Form>
    </StyledModal>
  );
};

const formatTime = (time) => {
  const [hours, minutes] = time.split(':');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes} ${suffix}`;
};
const ActionMenu = ({ onMenuClick }) => (
  <Menu onClick={onMenuClick}>
    <Menu.Item icon={<DollarOutlined />} key="discount">Add Discount</Menu.Item>
    <Menu.Item icon={<UserOutlined />} key="edit_guest">Edit Guest</Menu.Item>
    <Menu.Item icon={<FileDoneOutlined />} key="invoice">Generate Invoice</Menu.Item>
    <Menu.Item icon={<CalendarOutlined />} key="extend">Extend Booking</Menu.Item>
    <Menu.Item icon={<PlusOutlined />} key="task"> Add Task</Menu.Item>
    <Menu.Item icon={<DeleteOutlined />} key="cancelDeleteBooking">Cancel/Delete Booking</Menu.Item>

  </Menu>
);

const handleMenuClick = (e) => {

  console.log('Action selected:', e.key);
};
const handleCancelBooking = () => {

  console.log('Cancel booking logic here');

  setIsCancelDeleteModalVisible(false);

};
const handleDeleteBooking = () => {

  console.log('Delete booking logic here');

  setIsCancelDeleteModalVisible(false);

};

const addonsToTags = (addons) => {
  return Object.keys(addons).map((addon) => (
    <Tag key={addon} color="blue">
      {addon}: {addons[addon]}
    </Tag>
  ));
};
const handleTransactionsUpdated = () => {

  setTransactionsUpdated(true);

};
const calculateStatus = (bookingDetails) => {
  if (bookingDetails.cancelStatus) return "Cancelled";
  if (!bookingDetails.checkIn) return "Unknown";
  const currentDate = new Date();
  const checkinDate = new Date(bookingDetails.checkIn);
  const checkoutDate = new Date(bookingDetails.checkOut);
  let bookingStatus = "Unknown";

  if (bookingDetails.checkinStatus && !bookingDetails.checkoutStatus) {
    if (currentDate < checkinDate) {
      bookingStatus = "Due in";
    } else if (currentDate >= checkinDate && currentDate < checkoutDate) {
      bookingStatus = "Occupied";
    } else if (currentDate >= checkoutDate) {
      bookingStatus = "Due Out";
    }
  } else if (!bookingDetails.checkinStatus && !bookingDetails.checkoutStatus) {
    bookingStatus = "Reserved";
  } else if (bookingDetails.checkinStatus && bookingDetails.checkoutStatus) {
    bookingStatus = "Checked out";
  }

  return bookingStatus;
};

const getStatusColor = (status) => {
  switch (status) {
    case "Due in":
      return "#FFD700";
    case "Occupied":
      return "#FF6347";
    case "Due Out":
      return "#00CED1";
    case "Reserved":
      return "#4169E1";
    case "Checked out":
      return "#32CD32";
    case "Cancelled":
      return "#DC143C";
    default:
      return "#808080";
  }
};


const GroupBookingConfirmation = ({ authToken, customerId, location }) => {
  const groupId = location?.state?.groupId;
  console.log(groupId)
  const [bookingData, setBookingData] = useState([]);
  const [extendBookingModalVisible, setExtendBookingModalVisible] = useState(false);
  const [roomExtensions, setRoomExtensions] = useState({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [showOnlyBookings, setShowOnlyBookings] = useState(false);
  const [addGuestModalVisible, setAddGuestModalVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newDiscount, setNewDiscount] = useState(0);
  const [isReasonModalVisible, setIsReasonModalVisible] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({});
  const [cancelReason, setCancelReason] = useState('');
  const [selectedDate, setSelectedDate] = useState(moment(bookingDetails.checkOut));
  const [isCancelDeleteModalVisible, setIsCancelDeleteModalVisible] = useState(false);
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);
  const [discountModalVisible, setDiscountModalVisible] = useState(false);
  const [isEditGuestModalVisible, setIsEditGuestModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form] = Form.useForm();
  const countryNames = getNames();
  const history = useHistory();
  const [billingDetails, setBillingDetails] = useState(null);
  const [checkinModalVisible, setCheckinModalVisible] = useState(false);
  const [selectedBookingsForCheckin, setSelectedBookingsForCheckin] = useState([]);
  const hasReservedBookings = bookingData.some(booking => calculateStatus(booking) === "Reserved");
  const [selectedIdType, setSelectedIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');

  
  const idTypeMapping = {
    aadharCard: 'Aadhaar Card',
    drivingLicense: 'Driving Licence',
    pan: 'PAN Card',
    passport: "Passport",

  };
  const idTypeOptions = {
    aadharCard: "Aadhaar Card",
    drivingLicense: "Driving Licence",
    pan: "PAN Card",
    passport: "Passport",
  };
  
  const [roomChangeSelection, setRoomChangeSelection] = useState(null);
  const [vacantRooms, setVacantRooms] = useState([]);
  const [isTaskDrawerVisible, setIsTaskDrawerVisible] = useState(false);
  const [changeRoomModalVisible, setChangeRoomModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [bookingIdForChange, setBookingIdForChange] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const countryOptions = countryNames.map(name => ({
    value: name,
    label: name,
  }));
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const customerDocs = bookingDetails.customerDocs; // Make sure `bookingDetails` contains your API response data
    if (customerDocs) {
      const idTypes = Object.keys(customerDocs);
      const defaultIdType = idTypes.length > 0 ? idTypes[0] : '';
      setSelectedIdType(defaultIdType);
      setIdNumber(customerDocs[defaultIdType]);
    }
  }, [bookingDetails]);



  const handleIdTypeChange = (value) => {
    setSelectedIdType(value);
    setIdNumber(bookingDetails.customerDocs[value]);
  };

  const handleTransactionUpdate = useCallback((newTransactions) => {
    setTransactions(newTransactions);
    setRefreshKey(oldKey => oldKey + 1); // Update the key to trigger reload
  }, []);

  // useEffect to react to changes in refreshKey
  useEffect(() => {
    console.log('key')
  }, [refreshKey]);


  const toggleShowOnlyBookings = () => {
    setShowOnlyBookings(!showOnlyBookings);
  };
  const handleOpenExtendBookingModal = () => {

    const initialRoomExtensions = bookingData.reduce((acc, room) => {
      acc[room.bookingId] = { ...room, extendedCheckOut: moment(room.checkOut) };
      return acc;
    }, {});
    setRoomExtensions(initialRoomExtensions);
    setExtendBookingModalVisible(true);
  };
  const handleOpenChangeRoomModal = (bookingId) => {
    setBookingIdForChange(bookingId);
    setChangeRoomModalVisible(true);
  };


  const handleOpenCheckinModal = () => {
    setCheckinModalVisible(true);
  };

  // Adjust the function to accept the event object and stop propagation
  const handleSelectRoomForCheckin = (event, bookingId) => {
    // Stop the click event from propagating
    event.stopPropagation();

    // Determine if the checkbox is checked
    const isChecked = event.target.checked;

    if (isChecked) {
      setSelectedBookingsForCheckin((prev) => [...prev, bookingId]);
    } else {
      setSelectedBookingsForCheckin((prev) => prev.filter((id) => id !== bookingId));
    }
  };

  useEffect(() => {
    if (bookingDetails.customerDocs) {
      // Assuming drivingLicense is always present, but you could generalize this
      const docTypes = Object.keys(bookingDetails.customerDocs);
      const defaultDocType = docTypes.length > 0 ? docTypes[0] : '';
      setSelectedIdType(defaultDocType);
    }
  }, [bookingDetails]);

  // Function to handle the check-in confirmation
  const handleConfirmCheckin = async () => {
    const payload = {
      bookingList: selectedBookingsForCheckin,
    };

    try {
      const response = await axios.put(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/checkInForGroup?groupId=${groupId}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status === 200) {
        // Handle successful check-in
        message.success('Check-in successful');

        // Close the check-in modal
        setCheckinModalVisible(false);

        // Reset selected bookings for check-in
        setSelectedBookingsForCheckin([]);

        // Fetch the latest booking details to refresh the component
        fetchGroupBookingDetails(); // Make sure this function is defined and fetches the latest booking data

      } else {
        // Handle non-successful response
        message.error('Check-in failed');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      message.error('An error occurred during check-in');
    }
  };

  const CheckinModal = () => (
    <Modal
      title="Select Rooms for Check-in"
      visible={checkinModalVisible}
      onOk={handleConfirmCheckin}
      onCancel={() => setCheckinModalVisible(false)}
      okText="Confirm"
      okButtonProps={{ disabled: selectedBookingsForCheckin.length === 0 }} // Disable the Confirm button if no bookings are selected
    >
      {bookingData.map((booking) => {
        const status = calculateStatus(booking);
        const isReserved = status === "Reserved"; // Check if the status is "Reserved"
        return (
          <div key={booking.bookingId} style={{ marginBottom: '10px' }}>
            <Checkbox
              checked={selectedBookingsForCheckin.includes(booking.bookingId)}
              onChange={(e) => handleSelectRoomForCheckin(e, booking.bookingId)}
              disabled={!isReserved} // Disable the checkbox if the booking is not "Reserved"
            >
              <span>
                <b>Room </b><Tag color="red">{booking.roomNumber}</Tag> - <b>Booking ID: </b><Tag color="blue">{booking.bookingId}</Tag> - <b>Status: </b>{status}
              </span>
            </Checkbox>
          </div>
        );
      })}
    </Modal>
  );






  const handleChangeRoom = async () => {
    const bookingId = bookingIdForChange;
    const roomNumber = selectedRoom;
    const url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/editRoom?bookingId=${bookingId}&roomNumber=${roomNumber}`;

    try {
      const response = await axios.put(url, {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status === 200) {
        message.success(`Room changed to ${roomNumber} for booking ID ${bookingId}.`);
        setChangeRoomModalVisible(false);
        // Fetch the updated booking details for the group
        fetchGroupBookingDetails();
        // Fetch the updated billing details
        fetchBillingDetails(groupId); // Assuming groupId is available in your component's state or props
      } else {
        message.error('Failed to update room.');
      }
    } catch (error) {
      console.error('Error changing room:', error);
      message.error('An error occurred while changing the room.');
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupBookingDetails();
      fetchBillingDetails(groupId);
    }
  }, [groupId, authToken]); // Include groupId and authToken as dependencies if they might change

  const showTaskDrawer = () => {
    setIsTaskDrawerVisible(true);
  };

  const closeTaskDrawer = () => {
    setIsTaskDrawerVisible(false);
  };
  const renderRoomDetails = bookingData.map((booking) => (
    <RoomCardContainer key={booking.bookingId}>
      <RoomCard title={`Room ${booking.roomNumber} - ${booking.roomType}`}>
        <Typography.Text>Check-in: <Tag color="blue">{moment(booking.checkIn).format('LL')} at {formatTime(booking.checkInTime)}</Tag></Typography.Text>
        <Typography.Text>Check-out: <Tag color="blue">{moment(booking.checkOut).format('LL')} at {formatTime(booking.checkOutTime)}</Tag></Typography.Text>
        <Typography.Paragraph>Addons: {addonsToTags(booking.addOnMap)}</Typography.Paragraph>
        <ButtonGroup>
          <Button icon={<EditOutlined />} onClick={() => handleEditModalOpen(booking)}>Edit</Button>
          <Button icon={<PlusOutlined />} onClick={() => handleAddGuestModalOpen(booking.bookingId)}>Add Guests</Button>
        </ButtonGroup>
      </RoomCard>
    </RoomCardContainer>
  ));
  const adjustCheckOutDate = (bookingId, change) => {
    setRoomExtensions(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        extendedCheckOut: moment(prev[bookingId].extendedCheckOut).add(change, 'days'),
      }
    }));
  };

  const MoreOptions = ({ bookingId }) => {
    return (
      <Dropdown
        overlay={(
          <Menu>
            <Menu.Item icon={<PlusOutlined />} key="addGuest" onClick={() => handleAddGuestModalOpen(bookingId)}>
              Add Guest
            </Menu.Item>
            <Menu.Item icon={<SwapOutlined />} key="changeRoom" onClick={() => handleOpenChangeRoomModal(bookingId)}>
              Change Room
            </Menu.Item>
          </Menu>
        )}
        trigger={['click']}
      >
        <a onClick={(e) => e.preventDefault()}>
          <EllipsisOutlined rotate={90} style={{ fontSize: '22px', cursor: 'pointer' }} />
        </a>
      </Dropdown>
    );
  };


  const saveExtendedDates = async () => {
    const allPromises = Object.values(roomExtensions).map(room => {
      const dateString = moment(room.extendedCheckOut).format('YYYY-MM-DD');
      return axios.put(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/edit?bookingId=${room.bookingId}&dateString=${dateString}`, {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`, // Include your auth token
        },
      }).then(response => {
        if (response.status === 200) {
          return { bookingId: room.bookingId, success: true };
        } else {
          return { bookingId: room.bookingId, success: false, error: `Unexpected status code: ${response.status}` };
        }
      }).catch(error => {
        return { bookingId: room.bookingId, success: false, error: error.message };
      });
    });

    try {
      const results = await Promise.all(allPromises);
      const failedUpdates = results.filter(result => !result.success);

      if (failedUpdates.length === 0) {
        // If all updates are successful, fetch the updated group summary and billing details
        await fetchGroupBookingDetails(); // Assuming this function fetches and updates the booking details
        await fetchBillingDetails(groupId); // Fetch and update billing details after extending bookings
        message.success('All booking dates have been successfully updated.');
      } else {
        // If there are any failures
        message.error('Some updates might not have been successful. Please check the booking details.');
      }
    } catch (error) {
      // Handle unexpected errors in promise handling
      message.error('An unexpected error occurred while updating booking dates.');
      console.error('Error processing booking date updates:', error);
    } finally {
      setExtendBookingModalVisible(false); // Close the modal
    }
  };

  const fetchBillingDetails = async (groupId) => {
    try {
      const response = await axios.get(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getGroupBill?groupId=${groupId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status === 200) {
        setBillingDetails(response.data); // Assuming you have a state called billingDetails to store the billing info

      } else {
        message.error('Failed to fetch billing details.');
      }
    } catch (error) {
      console.error('Error fetching billing details:', error);
      message.error('An error occurred while fetching billing details.');
    }
  };


  const fetchGroupBookingDetails = async () => {
    try {
      // Assuming `groupId` is available in the component's state or props
      const response = await axios.get(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getGroupSummary?groupId=${groupId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`, // Include the authorization header if required
        },
      });

      if (response.status === 200) {
        // Assuming the API returns an array of booking details
        setBookingData(response.data); // Update the state with the fetched booking details
      } else {
        // Handle responses with non-success status codes
        console.error(`Failed to fetch group booking details, status code: ${response.status}`);
        message.error('Failed to update group booking details.');
      }
    } catch (error) {
      // Handle errors that occur during the API call
      console.error('Error fetching group booking details:', error);
      message.error('An error occurred while updating group booking details.');
    }
  };


  const actionsDropdownMenu = (
    <Menu onClick={(e) => handleActionsDropdown(e.key)}>

      <Menu.Item key="cancelDeleteBooking">Cancel/Delete Booking</Menu.Item>

    </Menu>
  );
  const handleCancelBooking = () => {
    setIsCancelDeleteModalVisible(false);
    setIsReasonModalVisible(true);
  };
  const handleDiscountInputChange = (e) => {
    setNewDiscount(parseFloat(e.target.value));
  };
  const handleOpenDiscountModal = () => {
    setDiscountModalVisible(true);
  };
  const handleSaveDiscount = async () => {
    const url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/updateGroupDiscount?discount=${newDiscount}&groupId=${groupId}`;
  
    try {
      const response = await axios.put(url, {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
  
      if (response.status === 200) {
        // Assuming the response is successful and the discount is added
        message.success('Group discount updated successfully!');
  
        // Close the discount modal
        setDiscountModalVisible(false);
  
        // Fetch the latest booking details to refresh the component
        await fetchGroupBookingDetails(); // Assuming this function fetches and updates the booking details
        await fetchBillingDetails(groupId); // Also, re-fetch billing details if necessary
  
      } else {
        // Handle the case where the API response is not successful
        message.error('Failed to update group discount.');
      }
    } catch (error) {
      console.error('Error updating group discount:', error);
      message.error('An error occurred while updating the group discount.');
    }
  };
  

  const handleCloseDiscountModal = () => {
    setDiscountModalVisible(false);
  };

  useEffect(() => {
    const fetchBillingDetails = async () => {
      try {
        const response = await axios.get(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getGroupBill?groupId=${groupId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.status === 200) {
          setBillingDetails(response.data);
        } else {
          console.error('Failed to fetch billing details');
        }
      } catch (error) {
        console.error('Error fetching billing details:', error);
      }
    };

    if (authToken) {
      fetchBillingDetails();
    }
  }, [authToken]); // Add other dependencies here if necessary

  // Use a state to manage a key that changes when new booking details are fetched
  const [formKey, setFormKey] = useState(Date.now());

  // Update this key when you fetch new booking details to force rerender
  const fetchGuestDetails = async () => {
    try {
      const response = await axios.get(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getGroupSummary?groupId=${groupId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.status === 200 && response.data.length > 0) {
        setBookingDetails(response.data[0]);
        setFormKey(Date.now()); // Update the key to force rerender
      } else {
        message.error('Failed to fetch guest details.');
      }
    } catch (error) {
      message.error('An error occurred while fetching guest details.');
    }
  };




  const handleActionsDropdown = (e) => {
    console.log('Action selected:', e.key);
    switch (e.key) {
      case "cancelDeleteBooking":
        setIsCancelDeleteModalVisible(true);
        break;
      case "discount":
        setDiscountModalVisible(true);
        break;
      case "edit_guest":
        fetchGuestDetails();
        setIsEditGuestModalVisible(true);
        break;
      case "extend":
        handleOpenExtendBookingModal();
        break;
      case "task":
        showTaskDrawer(); // This is the new function to show the side panel for adding a task
        break;
      case "invoice":
        if (guestDetails) {
          history.push({
            pathname: '/Groupinvoice',
            state: {
              groupId: groupId,
              name: guestDetails.customerName,
              email: guestDetails.email,
              phone: guestDetails.phoneNumber,
              address: `${guestDetails.address}, ${guestDetails.city}, ${guestDetails.state}, ${guestDetails.country}`,
              gstNumber: guestDetails.gstNumber,
              billingDetails: {
                totalRoomCharges: guestDetails.roomTotal,
                gstAmount: guestDetails.gstAmount,
                totalAddonCharges: guestDetails.addOnTotal,
                discount: guestDetails.discount,
                grossAmount: guestDetails.grossTotal,
                paidAmount: guestDetails.paidAmt,
                pendingAmount: guestDetails.pendingAmt,
              }
            }
          });
        }
        break;

    }
  };



  const handleDeleteBooking = () => {
    setIsCancelDeleteModalVisible(false);
    setIsDeleteConfirmationVisible(true);
  };


  const showCancelDeleteModal = () => {
    setIsCancelDeleteModalVisible(true);
  };


  useEffect(() => {
    const fetchBookingGroupSummary = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getGroupSummary?groupId=${groupId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setBookingData(Array.isArray(response.data) ? response.data : []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching booking group summary: ", error);
        setIsLoading(false);
      }
    };

    if (authToken) {
      fetchBookingGroupSummary();
    }
  }, [authToken]);

const handleConfirmDelete = async () => {
  try {
    const response = await axios.delete(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/deleteGroup?groupId=${groupId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (response.status === 200) {
      message.success("Booking deleted!");
      history.push("/view-bookings");
    } else {
      message.error("Error deleting booking group!");
    }
  } catch (error) {
    console.error("Error deleting booking group:", error);
    message.error("Error deleting booking group!");
  }
};


  useEffect(() => {
    const fetchVacantRooms = async () => {
      try {
        const checkInDate = '2024-01-29'; // Example check-in date
        const checkOutDate = '2024-02-01'; // Example check-out date
        const checkInTime = '13:00'; // Example check-in time
        const checkOutTime = '13:00'; // Example check-out time
        const response = await axios.get(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/getVacantBetween?checkInDate=${checkInDate}&checkInTime=${checkInTime}&checkOutDate=${checkOutDate}&checkOutTime=${checkOutTime}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setVacantRooms(response.data);
      } catch (error) {
        console.error('Failed to fetch vacant rooms:', error);
        message.error('Failed to fetch vacant rooms.');
      }
    };

    if (changeRoomModalVisible) {
      fetchVacantRooms();
    }
  }, [changeRoomModalVisible, authToken]); // This effect depends on the modal visibility and authToken


  const handleFormSubmit = async (values) => {
    try {
      // Format the date value before sending to the API
      const formattedDate = values.date ? values.date.format('YYYY-MM-DD') : '';

      // Make the POST request to the API endpoint
      const response = await axios.post('http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/task/create', {
        taskName: values.taskName,
        priority: values.priority,
        roomNumber: values.roomNumber,
        status: "Assigned",
        dueDate: formattedDate,
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });

      // Check if the response is successful
      if (response.status === 200) {
        // If successful, show a success message
        message.success('Task added successfully!');
        // Close the drawer
        closeTaskDrawer();
      } else {
        // If the response is not successful, show an error message
        message.error('Failed to add task.');
      }
    } catch (error) {
      // If there is an error in the API call, log the error and show an error message
      console.error('Error adding task:', error);
      message.error('An error occurred while adding the task.');
    }
  };


  useEffect(() => {
    console.log("Received Booking ID in BookingConfirmation:", customerId);
  }, [customerId]);
  const guestDetails = bookingData.length > 0 ? bookingData[0] : null;

  const handleEditModalOpen = (bookingData) => {
    setEditingBooking(bookingData);
    setEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setEditingBooking(null);
    setEditModalVisible(false);
  };

  const handleAddGuestModalOpen = (bookingId) => {
    setSelectedBookingId(bookingId);
    setAddGuestModalVisible(true);
  };

  const handleAddGuestModalClose = () => {
    setAddGuestModalVisible(false);
    setSelectedBookingId(null);
  };
  useEffect(() => {
    setSelectedDate(moment(bookingDetails.checkOut));
  }, [bookingDetails.checkOut]);
 
  const handleCancelBookingSubmit = async () => {
    if (!cancelReason.trim()) {
      message.error("A cancellation reason is required.");
      return;
    }
  
    const endpoint = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/cancelGroup?groupId=${groupId}`;
    try {
      const response = await axios.put(endpoint, {
        reason: cancelReason, // Assuming you send the cancellation reason in the request body
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
  
      if (response.status === 200) {
        message.success("Group booking cancelled successfully.");
  
        // Close any open modals related to cancellation
        setIsReasonModalVisible(false);
  
        // Refresh the group booking confirmation data
        await fetchGroupBookingDetails(); // Assuming this function fetches and updates the booking details
        await fetchBillingDetails(groupId); // Assuming this function fetches and updates the billing details
  
      } else {
        message.error("Cancellation failed.");
      }
    } catch (error) {
      console.error("Error during group cancellation:", error);
      message.error("An unexpected error occurred while cancelling the group booking.");
    }
  };
  

  const handleSaveEditData = async (formValues) => {
    // Construct the payload from the form values
    const payload = {
      title: formValues.title,
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      email: formValues.email,
      address: formValues.address,
      city: formValues.city,
      state: formValues.state,
      country: formValues.country,
      phoneNumber: formValues.phoneNumber,
      
      // Assuming the form collects the ID type and number as idType and idNumber
      customerDocs: {
        [formValues.idType]: formValues.idNumber,
      },
      age: formValues.age,
    };

    try {
      // Use the custId from the bookingDetails state
      const response = await axios.put(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/customers/editCustomer?customerId=${bookingDetails.custId}`, payload, {
        headers: {
          'Authorization': `Bearer ${authToken}`, // Include the authorization header
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        message.success('Guest details updated successfully.');
        // Any additional actions after successful update, e.g., closing modal or refreshing data
        setIsEditGuestModalVisible(false); // Example: Close the modal
        fetchGuestDetails(); // Example: Refresh guest details
      } else {
        message.error('Failed to update guest details.');
      }
    } catch (error) {
      console.error('Error updating guest details:', error);
      message.error('An error occurred while updating guest details.');
    }
  };

  useEffect(() => {
    if (bookingDetails && bookingDetails.customerDocs) {
      // Find the first key-value pair in customerDocs
      const firstDocKey = Object.keys(bookingDetails.customerDocs)[0];
      const firstDocValue = bookingDetails.customerDocs[firstDocKey];

      // Update form initial values
      form.setFieldsValue({
        idType: firstDocKey, // You might need to convert this key to match one of your idTypeOptions if necessary
        idNumber: firstDocValue,
        // Set other fields as necessary
      });
    }
  }, [bookingDetails, form]);


  return (
    <PageLayout>
      <LeftColumn>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            {guestDetails && (
              <>
                <GroupHeader>
                  <GroupTitleAndConfirmation style={{ textAlign: 'center' }}>
                    <GroupTitle>
                      Group Booking ID: {guestDetails.groupId}
                    </GroupTitle>
                    {/* Check if any booking is cancelled and display below the Group Booking ID */}
                    {bookingData.some(booking => booking.cancelStatus) ? (
                      <Tag color="red">Booking Cancelled</Tag>
                    ) : (
                      <ConfirmedBookingText>Confirmed Booking!</ConfirmedBookingText>
                    )}
                  </GroupTitleAndConfirmation>
                  <Dropdown overlay={<ActionMenu onMenuClick={handleActionsDropdown} />} trigger={['click']}>
                    <Button>
                      Actions <DownOutlined />
                    </Button>
                  </Dropdown>
                </GroupHeader>

                <GuestCard title={<Title>{guestDetails.customerName}</Title>}>
                  {bookingData.some(booking => booking.cancelStatus) ? (
                    <Tag color="red">Booking Cancelled: {bookingData.find(booking => booking.cancelStatus)?.reason || "Not specified"}</Tag>
                  ) : (
                    <p> </p>
                  )}
                  <Info>Email: <SubTitle>{guestDetails.email}</SubTitle></Info>
                  <Info>Phone: <SubTitle>{guestDetails.phoneNumber}</SubTitle></Info>
                  <Info>Address: <SubTitle>{`${guestDetails.address}, ${guestDetails.city}, ${guestDetails.state}, ${guestDetails.country}`}</SubTitle></Info>
                </GuestCard>
              </>
            )}
            {bookingData.map((booking) => (
              <RoomCardContainer key={booking.bookingId}>
                <RoomCard
                  title={`Room ${booking.roomNumber} - ${booking.roomType}`}
                >
                  <StatusTag color={getStatusColor(calculateStatus(booking))}>{calculateStatus(booking)}</StatusTag>

                  <div>
                    Check-in: <SubTitle>{moment(booking.checkIn).format('LL')} at {formatTime(booking.checkInTime)}</SubTitle>
                  </div>
                  <div>
                    Check-out: <SubTitle>{moment(booking.checkOut).format('LL')} at {formatTime(booking.checkOutTime)}</SubTitle>
                  </div>
                  <div>
                    Addons: {addonsToTags(booking.addOnMap)}
                  </div>
                  <ButtonGroup>
                    {/* Replace AddGuestButton with MoreOptions */}
                    <MoreOptions bookingId={booking.bookingId} />
                  </ButtonGroup>
                </RoomCard>
              </RoomCardContainer>
            ))}
          </>
        )}
        {editingBooking && (
          <EditModal
            visible={editModalVisible}
            onCancel={handleEditModalClose}
            bookingData={editingBooking}
          />
        )}

        <Modal
          title="Add Guest"
          visible={addGuestModalVisible}
          onCancel={handleAddGuestModalClose}
          footer={null}
          width={600}
        >
          <AddGuest bookingId={selectedBookingId} authToken={authToken} />
        </Modal>
        <Modal
          title="Change Room (Available Rooms)"
          visible={changeRoomModalVisible}
          onOk={handleChangeRoom}
          onCancel={() => setChangeRoomModalVisible(false)}
        >
          <Select
            showSearch
            style={{ width: '100%' }}
            placeholder="Select a new room"
            optionFilterProp="children"
            onChange={(value) => setSelectedRoom(value)}
            value={selectedRoom}
          >
            {vacantRooms.map(room => (
              <Option key={room.room} value={room.room}>
                <span>
                  <Tag color="blue">{`Room ${room.room}`}</Tag>
                  <Tag color="green">{` ${room.roomType}`}</Tag>
                  <Tag color="red">{` Floor ${room.floor}`}</Tag>
                  <Tag color="purple">{` ₹${room.costPerDay}/day`}</Tag>
                </span>
              </Option>
            ))}
          </Select>
        </Modal>


        <Modal
          title="Extend Booking"
          visible={extendBookingModalVisible}
          onCancel={() => setExtendBookingModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setExtendBookingModalVisible(false)}>Cancel</Button>,
            <Button key="submit" type="primary" onClick={saveExtendedDates}>Save Changes</Button>,
          ]}
        >
          <List
            dataSource={Object.values(roomExtensions)}
            renderItem={room => (
              <List.Item>
                <Typography.Text>
                  Room {room.roomNumber} (Booking ID: {room.bookingId}):
                </Typography.Text>
                <Button icon={<MinusOutlined />} onClick={() => adjustCheckOutDate(room.bookingId, -1)} />
                <Typography.Text> {moment(room.extendedCheckOut).format("YYYY-MM-DD")} </Typography.Text>
                <Button icon={<PlusOutlined />} onClick={() => adjustCheckOutDate(room.bookingId, 1)} />
              </List.Item>
            )}
          />
        </Modal>


        <Modal
          title="Edit Guest Details"
          visible={isEditGuestModalVisible}
          onCancel={() => setIsEditGuestModalVisible(false)}
          footer={[

          ]}
          width="700px"
          centered
        >
          <Form
            layout="vertical"
            form={form}
            key={formKey} // Use the key here
            initialValues={bookingDetails}
            onFinish={handleSaveEditData}
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Form.Item
                  name="title"
                  label={<b>Title</b>}
                  rules={[{ required: true, message: "Title is required" }]}
                >
                  <Select placeholder="Select a title">
                    <Select.Option value="Mr.">Mr.</Select.Option>
                    <Select.Option value="Miss">Miss</Select.Option>
                    <Select.Option value="Mrs.">Mrs.</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="customerName" label={<b>Customer Name</b>}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="email" label={<b>Email</b>}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Form.Item name="phoneNumber" label={<b>Phone Number</b>}>
                  <Input />
                </Form.Item>
                
              </Col>
              <Col span={8}>
                <Form.Item name="address" label={<b>Address</b>}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="city" label={<b>City</b>}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Form.Item name="state" label={<b>State</b>}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="country" label={<b>Country</b>}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                  <Form.Item name="age" label={<b>Age</b>}>
                    <Input />
                  </Form.Item>
                </Col>
            </Row>

            {/* Assuming customerDocs is an object and you want to display a specific doc */}
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item name="idType" label="ID Type">
                  <Select>
                    {/* Map your idTypeOptions to Select.Option components */}
                    {Object.entries(idTypeOptions).map(([key, value]) => (
                      <Select.Option key={key} value={key}>{value}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>

              </Col>
              <Col span={12}>
                <Form.Item name="idNumber" label={<b>Identification Number</b>} rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Save
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>

        </Modal>
        <div><Modal
          title="Add Discount"
          visible={discountModalVisible}
          onOk={handleSaveDiscount}
          onCancel={handleCloseDiscountModal}
          footer={[
            <Button key="back" onClick={handleCloseDiscountModal}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={handleSaveDiscount}>
              Save
            </Button>,
          ]}
        >
          <Form layout="vertical">

            <Form.Item label="New Discount">
              <Input
                type="number"
                value={newDiscount}
                onChange={handleDiscountInputChange}
                placeholder="Enter new discount amount"
              />
            </Form.Item>
          </Form>
        </Modal></div>
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ExclamationCircleOutlined style={{ color: '#ffcc00', marginRight: 8 }} />
              <Typography.Text strong>Reason for Cancellation</Typography.Text>
            </div>
          }
          visible={isReasonModalVisible}
          onCancel={() => setIsReasonModalVisible(false)}
          footer={[
            <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => {
              setIsReasonModalVisible(false);
              setIsCancelDeleteModalVisible(true);
            }} style={{ border: 'none', }} />,
            <Button
              className="confirm-cancel-button-teal"
              onClick={handleCancelBookingSubmit}
            >
              Confirm Cancel
            </Button>

          ]}
          destroyOnClose={true}
        >
          <Form layout="vertical">
            <Form.Item
              label="Please provide a reason for cancellation:"
              required
              tooltip="This is a required field"
            >
              <Input.TextArea
                rows={4}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason here"
              />
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', color: '#D32F2F' }}>
              <DeleteOutlined style={{ fontSize: '22px', marginRight: '10px' }} />
              <span style={{ fontSize: '20px', fontWeight: '500' }}>Delete Booking</span>
            </div>
          }
          visible={isDeleteConfirmationVisible}
          onCancel={() => setIsDeleteConfirmationVisible(false)}
          footer={null}
          closable={false}
          centered
          width={400}
        >
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <p style={{ fontSize: '16px', color: '#555' }}>
              Are you sure you want to permanently delete this booking? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
              <Button
                onClick={() => {
                  setIsDeleteConfirmationVisible(false);
                  setIsCancelDeleteModalVisible(true);
                }}
                style={{ marginRight: '10px', flex: 'none' }}
                icon={<ArrowLeftOutlined />}
              >
                Go Back
              </Button>
              <Button
                type="primary"
                danger
                onClick={handleConfirmDelete}
                icon={<CheckOutlined />}
                style={{ marginLeft: '10px', flex: 'none' }}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
        <StyledGroupAddTransactions
          groupId={groupId}
          authToken={authToken}
          onTransactionsUpdated={handleTransactionUpdate}
        />
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CheckinButton onClick={handleOpenCheckinModal} disabled={!hasReservedBookings}>
            Checkin
          </CheckinButton>

          <CheckinModal />

          <CheckoutButton style={{ marginLeft: '10px' }} onClick={() => history.push('/GroupSettlement', { groupId: guestDetails.groupId, authToken })}>
            Checkout
          </CheckoutButton>
          <SettlementButton
            style={{ marginLeft: '10px' }} // Added to maintain spacing between buttons
            onClick={() => history.push('/GroupSettlement', { groupId: guestDetails.groupId, authToken })}
          >
            Settlement
          </SettlementButton>
        </div>
      </LeftColumn>
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            <Typography.Text>Cancel or Delete Booking</Typography.Text>
          </Space>
        }
        visible={isCancelDeleteModalVisible}
        onCancel={() => setIsCancelDeleteModalVisible(false)}
        footer={null}
        centered
      >
        <Typography.Paragraph>Please choose an action for the booking:</Typography.Paragraph>
        <Space size="middle" style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            onClick={handleCancelBooking}
            style={{ borderColor: 'green', color: 'green' }}
          >
            Cancel Booking
          </Button>
          <Button
            onClick={handleDeleteBooking}
            style={{ borderColor: 'red', color: 'red' }}
            danger
          >
            Delete Booking
          </Button>
        </Space>
      </Modal>

      <RightColumn>
        <BillingSummary
          total_room_charges={billingDetails?.total_room_charges}
          gstAmount={billingDetails?.gstAmount}
          total_addon_charges={billingDetails?.total_addon_charges}
          discount={billingDetails?.discount}
          grossAmount={billingDetails?.grossAmount}
          paid_amount={billingDetails?.paid_amount}
          pending_amount={billingDetails?.pending_amount}
        />
      </RightColumn>
      <Drawer
        title="Add New Task"
        placement="right"
        closable={true}
        onClose={closeTaskDrawer}
        visible={isTaskDrawerVisible}
        width={300}
      >
        <Form layout="vertical" hideRequiredMark onFinish={handleFormSubmit}>
          <Form.Item
            name="roomNumber"
            label="Room Number"
            rules={[{ required: true, message: 'Please select room number' }]}
          >
            <Select placeholder="Select room number">
              {bookingData.map((booking) => (
                <Select.Option key={booking.roomNumber} value={booking.roomNumber}>
                  {booking.roomNumber}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="taskName"
            label="Task Name"
            rules={[{ required: true, message: 'Please select a task' }]}
          >
            <Select placeholder="Select a task">
              <Select.Option value="Cleaning">Cleaning</Select.Option>
              <Select.Option value="Room Service">Room Service</Select.Option>
            </Select>
          </Form.Item>

          <FormControl isRequired mt={4}>
                        <FormLabel>Date</FormLabel>
                        <Input
                            type="date"
                            placeholder="Select date"
                            min={today}
                            defaultValue={today}
                        />
                    </FormControl>
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select priority' }]}
          >
            <Select placeholder="Select Priority">
              <Select.Option value="Low">Low</Select.Option>
              <Select.Option value="Medium">Medium</Select.Option>
              <Select.Option value="High">High</Select.Option>
            </Select>
          </Form.Item>
          <div
            style={{
              textAlign: 'right',
              marginTop: '24px'
            }}
          >
            <Button onClick={closeTaskDrawer} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </div>
        </Form>
      </Drawer>


    </PageLayout>

  );
};
export default GroupBookingConfirmation; 