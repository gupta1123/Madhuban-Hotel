import React, { useState, useEffect } from 'react';
import { Modal, Button, message } from 'antd'; // Import message from antd
import moment from 'moment';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import './Extend.css';

function Extend({ open, onClose, bookingId, authToken, initialCheckInDate, initialCheckOutDate, onSuccess, onError }) {
  const [selectedDate, setSelectedDate] = useState(moment(initialCheckOutDate));
  const minCheckoutDate = moment(initialCheckInDate).add(1, 'days');

  useEffect(() => {
    setSelectedDate(moment(initialCheckOutDate));
  }, [initialCheckOutDate]);

  const handleSave = async () => {
    const dateString = selectedDate.format('YYYY-MM-DD');
    const url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/edit?bookingId=${bookingId}&dateString=${dateString}`;
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to update booking');
      onSuccess('Booking Updated Successfully!', dateString); // This function call might already handle the success message.
      message.success('Booking Extended Successfully!'); // Display success message
    } catch (error) {
      onError(error.toString());
      message.error('Failed to extend booking.'); // Optionally, display error message
    }
  };

  const handleIncreaseDate = () => {
    setSelectedDate((prevDate) => prevDate.clone().add(1, 'days'));
  };

  const handleDecreaseDate = () => {
    if (selectedDate.isAfter(minCheckoutDate, 'day')) {
      setSelectedDate((prevDate) => prevDate.clone().subtract(1, 'days'));
    }
  };

  return (
    <Modal
      title="Adjust Booking Dates"
      visible={open}
      onOk={handleSave}
      onCancel={onClose}
      className="extend-modal"
      width={400}
      centered
      footer={[
        <Button key="back" onClick={onClose} className="modal-button">Return</Button>,
        <Button key="submit" type="primary" onClick={handleSave} className="modal-button save">Save Changes</Button>,
      ]}
    >
      <div className="modal-content">
        <p className="booking-id">Booking ID #{bookingId}</p>
        <p className="date-info">Current Check-In Date: {moment(initialCheckInDate).format('LL')}</p>
        <p className="date-info">Check-Out Date: {selectedDate.format('LL')}</p>
        <div className="date-selection">
          <Button icon={<MinusCircleOutlined />} onClick={handleDecreaseDate} disabled={selectedDate.isSameOrBefore(minCheckoutDate)} className="date-button" />
          <span className="selected-date">{selectedDate.format('LL')}</span>
          <Button icon={<PlusCircleOutlined />} onClick={handleIncreaseDate} className="date-button" />
        </div>
      </div>
    </Modal>
  );
}

export default Extend;