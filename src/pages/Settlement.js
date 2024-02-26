import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Typography, Spin, Divider, Badge, Button, Modal, Tag, message, InputNumber, Select, Form, DatePicker, Icon, Descriptions } from 'antd';
import { Input } from 'antd';
import moment from "moment";

import {
  CalendarOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  DollarCircleOutlined, GlobalOutlined, UserOutlined,
  PhoneOutlined, DollarOutlined, ShoppingCartOutlined, PercentageOutlined,
  ClockCircleOutlined, MoneyCollectOutlined, QrcodeOutlined,FileTextOutlined 
} from '@ant-design/icons';
import AddTransaction from './AddTransaction'; // Adjust the import path as necessary

const { Title, Paragraph } = Typography;

const SettlementsPage = ({ authToken }) => {
  const location = useLocation();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState(false);
  const [isAddTransactionModalVisible, setIsAddTransactionModalVisible] = useState(false);
  const [foodBillAmount, setFoodBillAmount] = useState(0); // New state for food bill amount
  const { customerId } = location.state || {};
  const [isCombinePaymentModalVisible, setIsCombinePaymentModalVisible] = useState(false);
  const [allBookings, setAllBookings] = useState([]);
  const [selectedBookingsForPayment, setSelectedBookingsForPayment] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().substring(0, 10)); // Format YYYY-MM-DD
  const [paymentMode, setPaymentMode] = useState('Online');
  const [combinedBill, setCombinedBill] = useState(null);
  const [isPaymentConfirmationModalVisible, setIsPaymentConfirmationModalVisible] = useState(false);

  // Function to fetch booking data
  const fetchBookingData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getSummary?bookingId=${customerId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch booking data');
      }
      const data = await response.json();
      setBookingData(data);
    } catch (error) {
      console.error('Error fetching booking data:', error);
      message.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleGenerateInvoiceClick = () => {
        history.push('/invoice', {
          authToken: authToken,
          bookingId: bookingData.bookingId,
          customerName: bookingData.customerName,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          phoneNumber: bookingData.phoneNumber,
          email: bookingData.email, 
          address: bookingData.address, 
          roomTotal: bookingData.roomTotal,
          addOnTotal: bookingData.addOnTotal,
          gstAmount: bookingData.gstAmount,
          grossTotal: bookingData.grossTotal,
          pendingAmt: bookingData.pendingAmt,
    
        });
      };
  useEffect(() => {
    fetchBookingData();
  }, [customerId, authToken]);

  const handleMakePaymentClick = () => {
    setIsAddTransactionModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const showCheckoutModal = () => {
    setIsCheckoutModalVisible(true);
  };

  const handleCheckoutCancel = () => {
    setIsCheckoutModalVisible(false);
  };

  const handleCheckoutConfirm = async () => {
    setIsCheckoutModalVisible(false);
    try {
      const response = await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/checkOut?bookingId=${bookingData.bookingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Checkout failed');
      }
      message.success("Checked Out Successfully");
      fetchBookingData(); // Refresh data after checkout
    } catch (error) {
      message.error(`Error: ${error.message}`);
    }
  };

  const handleFoodBillSave = async () => {
    // Assuming bookingId and foodBillAmount are correctly set
    const bookingId = bookingData?.bookingId;
    const foodAmount = foodBillAmount;
    const isGroup = false; // Adjust this based on your actual logic
  
    if (!bookingId || foodAmount <= 0) {
      message.error("Invalid booking ID or food bill amount");
      return;
    }
  
    try {
      const response = await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/addFoodAmount?bookingId=${bookingId}&foodAmount=${foodAmount}&isGroup=${isGroup}`, {
        method: 'PUT', // Make sure this matches your API requirement
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to add food bill amount');
      }
  
      // Check the content type of the response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        // If response is JSON, parse it as JSON
        const result = await response.json();
        console.log(result); // Handle the JSON response here
      } else {
        // If response is not JSON, read it as text
        const textResult = await response.text();
        console.log(textResult); // Handle the text response here
      }
  
      message.success("Food bill amount added successfully");
  
      // Refresh booking data and close the modal
      fetchBookingData();
      setIsModalVisible(false);
  
    } catch (error) {
      console.error('Error adding food bill amount:', error);
      message.error(`Error: ${error.message}`);
    }
  };
  
  
  

  const onTransactionsUpdated = () => {
    setIsAddTransactionModalVisible(false);
    fetchBookingData(); // Refresh data when transactions are updated
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
  }

  if (!bookingData) {
    return <div>Error: Unable to fetch booking data</div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Due in":
        return "gold";
      case "Occupied":
        return "volcano";
      case "Due Out":
        return "cyan";
      case "Reserved":
        return "blue";
      case "Checked out":
        return "green";
      default:
        return "gray";
    }
  };

  let bookingStatus = "Unknown";
  let numberOfNights = 0;
  if (bookingData) {
    const currentDate = new Date();
    const checkinDate = new Date(bookingData.checkIn);
    const checkoutDate = new Date(bookingData.checkOut);
    numberOfNights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));

    if (currentDate < checkinDate) {
      bookingStatus = "Due in";
    } else if (currentDate >= checkinDate && currentDate < checkoutDate) {
      bookingStatus = "Occupied";
    } else if (currentDate >= checkoutDate) {
      bookingStatus = "Due Out";
    }
    if (bookingData.checkinStatus && bookingData.checkoutStatus) {
      bookingStatus = "Checked out";
    } else if (!bookingData.checkinStatus && !bookingData.checkoutStatus) {
      bookingStatus = "Reserved";
    }
  }

  const handleCombinePaymentClick = async () => {
    setIsCombinePaymentModalVisible(true);
    try {
      const response = await fetch('http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getAll', {
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setAllBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      message.error(`Error: ${error.message}`);
    }
  };

  const handleCombinePaymentProceed = async () => {
    try {
      const response = await fetch('http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getCombineBill', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingList: selectedBookingsForPayment }),
      });
      if (!response.ok) {
        throw new Error('Failed to get combined bill');
      }
      const data = await response.json();
      setCombinedBill(data); // Update the combinedBill state with the fetched data
      setIsCombinePaymentModalVisible(false); // Close the combine payments modal
      setIsPaymentConfirmationModalVisible(true); // Open the payment confirmation modal
    } catch (error) {
      console.error('Error fetching combined bill:', error);
      message.error(`Error: ${error.message}`);
    }
  };



  const handleConfirmPayment = async () => {
    try {
      const response = await fetch('http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/payCombineBill', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingIdList: selectedBookingsForPayment,
          amountPaid: paymentAmount,
          transactionDto: {
            paymentMode: paymentMode,
            date: paymentDate,
          },
        }),
      });
      if (!response.ok) {
        throw new Error('Payment failed');
      }

      // Use response.text() for plain text responses
      const messageText = await response.text();
      setIsPaymentConfirmationModalVisible(false); // Close the payment confirmation modal
      message.success(messageText); // Display the actual response message as a success message
    } catch (error) {
      console.error('Error confirming payment:', error);
      message.error(`Error: ${error.message}`);
    }
  };


  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
      <Badge.Ribbon text="Settlement" color="volcano">
        <Card bordered={false} style={{ textAlign: 'center' }}>
          <Title level={3}>Booking ID #{bookingData.bookingId}</Title>
          <Tag color={getStatusColor(bookingStatus)} style={{ marginBottom: '20px' }}>
            <CheckCircleOutlined /> {bookingStatus}
          </Tag>
          <Divider dashed />
          <Paragraph><strong>Customer:</strong> {bookingData.customerName}</Paragraph>
          <Paragraph><PhoneOutlined /> <strong>Customer Phone:</strong> {bookingData.phoneNumber}</Paragraph>
          <Paragraph><ClockCircleOutlined /> <strong>Number of Nights:</strong> {numberOfNights}</Paragraph>
          <Divider />
          <div style={{ backgroundColor: '#f0f2f5', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <Title level={4}>Payment Summary</Title>
            <Paragraph><CreditCardOutlined /> <strong>Room Tariff:</strong> ₹{bookingData.roomTotal}</Paragraph>
            <Paragraph><DollarCircleOutlined /> <strong>Add-ons:</strong> ₹{bookingData.addOnTotal}</Paragraph>
            <Paragraph><DollarCircleOutlined /> <strong>Food Bill:</strong> ₹{bookingData.foodAmount}</Paragraph>
            <Paragraph><DollarCircleOutlined /> <strong>Total GST :</strong> ₹{bookingData.gstAmount}</Paragraph>
            <Paragraph><DollarCircleOutlined /> <strong>Gross Total:</strong> ₹{bookingData.grossTotal}</Paragraph>
            <Paragraph><DollarCircleOutlined /> <strong>Pending Amount:</strong> ₹{bookingData.pendingAmt}</Paragraph>
            <Button type="primary" onClick={handleMakePaymentClick} style={{ marginRight: '10px' }} icon={<CreditCardOutlined />}>Make Payment</Button>
            <Button danger icon={<CalendarOutlined />} onClick={showCheckoutModal} disabled={!bookingData.checkinStatus || bookingStatus === "Checked out"}>Check Out</Button>
            <Button onClick={() => setIsModalVisible(true)}>Add Food Bill</Button>
            <Button onClick={handleCombinePaymentClick}>Pay   for Multiple Bookings</Button>
            <Button type="primary" onClick={handleGenerateInvoiceClick} icon={<FileTextOutlined />} style={{ marginLeft: '10px' }}>Generate Invoice</Button>


          </div>
        </Card>
      </Badge.Ribbon>

      <Modal title="Payment" visible={isModalVisible} onOk={handleFoodBillSave} onCancel={handleCancel}>
        <p>Enter Food Bill Amount:</p>
        <InputNumber
          style={{ width: '100%' }}
          defaultValue={foodBillAmount}
          onChange={(value) => setFoodBillAmount(value)}
          min={0}
        />
      </Modal>
      <Modal
        title="Combine Payments"
        visible={isCombinePaymentModalVisible}
        onCancel={() => setIsCombinePaymentModalVisible(false)}
        onOk={handleCombinePaymentProceed}
      >
        {/* Dropdown component here */}
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="Select bookings"
          optionLabelProp="label"
          onChange={(value) => setSelectedBookingsForPayment(value)}
        >
          {allBookings
            .filter(booking => booking.groupId === null) // Filter bookings with no groupId
            .map((booking) => (
<Select.Option
      key={booking.bookingId}
      value={booking.bookingId}
      label={(
        <div>
          <p style={{ margin: 0 }}>
            <span style={{ fontWeight: 'bold' }}>Booking ID:</span> {booking.bookingId} 
            <span style={{ margin: '0 8px', color: '#999' }}>|</span>
            <UserOutlined style={{ marginRight: '5px' }} />
            <span>{booking.customerName}</span> 
            <span style={{ margin: '0 8px', color: '#999' }}>|</span>
            <PhoneOutlined style={{ marginRight: '5px' }} />
            <span>{booking.phoneNumber}</span>
          </p>
        </div>
      )}
    >
      <div>
        <p style={{ margin: 0 }}>
          <span style={{ fontWeight: 'bold' }}>Booking ID:</span> {booking.bookingId} 
          <span style={{ margin: '0 8px', color: '#999' }}>|</span>
          <UserOutlined style={{ marginRight: '5px' }} />
          <span>{booking.customerName}</span> 
          <span style={{ margin: '0 8px', color: '#999' }}>|</span>
          <PhoneOutlined style={{ marginRight: '5px' }} />
          <span>{booking.phoneNumber}</span>
        </p>
      </div>
    </Select.Option>
            ))}
        </Select>



      </Modal>
      <Modal
        title="Confirm Payment"
        visible={isPaymentConfirmationModalVisible}
        onCancel={() => setIsPaymentConfirmationModalVisible(false)}
        footer={null} // Remove default buttons
      >
        {combinedBill && (
          <>
            <Card title="Billing Summary" bordered={false} style={{ marginTop: '20px', backgroundColor: '#f0f2f5' }}>
              <p><DollarOutlined style={{ marginRight: '5px' }} /> <span style={{ fontWeight: 'bold' }}>Total Room:</span> <span style={{ textAlign: 'right' }}>{combinedBill.totalRoom}</span></p>
              <p><ShoppingCartOutlined style={{ marginRight: '5px' }} /> <span style={{ fontWeight: 'bold' }}>Add-On:</span> <span style={{ textAlign: 'right' }}>{combinedBill.addOn}</span></p>
              <p><MoneyCollectOutlined style={{ marginRight: '5px' }} /> <span style={{ fontWeight: 'bold' }}>Paid:</span> <span style={{ textAlign: 'right' }}>{combinedBill.paid}</span></p>
              <p><DollarOutlined style={{ marginRight: '5px' }} /> <span style={{ fontWeight: 'bold' }}>Gross:</span> <span style={{ textAlign: 'right' }}>{combinedBill.gross}</span></p>
              <p><DollarOutlined style={{ marginRight: '5px' }} /> <span style={{ fontWeight: 'bold' }}>Pending:</span> <span style={{ textAlign: 'right' }}>{combinedBill.pending}</span></p>
              <p><PercentageOutlined style={{ marginRight: '5px' }} /> <span style={{ fontWeight: 'bold' }}>GST:</span> <span style={{ textAlign: 'right' }}>{combinedBill.gst}</span></p>
              <p><PercentageOutlined style={{ marginRight: '5px' }} /> <span style={{ fontWeight: 'bold' }}>Discount:</span> <span style={{ textAlign: 'right' }}>{combinedBill.discount}</span></p>
              <p><DollarOutlined style={{ marginRight: '5px' }} /> <span style={{ fontWeight: 'bold' }}>Food Amount:</span> <span style={{ textAlign: 'right' }}>{combinedBill.foodAmount}</span></p>
            </Card>

            {/* Payment Fields */}
            <Form layout="vertical">
              <Form.Item label="Amount Paid" required tooltip="This is the total amount to be paid.">
                <InputNumber
                  style={{ width: '100%' }}
                  value={paymentAmount}
                  onChange={setPaymentAmount}
                  min={0}
                  formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/₹\s?|(,*)/g, '')}
                  autoFocus
                />
              </Form.Item>
              <Form.Item label="Payment Date">
                <DatePicker
                  style={{ width: '100%' }}
                  value={moment(paymentDate)}
                  onChange={(date, dateString) => setPaymentDate(dateString)}
                />
              </Form.Item>
              <Form.Item label="Payment Mode">
                <Select value={paymentMode} onChange={setPaymentMode} style={{ width: '100%' }}>
                  <Select.Option value="Online"><GlobalOutlined /> Online</Select.Option>
                  <Select.Option value="Cash"><MoneyCollectOutlined /> Cash</Select.Option>
                  <Select.Option value="Credit Card"><CreditCardOutlined /> Credit Card</Select.Option>
                  <Select.Option value="UPI"><QrcodeOutlined /> UPI</Select.Option>
                </Select>

              </Form.Item>
            </Form>

            {/* Confirm Payment Button */}
            <Button
              type="primary"
              onClick={handleConfirmPayment}
              style={{ marginTop: '10px' }}
            >
              Confirm Payment for Multiple Bookings
            </Button>
          </>
        )}
      </Modal>
      <Modal
        title="Confirm Checkout"
        visible={isCheckoutModalVisible}
        onOk={handleCheckoutConfirm}
        onCancel={handleCheckoutCancel}
        okText="Yes, Check Out"
        cancelText="Cancel"
      >
        <p>Your pending amount is ₹{bookingData.pendingAmt}. Would you still like to check out?</p>
      </Modal>

      <Modal
        title="Make Payment"
        visible={isAddTransactionModalVisible}
        onCancel={onTransactionsUpdated}
        footer={null}
      >
        <AddTransaction
          bookingId={bookingData.bookingId}
          authToken={authToken}
          onTransactionsUpdated={onTransactionsUpdated}
        />
      </Modal>
    </div>
  );
};

export default SettlementsPage;
