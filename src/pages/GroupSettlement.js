import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Row, Col,Typography,Tooltip, Spin, Divider, Badge, Button, Modal, Tag, message, InputNumber, Checkbox } from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  DollarCircleOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import GroupAddTransactions from './GroupAddTransactions';
import { useHistory } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const GroupSettlement = ({ authToken }) => {
  const location = useLocation();

  const [bookingData, setBookingData] = useState(null);
  const groupId = location?.state?.groupId;
  console.log(groupId)
  const [groupData, setGroupData] = useState(null);


  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState(false);
  const [isAddTransactionModalVisible, setIsAddTransactionModalVisible] = useState(false);
  const [foodBillAmount, setFoodBillAmount] = useState(0);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [confirmCheckoutVisible, setConfirmCheckoutVisible] = useState(false);
  const [checkoutSuccessMessage, setCheckoutSuccessMessage] = useState('');
  const [checkoutErrorMessage, setCheckoutErrorMessage] = useState('');
  const history = useHistory();
  const handleRoomSelect = (roomId) => {
    setSelectedRooms(prevSelectedRooms =>
      prevSelectedRooms.includes(roomId) ? prevSelectedRooms.filter(id => id !== roomId) : [...prevSelectedRooms, roomId]
    );
  };



  const handleBulkCheckout = () => {

    setConfirmCheckoutVisible(true);
  };
  const confirmBulkCheckout = async () => {
    try {

    } catch (error) {

    } finally {

      setConfirmCheckoutVisible(false);
    }
  };

  const navigateToInvoice = () => {
    const invoiceState = {
      groupId: groupId,
      customerId: location.state.customerId,
      name: groupData[0].customerName,
      phone: groupData[0].phoneNumber,
      email: groupData[0].email,
      address: groupData[0].address,
      // Payment Summary details
      roomTotal: totalRoomTotal, // Total room tariff
      addOnTotal: totalAddOnTotal, // Total add-ons
      gstAmount: totalGstAmount, // Total GST
      grossTotal: totalGrossTotal, // Total Gross Amount
      pendingAmt: totalPendingAmt, // Total Pending Amount
    };

    history.push('/Groupinvoice', invoiceState);
  };



  useEffect(() => {
    fetchGroupData();
  }, []);

  const fetchGroupData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getGroupSummary?groupId=${groupId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch group data');
      }
      const data = await response.json();
      setGroupData(data);
    } catch (error) {
      console.error('Error fetching group data:', error);
      message.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMakePaymentClick = () => {
    setIsAddTransactionModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const showCheckoutModal = (roomId = null) => {
    setIsCheckoutModalVisible(true);

    if (roomId !== null) {
      setSelectedRooms([roomId]);
    }
  };

  const handleTransactionsUpdated = () => {

    setTransactionsUpdated(true);

  };


  const handleCheckoutCancel = () => {
    setIsCheckoutModalVisible(false);
  };
  const calculateTotalPendingAmount = () => {
    return groupData
      .filter(room => selectedRooms.includes(room.bookingId))
      .reduce((acc, room) => acc + room.pendingAmt, 0);
  };

  const handleCheckoutConfirm = async () => {

    const payload = {
      bookingList: selectedRooms,
    };

    try {
      const response = await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/checkOutForGroup?groupId=${groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to perform bulk checkout');
      }


      message.success('Checkout successful');


      await fetchGroupData();


      setIsCheckoutModalVisible(false);


      setSelectedRooms([]);
    } catch (error) {
      console.error('Error during checkout:', error);
      message.error(`Checkout failed: ${error.message}`);

    }
  };


  const handleFoodBillSave = async () => {
    // Ensure we're working with group context. You might need to adjust this part.
    // For demonstration, I'm using a fixed bookingId as per your previous example.
    // In a real scenario, you might need to dynamically determine the group's representative bookingId or use a groupId.
    const bookingId = 11; // Assuming this ID represents the whole group in your backend logic
    const foodAmount = foodBillAmount;
    const isGroup = true; // Explicitly indicating this is a group operation

    if (!bookingId || foodAmount <= 0) {
      message.error("Invalid booking ID or food bill amount");
      return;
    }

    try {
      const response = await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/addFoodAmount?bookingId=${groupId}&foodAmount=${foodAmount}&isGroup=${isGroup}`, {
        method: 'PUT', // Confirm the correct HTTP method with your backend
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
        console.log(result); // Optionally handle the JSON response
      } else {
        // If response is not JSON, read it as text
        const textResult = await response.text();
        console.log(textResult); // Optionally handle the text response
      }

      message.success("Food bill amount added successfully for the group");

      // Refresh group data to reflect the updated food bill
      fetchGroupData();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error adding food bill amount for the group:', error);
      message.error(`Error: ${error.message}`);
    }
  };



  const onTransactionsUpdated = () => {
    setIsAddTransactionModalVisible(false);
    fetchGroupData();
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
  }

  if (!groupData) {
    return <div>Error: Unable to fetch group data</div>;
  }


  const computeBookingStatus = (booking) => {
    const currentDate = new Date();
    const checkinDate = new Date(booking.checkIn);
    const checkoutDate = new Date(booking.checkOut);
    let status = "Unknown";

    if (currentDate < checkinDate) {
      status = "Due in";
    } else if (currentDate >= checkinDate && currentDate < checkoutDate) {
      status = "Occupied";
    } else if (currentDate >= checkoutDate) {
      status = "Due Out";
    }

    if (booking.checkinStatus && booking.checkoutStatus) {
      status = "Checked out";
    } else if (!booking.checkinStatus && !booking.checkoutStatus) {
      status = "Reserved";
    }

    return status;
  };
  const isCheckoutEnabled = groupData.some(room => {
    const status = computeBookingStatus(room);
    return status === 'Due Out' || status === 'Occupied';
  });

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
  const handleGenerateInvoice = () => {

    console.log('Generating invoice...');

  };
  const bulkActionButtons = (
    <div style={{ marginBottom: '20px' }}>
      <Button type="primary" onClick={handleBulkCheckout} style={{ marginRight: '10px' }}>
        Bulk Checkout
      </Button>
      <Button onClick={() => setSelectedRooms(groupData.map(room => room.bookingId))} style={{ marginRight: '10px' }}>
        Select All
      </Button>
      <Button onClick={() => setSelectedRooms([])}>
        Deselect All
      </Button>
    </div>
  );

  const totalRoomTotal = groupData.reduce((acc, curr) => acc + curr.roomTotal, 0);
  const totalAddOnTotal = groupData.reduce((acc, curr) => acc + curr.addOnTotal, 0);
  const totalGstAmount = groupData.reduce((acc, curr) => acc + curr.gstAmount, 0);
  const totalGrossTotal = groupData.reduce((acc, curr) => acc + curr.grossTotal, 0);
  const totalPendingAmt = groupData.reduce((acc, curr) => acc + curr.pendingAmt, 0);
  const totalfoodAmt = groupData.reduce((acc, curr) => acc + curr.foodAmount, 0);

  
  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px' }}>
      <Badge.Ribbon text="Settlement" color="volcano">
        <Card bordered={false} style={{ textAlign: 'center' }}>
          <Title level={3}>Group Summary</Title>
          <Divider dashed />
          <Paragraph><strong>Customer:</strong> {groupData[0].customerName}</Paragraph>
          <Paragraph><PhoneOutlined /> <strong>Customer Phone:</strong> {groupData[0].phoneNumber}</Paragraph>
          <Divider />
          <div style={{ backgroundColor: '#f0f2f5', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <Title level={4}>Room Details</Title>
            <Row gutter={[16, 16]}>
              {groupData.map((booking, index) => (
                <Col span={8} key={index}>
                  <Card
                    title={`Room ${booking.roomNumber} - ${booking.roomType}`}
                    bordered={false}
                  >

                    <div>
                      <CalendarOutlined /><span> Check-in: {new Date(booking.checkIn).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <CalendarOutlined /><span> Check-out: {new Date(booking.checkOut).toLocaleDateString()}</span>
                    </div>

                    <Tooltip title="Status">
                      <Tag color={getStatusColor(computeBookingStatus(booking))}>
                        <ClockCircleOutlined /> {computeBookingStatus(booking)}
                      </Tag>
                    </Tooltip>
                  </Card>
                </Col>
              ))}

            </Row>

            <Divider />
            <Title level={4}>Payment Summary</Title>
            <Paragraph><CreditCardOutlined /> <strong>Total Room Tariff:</strong> ₹{totalRoomTotal}</Paragraph>
            <Paragraph><DollarCircleOutlined /> <strong>Total Add-ons:</strong> ₹{totalAddOnTotal}</Paragraph>
            <Paragraph><DollarCircleOutlined /> <strong>Total Food Amount:</strong> ₹{totalfoodAmt}</Paragraph>            
            <Paragraph><DollarCircleOutlined /> <strong>Total GST:</strong> ₹{totalGstAmount}</Paragraph>
            <Paragraph><DollarCircleOutlined /> <strong>Total Gross Total:</strong> ₹{totalGrossTotal}</Paragraph>
            <Paragraph><DollarCircleOutlined /> <strong>Total Pending Amount:</strong> ₹{totalPendingAmt}</Paragraph>

            
            <Button
              type="primary"
              onClick={() => showCheckoutModal()}
              disabled={!isCheckoutEnabled}
              style={{ marginRight: '10px' }}
              icon={<CalendarOutlined />}
            >
              Check Out
            </Button>


            <Button type="primary" onClick={handleMakePaymentClick} style={{ marginRight: '10px' }} icon={<CreditCardOutlined />}>Make Payment</Button>
            <Button onClick={() => setIsModalVisible(true)}>Add Food Bill</Button>
            <Button type="primary" onClick={navigateToInvoice} style={{ marginRight: '10px' }}>Generate Invoice</Button>

          </div>
        </Card>
      </Badge.Ribbon>


      <Modal
        title="Checkout Rooms"
        visible={isCheckoutModalVisible}
        onOk={handleCheckoutConfirm}
        onCancel={() => setIsCheckoutModalVisible(false)}
        okText="Confirm Checkout"
        cancelText="Cancel"
        footer={[
          <Button key="back" onClick={() => setIsCheckoutModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleCheckoutConfirm}
            disabled={selectedRooms.length === 0} // Disable if no rooms are selected
          >
            Confirm Checkout
          </Button>,
        ]}
      >
        <Checkbox
          indeterminate={selectedRooms.length > 0 && selectedRooms.length < groupData.length}
          onChange={e => setSelectedRooms(e.target.checked ? groupData.map(room => room.bookingId) : [])}
          checked={selectedRooms.length === groupData.length}
        >
          Select All
        </Checkbox>
        <Divider />
        {groupData.map((room) => (
          <div key={room.bookingId}>
            <Checkbox
              checked={selectedRooms.includes(room.bookingId)}
              onChange={() => handleRoomSelect(room.bookingId)}
              disabled={computeBookingStatus(room) !== 'Due Out' && computeBookingStatus(room) !== 'Occupied'}
            >
              Room {room.roomNumber} - {room.roomType} (Booking ID: {room.bookingId}) - Status: {computeBookingStatus(room)}
            </Checkbox>
          </div>
        ))}
      </Modal>



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
        title="Make Payments"
        visible={isAddTransactionModalVisible}
        onCancel={onTransactionsUpdated}
        footer={null}
        style={{ width: "600px" }}
      >
        <div>
          <p>Total Pending Amount: ₹{totalPendingAmt}</p>
          <GroupAddTransactions
            groupId={groupId}
            authToken={authToken}
            onTransactionsUpdated={handleTransactionsUpdated}
            totalPendingAmount={totalPendingAmt} // Pass the pending amount as a prop
          />
        </div>
      </Modal>
    </div>
  );
};

export default GroupSettlement;