import React, { useState, useEffect } from "react";
import "./Payment.css";
import BookingConfirmation from "./BookingConfirmation";
import { Tooltip, Button } from "antd";
import AddTransaction from "../pages/AddTransaction";
import BillingSummary from "./BillingSummary";
import AddGuest from "../pages/AddGuest";

import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  EditIcon,
} from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";

function Payment({ onBackClick, selectedRoom, authToken }) {
  console.log(authToken)
  const history = useHistory();
  const location = useLocation();
  const { customerId, bookingSummary } = location.state || {};
  console.log("Auth Token in Payment:", authToken); // Check authToken here

  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [addingGuest, setAddingGuest] = useState(false);
  const [guestData, setGuestData] = useState([]);
  const [lastSavedGuest, setLastSavedGuest] = useState({});
  const today = new Date().toISOString().split("T")[0];
  const [bookingSummaryData, setBookingSummaryData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalRoomCharges, setTotalRoomCharges] = useState(0);
  const [totalAddonCharges, setTotalAddonCharges] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [roomDetails, setRoomDetails] = useState(selectedRoom || {});
  const [bookingDetails, setBookingDetails] = useState({});
  const [gstAmount, setGstAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [grossAmount, setGrossAmount] = useState(0);
  const [total_room_charges, settotal_room_charges] = useState(0);
  const [total_addon_charges, settotal_addon_charges] = useState(0);
  const [paid_amount, setpaid_amount] = useState(0);
  const [pending_amount, setpending_amount] = useState(0);
  const [bookingCostDetails, setBookingCostDetails] = useState(
    bookingSummary || {}
  );

  const [newGuest, setNewGuest] = useState({
    "Payment Amount": "",
    Date: today,
    "Payment Mode": "Online",
  });

  const [editGuestIndex, setEditGuestIndex] = useState(null);
  const [editedGuest, setEditedGuest] = useState({});
  const [totalPayments, setTotalPayments] = useState(0);

  const getTotalPayments = () => {
    return guestData.reduce((total, guest) => {
      return total + parseFloat(guest["Payment Amount"] || 0);
    }, 0);
  };

  // useEffect(() => {
  //   console.log("Auth Token received in Frontdesk:", props.authToken);
  // }, [props.authToken]);

  useEffect(() => {
    if (location.state) {
      setRoomDetails(selectedRoom);
      setBookingCostDetails(bookingSummary || {});
    }
  }, [location.state, selectedRoom]);

  useEffect(() => {
    console.log(location.state); // Log the entire state object
    console.log(location.state?.authToken); // Access authToken safely
  }, [location]);

  useEffect(() => {
    console.log("Received Booking ID:", customerId);
  }, [customerId]);

  useEffect(() => {
    setTotalPayments(getTotalPayments());
  }, [guestData]);

  const handleEditGuest = (index) => {
    setEditGuestIndex(index);
    setEditedGuest({ ...guestData[index] });
  };

  const handleSaveEditGuest = (editedGuest, index) => {
    console.log("Saving Edited Guest Details:", editedGuest);

    const updatedGuests = [...guestData];
    updatedGuests[index] = editedGuest;
    setGuestData(updatedGuests);
    setEditGuestIndex(null);
    setLastSavedGuest(editedGuest);
  };

  const handleCancelEditGuest = () => {
    setEditGuestIndex(null);
  };

  const handleEditInputChange = (e) => {
    setEditedGuest({ ...editedGuest, [e.target.name]: e.target.value });
  };

  const handleAddGuest = () => {
    setAddingGuest(true);
  };

  const handleInputChange = (e) => {
    setNewGuest({ ...newGuest, [e.target.name]: e.target.value });
  };

  const handleSaveGuest = () => {
    setGuestData([...guestData, newGuest]);
    setNewGuest({
      "Payment Amount": "",
      Date: "",
      "Payment Mode": "",
    });
    setAddingGuest(false);
  };

  const handleProceedClick = () => {
    history.push("/bookingConfirmation", {
      bookingDetails: bookingDetails,
      guestData: guestData,
      customerId: customerId,
      authToken: location.state?.authToken
    });

    setShowBookingDetails(true);
  };
  const handleBackClick = () => {
   
    history.push({
      pathname: "/bookingdetails",
      state: {
   
        selectedRoom: selectedRoom,
       
        authToken: location.state?.authToken,
      },
    });
  };
  const editTransaction = async (transactionId, transactionData) => {
    try {
      const response = await fetch(
        `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/transaction/edit?bookingId=${transactionData.bookingId}&transactionId=${transactionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(transactionData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Transaction edited successfully:", data);
    } catch (error) {
      console.error("Error editing transaction:", error);
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

  useEffect(() => {
    const fetchBookingSummary = async () => {
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
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Received Booking Summary Data:", data); // Add this line
        setBookingSummaryData(data);

        setBookingDetails({
          customerName: data.customerName || "N/A",
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
          discount: data.discount,
          roomTotal: data.roomTotal,
          netTotal: data.netTotal,
          gstAmount: data.gstAmount,
          grossTotal: data.grossTotal,
          customerDetails: {
            title: data.title,
            email: data.email,
            address: data.address,
            city: data.city,
            state: data.state,
            country: data.country,
            phoneNumber: data.phoneNumber,
            customerDocs: data.customerDocs,
            age: data.age,
          }
        });
      } catch (error) {
        console.error("Error fetching booking summary:", error);
      }
    };

    if (customerId) {
      fetchBookingSummary();
      fetchBillingDetails();

    }
  }, [customerId]);




  const handleDeleteGuest = (index) => {
    const updatedGuests = guestData.filter((_, i) => i !== index);
    setGuestData(updatedGuests);
  };

  if (showBookingDetails) {
    return (
      <BookingConfirmation
        bookingDetails={bookingDetails}
        guestData={guestData}
        customerId={customerId}
        onBackClick={handleBackClick}
        handleAddGuest={handleAddGuest}
        handleEditGuest={handleEditGuest}
        handleSaveEditGuest={handleSaveEditGuest}
        handleCancelEditGuest={handleCancelEditGuest}
        setGuestData={setGuestData}
        addingGuest={addingGuest}
        selectedRoom={selectedRoom}
        setAddingGuest={setAddingGuest}
      />
    );
  }

  return (
    <>
      <div className="container">
        <div className="left-section">
          <div className="payment-information">

            <AddTransaction bookingId={customerId} authToken={authToken} 
              style={{ width: '100%', marginBottom: '16px', marginTop: '16px' }}
            />
            <AddGuest bookingId={customerId} authToken={authToken}               style={{ width: '100%', marginBottom: '16px', marginTop: '16px' }}
 />


          </div>
        </div>
        <div className="right-section">
          {bookingSummaryData ? (
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
          ) : (
            <div>Loading Billing Summary...</div>
          )}
        </div>
      </div>
      <div
        style={{ display: "flex", justifyContent: "center" }}
        className="footer-buttons"
      >

        <button className="proceed-button" onClick={handleProceedClick}>
          Confirm Booking
        </button>
      </div>
    </>
  );
}

export default Payment;