import React, { createContext, useContext, useState } from "react";
import  {  useEffect } from "react";

const BookingContext = createContext({
  bookingData: {
    checkInDate: null,
    checkOutDate: null,
    adults: 1,
    children: 0,
  },
  setBookingData: () => {},
  bookingConfirmationData: null,
  setBookingConfirmationData: () => {},
});

export const useBookingContext = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
    checkInDate: null,
    checkOutDate: null,
    adults: 1,
    children: 0,
    // Initialize other fields as needed
  });

  const [bookingConfirmationData, setBookingConfirmationData] = useState(null);

  const providerValue = {
    bookingData,
    setBookingData,
    bookingConfirmationData,
    setBookingConfirmationData,
  };

  return (
    <BookingContext.Provider value={providerValue}>
      {children}
    </BookingContext.Provider>
  );
};

export default BookingContext;