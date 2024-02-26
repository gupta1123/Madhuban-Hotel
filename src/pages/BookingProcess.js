import React, { useState, useEffect } from "react";
import Bookings from "./Bookings";
import BookingDetails from "./BookingDetails";

function BookingProcess() {
  const [bookingData, setBookingData] = useState({
    adults: 1,
    children: 0,
    checkIn: null,
    checkOut: null,
    selectedRoomType: "All",
    roomTypeFilter: [],
    apiData: [],
    tableData: [],
  });

  const handleBookingDataChange = (updatedData) => {
    setBookingData((prevData) => ({ ...prevData, ...updatedData }));
  };

  const handleShowBookingDetails = (show) => {
    setBookingData((prevData) => ({ ...prevData, showBookingDetails: show }));
  };

  return (
    <div>
      {bookingData.showBookingDetails ? (
        <BookingDetails
          bookingData={bookingData}
          onBackClick={() => handleShowBookingDetails(false)}
        />
      ) : (
        <Bookings
          bookingData={bookingData}
          onBookingDataChange={handleBookingDataChange}
          onProceedClick={() => handleShowBookingDetails(true)}
        />
      )}
    </div>
  );
}

export default BookingProcess;
