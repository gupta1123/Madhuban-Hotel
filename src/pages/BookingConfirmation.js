import React, { useState, useEffect, useCallback } from "react";
import { DatePicker } from 'antd';
import {
  Grid,
} from "@mui/material";
//import ExtendBookingModal from './Extend'; // Adjust the path as necessary
import './Extend.css';
import styled from 'styled-components';
import './BookingConfirmation.css';

import { PlusCircleOutlined, MinusCircleOutlined, CloseOutlined, DownOutlined, DeleteOutlined, PlusOutlined, CalendarOutlined, UserOutlined, ToolOutlined, DollarOutlined, FileDoneOutlined, SwapOutlined, ArrowLeftOutlined, CheckOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import {
  Card,
  Typography,
  Row,
  Col,
  Form,
  Select, Tag,
  Input,
  InputNumber, Divider,
  Button, Menu, Dropdown,
  Table,
  Tooltip,
  Space,
  Modal,
  Drawer,
  Upload,
} from "antd";
import moment from "moment";
import { getNames } from 'country-list';
import { FormControl, FormLabel } from '@chakra-ui/react';

import AddGuest from "../pages/AddGuest";
import AddTransaction from "../pages/AddTransaction";
import CustomBookingsummary from "../pages/CustomBookingsummary";
import BillingSummary from "./BillingSummary"; // Replace with the correct path to your BillingSummary component
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { message } from "antd";
import { Icon } from '@mui/material'; // Assuming you're using Material-UI
import Settlement from "./Settlement.js";
import { width } from "@mui/system";


const ConfirmedBookingText = styled.span`
    color: #32CD32; /* Light green color */
    font-weight: 500;
    font-size: 16px;
    margin-left: 30px; /* Adjust this value as needed */
  `;



function BookingConfirmation({
  guestData,
  authToken,
  onBackClick,
  handleAddGuest,

  handleSaveEditGuest,
  handleCancelEditGuest,
  setGuestData,
  customerId: propCustomerId,
  selectedRoom,
}) {
  console.log(authToken)
  const location = useLocation();

  const customerId = location.state?.customerId;


  console.log("BookingConfirmation - customerId:", customerId);
  const [editGuestIndex, setEditGuestIndex] = useState(null);
  const [editedGuest, setEditedGuest] = useState({});
  const [guestDetails, setGuestDetails] = useState([]);
  const [isCurrentGuestValid, setIsCurrentGuestValid] = useState(true);
  const [allBookings, setAllBookings] = useState([]);
  const [guestList, setGuestList] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [guestEditStates, setGuestEditStates] = useState({});
  const [showInvoice, setShowInvoice] = useState(false);
  const [openCardId, setOpenCardId] = useState(null);
  const history = useHistory();
  const [isCancelDeleteModalVisible, setIsCancelDeleteModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);
  const [showAddGuests, setShowAddGuests] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [extendModalVisible, setExtendModalVisible] = useState(false);
  const [discountModalVisible, setDiscountModalVisible] = useState(false);
  const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState(false);
  const [bookingUpdated, setBookingUpdated] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Initial value is 0
  const showCheckoutConfirmationModal = () => setIsCheckoutModalVisible(true);
  const showExtendModal = () => setExtendModalVisible(true);
  const [selectedCountry, setSelectedCountry] = useState("");

  const hideExtendModal = () => setExtendModalVisible(false);
  const hideCheckoutConfirmationModal = () => setIsCheckoutModalVisible(false);
  const [newCheckoutDate, setNewCheckoutDate] = useState(null);
  const [isReasonModalVisible, setIsReasonModalVisible] = useState(false);
  const [addOnQuantities, setAddOnQuantities] = useState({});

  // State for managing selected ID type and number
  const [selectedIdType, setSelectedIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const countryNames = getNames(); // This gives an array of country names
  const countryOptions = countryNames.map(name => ({
    value: name,
    label: name,
  }));
  const idTypeMapping = {
    aadharCard: 'Aadhaar Card',
    drivingLicense: 'Driving Licence',
    "Driving License": 'Driving Licence',

    pan: 'PAN Card',
    passport: "Passport",

  };
  const idTypeOptions = {
    aadharCard: "Aadhaar Card",
    drivingLicense: "Driving Licence",
    pan: "PAN Card",
    passport: "Passport",
  };

  const [cancelReason, setCancelReason] = useState('');
  const setGuestToEditMode = (guestId) => {
    setGuestEditStates((prevStates) => ({ ...prevStates, [guestId]: true }));
  };
  const showReasonModal = () => {
    setIsReasonModalVisible(true);
  };
  const toggleAddGuests = () => {
    setShowAddGuests(!showAddGuests);
  };
  const showCancelDeleteModal = () => {
    setIsCancelDeleteModalVisible(true);
  };
  const [editedTransaction, setEditedTransaction] = useState({
    amount: "",
    date: "",
    paymentMode: "",
  });
  const [bookingDetails, setBookingDetails] = useState({});
  const [total_room_charges, settotal_room_charges] = useState(0);
  const [total_addon_charges, settotal_addon_charges] = useState(0);
  const [paid_amount, setpaid_amount] = useState(0);
  const [pending_amount, setpending_amount] = useState(0);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [editTransactionIndex, setEditTransactionIndex] = useState(null);
  const [addingTransaction, setAddingTransaction] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [isAddTaskDrawerVisible, setIsAddTaskDrawerVisible] = useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [addingGuest, setAddingGuest] = useState(false);
  const guestIndex = 0;
  const [formKey, setFormKey] = useState(Date.now());

  const isCheckInDisabled = bookingDetails.checkinStatus;
  const isCheckOutDisabled = !bookingDetails.checkinStatus || bookingDetails.checkoutStatus;
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);
  const [gstAmount, setGstAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [grossAmount, setGrossAmount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(moment(bookingDetails.checkOut));
  const minCheckoutDate = moment(bookingDetails.checkIn).add(1, 'days');
  const [currentDiscount, setCurrentDiscount] = useState(0);
  const [newDiscount, setNewDiscount] = useState(0);
  const [isEditGuestModalVisible, setIsEditGuestModalVisible] = useState(false);
  const [isEditAddonsModalVisible, setIsEditAddonsModalVisible] = useState(false);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [editingKey, setEditingKey] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [changeRoomModalVisible, setChangeRoomModalVisible] = useState(false);
  const [vacantRooms, setVacantRooms] = useState([]);
  const [roomChangeSelection, setRoomChangeSelection] = useState();


  const [dataSource, setDataSource] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const handleCancelBooking = () => {
    setIsCancelDeleteModalVisible(false);
    setIsReasonModalVisible(true);
  };

  const handleTransactionUpdate = useCallback((newTransactions) => {
    setTransactions(newTransactions);
    setRefreshKey(oldKey => oldKey + 1); // Update the key to trigger reload
  }, []);

  // useEffect(() => {
  //   if (guestDetails.customerDocs) {
  //     const idTypes = Object.keys(guestDetails.customerDocs);
  //     const firstIdType = idTypes[0];
  //     const firstIdNumber = guestDetails.customerDocs[firstIdType];
  //     setSelectedIdType(firstIdType);
  //     setIdNumber(firstIdNumber);
  //   }
  // }, [guestDetails]);

  // useEffect(() => {
  //   if (isEditGuestModalVisible && bookingDetails.customerDocs) {
  //     const idTypes = Object.keys(bookingDetails.customerDocs);
  //     const firstIdTypeKey = idTypes[0]; // Assuming there's at least one id type
  //     const firstIdTypeLabel = idTypeMapping[firstIdTypeKey]; // Transform the key to its label
  //     const firstIdNumber = bookingDetails.customerDocs[firstIdTypeKey];

  //     form.setFieldsValue({
  //       idType: firstIdTypeLabel,
  //       idNumber: firstIdNumber,
  //     });
  //   }
  // }, [isEditGuestModalVisible, bookingDetails.customerDocs, form]);



  // useEffect(() => {
  //   // const customerDocs = bookingDetails.customerDocs; // Make sure `bookingDetails` contains your API response data
  //   // if (customerDocs) {
  //   //   const idTypes = Object.keys(customerDocs);
  //   //   const defaultIdType = idTypes.length > 0 ? idTypes[0] : '';
  //   //   setSelectedIdType(defaultIdType);
  //   //   setIdNumber(customerDocs[defaultIdType]);
  //   // }
  //   console.log("Test2", bookingDetails)
  // }, [bookingDetails]);

  // // useEffect to react to changes in refreshKey
  // useEffect(() => {
  //   console.log('key')
  // }, [refreshKey]);

  useEffect(() => {
    setSelectedDate(moment(bookingDetails.checkOut));
  }, [bookingDetails.checkOut]);
  const handleCancelBookingSubmit = async () => {
    if (!cancelReason.trim()) {
      message.error("A cancellation reason is required.");
      return;
    }

    const endpoint = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/cancel?bookingId=${customerId}`;
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ reason: cancelReason }),
      });

      if (response.ok) {
        message.success("Booking cancelled successfully.");



      } else {

        const errorText = await response.text();
        message.error(`Cancellation failed: ${errorText}`);
      }
    } catch (error) {
      console.error("Error during cancellation:", error);
      message.error("An unexpected error occurred while cancelling the booking.");
    } finally {

      setIsReasonModalVisible(false);
    }
  };


  const handleConfirmDelete = async () => {


    try {
      const response = await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/delete?bookingId=${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        message.success("Booking deleted successfully.");
        setIsDeleteModalVisible(false);

        history.push("/view-bookings");
      } else {

        const errorMsg = await response.text();
        message.error(`Failed to delete booking: ${errorMsg}`);
      }
    } catch (error) {

      message.error(`Error deleting booking: ${error.toString()}`);
    }
  };

  useEffect(() => {
    console.log("Received Booking ID in BookingConfirmation:", customerId);
  }, [customerId]);



  const confirmCheckOut = async () => {
    console.log("Confirming Check Out. Booking ID:", customerId);
    const url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/checkOut?bookingId=${customerId}`;

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${authToken}`
        },
      });

      if (response.ok) {
        message.success("Checked Out Successfully!");
        setHasCheckedOut(true); // Update the state to reflect the check-out status
        // Optionally, update booking details or refresh data as needed
        // You might need to fetch booking details again or adjust the local state to reflect the new status
      } else {
        // If the server responded, but it's not a successful status code
        const errorText = await response.text();
        message.error(`Error Checking Out: ${errorText}`);
      }
    } catch (error) {
      console.error("There was a problem with the check-out operation:", error);
      message.error("Error Checking Out");
    }

    // Close the modal after attempting to check out
    hideCheckoutConfirmationModal();
  };

  useEffect(() => {
    setSelectedDate(moment(bookingDetails.checkOut));
  }, [bookingDetails.checkOut]);

  useEffect(() => {
    // Placeholder for fetching booking details logic
    console.log("Booking ID:", customerId); // Check if customerId is correctly obtained
    // Fetch booking details using customerId and authToken
  }, [customerId, authToken]);

  const handleLocalEditGuest = (index) => {
    setEditGuestIndex(index);
    setEditedGuest({ ...guestData[index] });
  };
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = `0${today.getMonth() + 1}`.slice(-2);
    const day = `0${today.getDate()}`.slice(-2);
    return `${year}-${month}-${day}`;
  };
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    date: getCurrentDate(),
    paymentMode: "",
  });

  const handleOpenExtendModal = () => {
    setExtendModalVisible(true);
  };

  const handleCloseExtendModal = () => {
    setExtendModalVisible(false);
  };
  const showAddTaskDrawer = () => {
    form.setFieldsValue({
      roomNumber: bookingDetails.roomNumber,
      // date: moment(),
    });
    setIsAddTaskDrawerVisible(true);
    setIsAddingTask(true);
  };

  const closeAddTaskDrawer = () => {
    form.resetFields();
    setIsAddTaskDrawerVisible(false);
    setIsAddingTask(false);
  };

  const handleSaveGuest = async (guestId) => {
    const guestIndex = guestDetails.findIndex((g) => g.id === guestId);
    if (guestIndex === -1) {
      console.error(`Guest with ID ${guestId} not found.`);
      return;
    }

    const guest = guestDetails[guestIndex];

    if (!guest.firstName || guest.firstName.trim() === "") {
      alert("First Name is required.");
      setIsCurrentGuestValid(false);
      return;
    }

    const guestData = {
      guestId: guest.id,
      title: guest.title,
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email,
      phoneNumber: guest.phoneNumber,
      guestDocs: {
        workID: guest.workID,
      },
      bookingId: customerId,
      age: guest.age,
    };

    try {
      const response = await fetch(
        "http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/guests/addList",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(guestData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setGuestList((currentList) => [...currentList, guestData]);

      const data = await response.json();
      console.log("Guest saved successfully:", data);
    } catch (error) {
      console.error("Error saving guest:", error);
    }
    setIsEditMode((prevMode) => ({ ...prevMode, [guestId]: false }));
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getAllTransactions?bookingId=${customerId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      console.log(response);
      setTransactions(data);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched Transactions:", data);
      setTransactions(
        data.map((tx) => ({
          ...tx,
          key: tx.transactionId,
        }))
      );
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchTransactions();
    }
  }, [customerId]);

  const onAddTask = async () => {
    console.log("Trigger task ");

    try {
      const values = await form.validateFields();
      console.log("Received values of form: ", values);

      const formattedDate = moment(values.date).format("YY/MM/DD");
      const taskData = {
        ...values,
        date: formattedDate,
        status: "Assigned",
      };

      const response = await fetch(
        "http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/task/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${authToken}`

          },
          body: JSON.stringify(taskData),
        }
      );

      if (response.status === 200) {
        // await response.json();
        console.log("Task created successfully");
        message.success("Task Created Successfully");
        closeAddTaskDrawer()
      } else {

      }

      form.resetFields();
      setIsAddTaskDrawerVisible(false);
    } catch (errorInfo) { }
  };

  const createTransaction = async (transactionDetails) => {
    try {
      const response = await fetch(
        "http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/transaction/create",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${authToken}`

          },
          body: JSON.stringify(transactionDetails),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Transaction created successfully:", data);
    } catch (error) {
      console.error("Error creating transaction:", error);
    }
  };

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await fetch(
          `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getSummary?bookingId=${customerId}`,
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
        console.log("Up New:", data); // Log the updated details
        setBookingDetails({
          customerName: data.customerName || "N/A", // Handle null values
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          checkInTime: data.checkInTime,
          checkOutTime: data.checkOutTime,
          roomNumber: data.roomNumber,
          roomType: data.roomType,
          amenities: data.amenities || "",
          total: data.total || 0.0,
          addOnTotal: data.addOnTotal || 0.0,
          paidAmt: data.paidAmt || 0.0,
          pendingAmt: data.pendingAmt || 0.0,
          addOnMap: data.addOnMap || {},
          guestList: data.guestList || [],
          country: data.country || [],
          customerDocs: {
            idType: data.customerDocsIdType,
            identificationNumber: data.passport,
          },
          ...data,
        });
        // setBookingDetails(response.data[0]);
        setFormKey(Date.now()); // Update the key to force rerender
        setHasCheckedIn(data.checkinStatus);
        setHasCheckedOut(data.checkoutStatus);
        console.log("Updated Booking Details:", bookingDetails); // Log the updated details
      } catch (error) {
        console.error("There was a problem with your fetch operation:", error);
      }
    };

    const fetchBillingDetails = async () => {
      try {
        const response = await fetch(
          `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getBill?bookingId=${customerId}`,
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

        const parsedTransactions = data.transactions.map((transaction) => {
          const [id, amount, paymentMode, date] = transaction.split(" ");
          return { id, amount, paymentMode, date };
        });

        setTransactions(parsedTransactions);
        settotal_room_charges(data.total_room_charges);
        settotal_addon_charges(data.total_addon_charges);
        setpaid_amount(data.paid_amount);
        setpending_amount(data.pending_amount);
        setGstAmount(data.gstAmount);
        setDiscount(data.discount);
        setGrossAmount(data.grossAmount);

      } catch (error) {
        console.error(
          "There was a problem with your fetch operation for billing details:",
          error
        );
      }
    };

    fetchBookingDetails();
    fetchBillingDetails();

  }, [customerId, authToken, refreshKey]);

  const today = moment();
  const canCheckIn = moment(bookingDetails.checkIn).isSameOrBefore(today, 'day') && !hasCheckedIn;
  const canCheckOut = hasCheckedIn && !hasCheckedOut && moment(bookingDetails.checkOut).isSameOrAfter(today, 'day');


  const handleCheckIn = async () => {
    console.log("Check In clicked. Booking ID:", customerId);
    const url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/checkIn?bookingId=${customerId}`;

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${authToken}`
        },
      });
      if (response.ok) {
        // Assuming response.ok means success
        message.success("Checked In Successfully!");
        setHasCheckedIn(true);

        // Update any necessary state here to reflect the check-in
      } else {
        const errorText = await response.text();
        if (errorText.includes("Check In Date Does Not Match!")) {
          message.error("Error Checking in: Check In Date Does Not Match!");
        } else {
          message.error(`${errorText}`);
        }
      }
    } catch (error) {
      console.error("Error checking in:", error);
      message.error("Error Checking In");
    }
  };

  // Simplified for clarity
  const handleCheckOut = () => {
    history.push("/settlement", {
      customerId: customerId,
      authToken: authToken
    });
  };

  const handleGetInvoice = () => {
    console.log("Get Invoice clicked. Booking ID:", customerId);


    const { checkIn, checkOut, customerName, email } = bookingDetails;


    history.push({
      pathname: "/invoice",
      state: {
        bookingId: customerId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        customerName: customerName,
        email: email
      },
    });
  };

  const handleSave = async () => {
    const dateString = selectedDate.format('YYYY-MM-DD');
    const url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/edit?bookingId=${customerId}&dateString=${dateString}`;
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        setRefreshKey(prevKey => prevKey + 1);
        setBookingUpdated(true);
        handleCloseExtendModal()
        message.success('Booking Extended Successfully!');
      } else {
        message.error('Failed to extended booking.');
      }
    } catch (error) {

      message.error('Failed to extendbooking.');
    }
    setIsEditMode(false);
  };

  const handleIncreaseDate = () => {
    setSelectedDate((prevDate) => prevDate.clone().add(1, 'days'));
  };

  const handleDecreaseDate = () => {
    if (selectedDate.isAfter(minCheckoutDate, 'day')) {
      setSelectedDate((prevDate) => prevDate.clone().subtract(1, 'days'));
    }
  };
  const handleOpenDiscountModal = () => {
    setDiscountModalVisible(true);
  };

  const handleCloseDiscountModal = () => {
    setDiscountModalVisible(false);
  };

  const handleDiscountInputChange = (e) => {
    setNewDiscount(parseFloat(e.target.value));
  };

  const handleSettlement = () => {
    history.push("/settlement", {
      customerId: customerId,
      authToken: authToken
    });
    setShowBookingDetails(true);
  };

  if (showBookingDetails) {
    console.log(customerId)
    return (
      <Settlement
        customerId={customerId}
        authToken={authToken}
      />
    );
  }


  const STATIC_ADDONS = {
    Mattress: 0,
    Breakfast: 0
  };

  // Function to render add-ons
  const renderAddOns = (addOns) => {
    return Object.keys(addOns).map((addOn) => (
      <div key={addOn}>
        <span>{addOn}</span>
        <Button onClick={() => handleDecrement(addOn)}>-</Button>
        <span>{addOns[addOn]}</span>
        <Button onClick={() => handleIncrement(addOn)}>+</Button>
      </div>
    ));
  };

  // Increment and decrement handlers
  const handleIncrement = (addOn) => {
    setAddOnQuantities(prevState => ({
      ...prevState,
      [addOn]: prevState[addOn] + 1
    }));
  };

  const handleDecrement = (addOn) => {
    setAddOnQuantities(prevState => ({
      ...prevState,
      [addOn]: Math.max(0, prevState[addOn] - 1) // Ensure quantity doesn't go below 0
    }));
  };

  // In your component

  // Extract add-ons from booking details or use static add-ons
  useEffect(() => {
    const addOnsFromBooking = bookingDetails.addOnMap && Object.keys(bookingDetails.addOnMap).length > 0
      ? bookingDetails.addOnMap
      : STATIC_ADDONS;

    setAddOnQuantities(addOnsFromBooking);
  }, [bookingDetails.addOnMap]);


  const handleActionsDropdown = (action) => {
    switch (action) {
      case 'addTask':
        showAddTaskDrawer();
        break;
      case 'extendBooking':
        handleOpenExtendModal();
        break;
      case 'addDiscount':
        handleOpenDiscountModal();
        break;

      case 'getInvoice':
        handleGetInvoice();
        break;
      case 'editGuest':
        setIsEditGuestModalVisible(true);
        break;
      case 'editAddons':
        setIsEditAddonsModalVisible(true);
        break;
      case 'deleteBooking':
        showCancelDeleteModal();
        break;
      case 'changeRoom':
        fetchVacantRooms();
        setChangeRoomModalVisible(true);
        break;

      default:
        break;
    }
  };

  const handleDeleteBooking = () => {
    setIsCancelDeleteModalVisible(false);
    setIsDeleteConfirmationVisible(true);
  };

  const actionsDropdownMenu = (
    <Menu onClick={(e) => handleActionsDropdown(e.key)}>
      <Menu.Item key="addTask" icon={<PlusOutlined />}>Add Task</Menu.Item>
      <Menu.Item key="extendBooking" icon={<CalendarOutlined />}>Extend Booking</Menu.Item>
      <Menu.Item key="editGuest" icon={<UserOutlined />}>Edit Guest</Menu.Item>
      <Menu.Item key="editAddons" icon={<ToolOutlined />}>Edit Addons</Menu.Item>
      <Menu.Item key="addDiscount" icon={<DollarOutlined />}>Edit Discount</Menu.Item>
      <Menu.Item key="getInvoice" icon={<FileDoneOutlined />}>Generate Invoice</Menu.Item>
      <Menu.Item key="changeRoom" icon={<SwapOutlined />}>Change Room</Menu.Item>
      <Menu.Item key="deleteBooking" icon={<DeleteOutlined />}>Cancel/Delete Booking</Menu.Item>
    </Menu>
  );

  const fetchVacantRooms = async () => {
    const checkInDate = bookingDetails.checkIn;
    const checkOutDate = bookingDetails.checkOut;
    const checkInTime = formatTime(bookingDetails.checkInTime); // Format check-in time
    const checkOutTime = formatTime(bookingDetails.checkOutTime); // Format check-out time
    const url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/getVacantBetween?checkInDate=${checkInDate}&checkInTime=${checkInTime}&checkOutDate=${checkOutDate}&checkOutTime=${checkOutTime}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch vacant rooms');
      const data = await response.json();
      setVacantRooms(data);
    } catch (error) {
      console.error('Error fetching vacant rooms:', error);
      // Handle error (e.g., show an error message)
    }
  };

  // Function to format time to "HH:mm" format
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };


  const handleChangeRoom = async () => {
    if (!roomChangeSelection) {
      // Optionally, show an error message if no room is selected
      return;
    }
    const url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/editRoom?bookingId=${customerId}&roomNumber=${roomChangeSelection}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to change room');

      // Handle success
      message.success('Room changed successfully.');
      setChangeRoomModalVisible(false); // Close the change room modal

      // Refresh booking confirmation details
      setRefreshKey(prevKey => prevKey + 1); // Increment refresh key to trigger data refetching
    } catch (error) {
      console.error('Error changing room:', error);
      message.error('Failed to change room.');
    }
  };

  // useEffect(() => {
  //   // Fetch booking details or other relevant data
  //   fetchBookingDetails(); // Example function to fetch data
  // }, [refreshKey]); // Include refreshKey in the dependency array


  const handleSaveDiscount = async () => {
    const url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/updateDiscount?discount=${newDiscount}&bookingId=${customerId}`;
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        setRefreshKey(prevKey => prevKey + 1);
        setBookingUpdated(true);
        handleCloseDiscountModal()
        setCurrentDiscount(data.discount);

        message.success('Discount added Successfully!');
      } else {
        message.error('Failed to add Discount.');
      }
    } catch (error) {

    }
  };

  const updateAddOns = async () => {
    const addOnsArray = Object.entries(addOnQuantities).map(([name, qty]) => ({
      name: name.charAt(0).toLowerCase() + name.slice(1),
      qty: qty
    }));
    try {
      const response = await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/addAddOns?bookingId=${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(addOnsArray),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Handle response data if needed
      console.log('Add-ons updated successfully');
      setRefreshKey(prevKey => prevKey + 1);
      // Optionally, update local state or perform other actions upon successful update
    } catch (error) {
      console.error('Error updating add-ons:', error);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      editable: true,
    },
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      key: 'customerName',
      editable: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      // Handling null values for email
      render: (text) => text || "N/A",
      editable: true,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      editable: true,
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      editable: true,
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      editable: true,
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      editable: true,
    },
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      editable: true,
      render: (text) => text.toString(),
    },
    {
      title: 'Customer Docs',
      dataIndex: 'customerDocs',
      key: 'customerDocs',
      editable: true,
      render: (docs) => JSON.stringify(docs),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button onClick={() => save(record.key)} style={{ marginRight: 8 }}>
              Save
            </Button>
            <Button onClick={cancel}>Cancel</Button>
          </span>
        ) : (
          <Button disabled={editingKey !== ''} onClick={() => edit(record)}>
            Edit
          </Button>
        );
      },
    },
  ];

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    return (
      <td {...restProps}>
        {editing && dataIndex === 'customerDocs' ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
          >
            <Input />
          </Form.Item>
        ) : editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            <Input />
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    const editableRecord = {
      ...record,
      // Assuming you need to split customerName into firstName and lastName
      firstName: record.customerName.split(" ")[0], // Get the first part as firstName
      lastName: record.customerName.split(" ")[1] || "", // Get the second part as lastName
      customerDocs: record.customerDocs ? JSON.stringify(record.customerDocs) : ''
    };
    form.setFieldsValue(editableRecord);
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();

      const [firstName, lastName] = row.customerName.split(' ');

      if (row.customerDocs) {
        try {
          row.customerDocs = JSON.parse(row.customerDocs);
        } catch (e) {
          console.error('Failed to parse customerDocs:', row.customerDocs);
          return;
        }
      }
      const payload = {
        ...row,
        firstName,
        lastName,
        phoneNumber: parseInt(row.phoneNumber, 10)
      };
      delete payload.customerName;
      const response = await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/customers/editCustomer?customerId=${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        setRefreshKey(prevKey => prevKey + 1);
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        setRefreshKey(prevKey => prevKey + 1);
        console.log('Customer edited successfully');
      }

      setEditingKey('');
    } catch (errInfo) {
      setRefreshKey(prevKey => prevKey + 1);
      console.error('Save failed:', errInfo);
    }
  };

  const handleSaveEditData = async (formValues) => {
    console.log("Form Values:", formValues); // Debugging line

    const names = formValues.customerName ? formValues.customerName.split(" ") : ['', ''];
    const firstName = names[0];
    const lastName = names[1] || "";

    // Prepare the payload
    const payload = {
      title: formValues.title,
      firstName: firstName,
      lastName: lastName,
      email: formValues.email,
      address: formValues.address,
      city: formValues.city,
      state: formValues.state,
      country: formValues.country,
      phoneNumber: formValues.phoneNumber,
      customerDocs: {
        [formValues.idType]: formValues.idNumber,
      },      age: formValues.age
    };

    console.log("Payload:", payload); // Debugging line

    try {
      // Perform the API call
      const response = await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/customers/editCustomer?customerId=1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`, // Ensure authToken is defined in your function's scope
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      console.log('Customer updated successfully');
      // Handle additional actions after successful update, like closing the modal or refreshing the page
    } catch (error) {
      console.error('Error updating customer:', error);
      // Handle errors, such as displaying a notification to the user
    }
  };
  useEffect(() => {
    // Assuming `isEditGuestModalVisible` is true when the modal is open
    // and `bookingDetails.customerDocs` contains the ID type and number
    if (isEditGuestModalVisible && bookingDetails && bookingDetails.customerDocs) {
      // Extract the first key-value pair from customerDocs as the default ID type and number
      const [firstIdTypeKey, firstIdNumber] = Object.entries(bookingDetails.customerDocs)[0];
      const firstIdTypeValue = idTypeMapping[firstIdTypeKey]; // Map the key to a human-readable value if necessary

      // Set initial form values
      form.setFieldsValue({
        idType: firstIdTypeValue, // Make sure this matches the value expected by your <Select> options
        idNumber: firstIdNumber,
      });
    }
  }, [isEditGuestModalVisible, bookingDetails, form]);

  return (
    <div>
      <div class="site-content">
        <div className="bookingContainer">
          <div className="bookingForm">
            {/* <Grid
              container
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Grid item> */}
               <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
                <Row align="middle" justify="space-between" gutter={[16, 16]}>
                  <Grid item>
                    <Typography variant="h4" style={{ fontWeight: "bold" }}>
                      {bookingDetails.guestFirstName}{" "}
                      {bookingDetails.guestLastName}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography
                      variant="subtitle2"
                      style={{ color: "grey", fontSize: "0.9rem" }}
                    >
                      Booking ID #{customerId}
                    </Typography>
                  </Grid>
                </Row>
              </Grid>
              <Grid item>
                <Typography variant="h5" style={{ color: "green" }}>
                  {(bookingDetails.cancelStatus) ? (
                    <Tag color="red">Booking Cancelled</Tag>
                  ) : (
                    <ConfirmedBookingText>Confirmed Booking!</ConfirmedBookingText>
                  )}
                </Typography>
              </Grid>
              <Grid item>
                <Dropdown overlay={actionsDropdownMenu}>
                  <Button>
                    Actions <DownOutlined />
                  </Button>
                </Dropdown>
                <div><Modal
                  title="Adjust Booking Dates"
                  visible={extendModalVisible}
                  onOk={handleSave}
                  onCancel={handleCloseExtendModal}
                  className="extend-modal"
                  width={400}
                  centered
                  footer={[
                    <Button key="back" onClick={handleCloseExtendModal} className="modal-button">Return</Button>,
                    <Button key="submit" type="primary" onClick={handleSave} className="modal-button save">Save Changes</Button>,
                  ]}
                >
                  <div className="modal-content">
                    <p className="booking-id">Booking ID #{customerId}</p>
                    <p className="date-info">Current Check-In Date: {moment(bookingDetails.checkIn).format('LL')}</p>
                    <p className="date-info">Check-Out Date: {selectedDate.format('LL')}</p>
                    <div className="date-selection">
                      <Button icon={<MinusCircleOutlined />} onClick={handleDecreaseDate} disabled={selectedDate.isSameOrBefore(minCheckoutDate)} className="date-button" />
                      <span className="selected-date">{selectedDate.format('LL')}</span>
                      <Button icon={<PlusCircleOutlined />} onClick={handleIncreaseDate} className="date-button" />
                    </div>
                  </div>
                </Modal></div>
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
                    <Space>
                      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                      <Typography.Text>Cancel or Delete Booking</Typography.Text>
                    </Space>
                  }
                  visible={isCancelDeleteModalVisible}
                  onCancel={() => setIsCancelDeleteModalVisible(false)}
                  footer={null}
                  className="cancel-delete-modal"
                  centered
                >
                  <Typography.Paragraph>Please choose an action for the booking:</Typography.Paragraph>
                  <Space size="middle" style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                      onClick={handleCancelBooking}
                      icon={<CloseOutlined />}
                      style={{ borderColor: 'green', color: 'green' }}
                    >
                      Cancel Booking
                    </Button>
                    <Button
                      onClick={handleDeleteBooking}
                      icon={<DeleteOutlined />}
                      style={{ borderColor: 'red', color: 'red' }}
                      danger
                    >
                      Delete Booking
                    </Button>
                  </Space>
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
                  title="Confirm Deletion"
                  visible={isDeleteModalVisible}
                  onOk={handleDeleteBooking} // This will trigger the deletion process
                  onCancel={() => setIsDeleteModalVisible(false)}
                  okText="Yes, Delete"
                  cancelText="Cancel"
                >
                  <p>Are you sure you want to delete this booking? This action cannot be undone.</p>
                </Modal>
                <Modal
                  title="Confirm Check Out"
                  visible={isCheckoutModalVisible}
                  onOk={confirmCheckOut}
                  onCancel={hideCheckoutConfirmationModal}
                  okText="Confirm"
                  cancelText="Cancel"
                >
                  <p>The pending amount for this booking is <strong>₹{bookingDetails.pendingAmt || '0'}</strong>.</p>
                  <p>Do you still want to proceed with the check-out?</p>
                </Modal>
                <Modal
                  title="Change Room"
                  visible={changeRoomModalVisible}
                  onOk={handleChangeRoom}
                  onCancel={() => setChangeRoomModalVisible(false)}
                >
                  <Select
                    placeholder="Select a room"
                    onChange={(value) => setRoomChangeSelection(value)}
                    value={roomChangeSelection}
                    style={{ width: '340px' }}
                  >
                    {vacantRooms.map((room) => (
                      <Select.Option key={room.room} value={room.room} style={{ width: '340px' }}>
                        <Tag color="blue">{`Room ${room.room}`}</Tag>
                        <Tag color="green">{` ${room.roomType}`}</Tag>
                        <Tag color="red">{` Floor ${room.floor}`}</Tag>
                        <Tag color="purple">{` ₹${room.costPerDay}/day`}</Tag>
                      </Select.Option>
                    ))}
                  </Select>
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
                            {Object.entries(idTypeOptions).map(([key, value]) => (
                              <Select.Option key={key} value={value}>{value}</Select.Option>
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

                <Modal
                  title="Edit Addons"
                  visible={isEditAddonsModalVisible}
                  onOk={() => {
                    updateAddOns();
                    setIsEditAddonsModalVisible(false);
                  }}
                  onCancel={() => setIsEditAddonsModalVisible(false)}
                >
                  {renderAddOns(addOnQuantities)}
                </Modal>
              </Grid>
            </Grid>
            <CustomBookingsummary bookingDetails={bookingDetails} authToken={authToken} />
            <div style={{ marginBottom: '16px', marginTop: '16px' }}>
              <AddGuest bookingId={customerId} authToken={authToken} className="full-width-guest" />
            </div>
            <AddTransaction
              bookingId={customerId}
              authToken={authToken}
              transactions={transactions}
              onTransactionsUpdated={handleTransactionUpdate}
              style={{ width: '100%', marginBottom: '16px', marginTop: '16px' }}
              className=""
            />
          </div>
          <BillingSummary
            bookingDetails={bookingDetails}
            transactions={transactions}
            total_room_charges={total_room_charges}
            total_addon_charges={total_addon_charges}
            gstAmount={gstAmount}
            discount={discount}
            grossAmount={grossAmount}
            paid_amount={paid_amount}
            pending_amount={pending_amount}
          />
        </div>
        <Drawer
          title="Add New Task"
          placement="right"
          closable={false}
          onClose={closeAddTaskDrawer}
          visible={isAddTaskDrawerVisible}
          width={300}
        >
          <Form layout="vertical" form={form}>
            <Form.Item
              name="roomNumber"
              label="Room Number"
              rules={[
                { required: true, message: "Please enter the room number" },
              ]}
            >
              <Input placeholder="Enter Room Number" disabled={isAddingTask} />
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
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select a date' }]}
            >
              <FormControl>
                <FormLabel htmlFor="date">Date</FormLabel>
                <Input
                  id="date"
                  type="date"
                  name="date"
                  placeholder="Select date"
                  onChange={(e) => form.setFieldsValue({ date: moment(e.target.value) })}
                  // You might need to handle the date value conversion properly
                  // defaultValue={moment().format("YYYY-MM-DD")} // Set to current date or use state if you need to manage the value dynamically
                  min={moment().format("YYYY-MM-DD")} // Disallow past dates
                />
              </FormControl>
            </Form.Item>

            <Form.Item
              name="priority"
              label="Priority"
              rules={[
                { required: true, message: "Please select the priority" },
              ]}
            >
              <Select placeholder="Select Priority">
                <Select.Option value="low">Low</Select.Option>
                <Select.Option value="medium">Medium</Select.Option>
                <Select.Option value="high">High</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                type="default"
                onClick={closeAddTaskDrawer}
                style={{ marginRight: 8 }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" onClick={onAddTask}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Drawer>
      </div>
      <div className="footer">
        <Button
          onClick={() => history.push("/view-bookings")}
          className="blue-button"
        >
          View Bookings
        </Button>
        <Button
          onClick={handleCheckIn}
          className="blue-button"
          disabled={!canCheckIn} // Use canCheckIn to enable/disable
        >
          Check In
        </Button>
        <Button
          onClick={handleCheckOut} // Use handleCheckOut function for Check Out
          className="blue-button"
          disabled={!canCheckOut} // Use canCheckOut to enable/disable
        >
          Check Out
        </Button>
        <Button
          onClick={handleSettlement} // Use handleSettlement function for Settlements page navigation
          className="blue-button"
        >
          Settlement
        </Button>
      </div>
    </div>
  );
}

export default BookingConfirmation; 