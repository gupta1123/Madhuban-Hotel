import React, { useState, useEffect } from 'react';
import { Tabs, Table, Statistic, Card, Row, Col, Carousel, Button } from 'antd';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { useHistory } from 'react-router-dom';

const { TabPane } = Tabs;

const Report = ({ authToken }) => {
  const history = useHistory();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await axios.get('http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getAll',
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              'Authorization': `Bearer ${authToken}`
            },
          }
        );
        setBookings(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  //   const columns = [
  //     { title: 'Booking ID', dataIndex: 'bookingId', key: 'bookingId' },
  //     { title: 'Customer Name', dataIndex: 'customerName', key: 'customerName' },
  //     // Add more columns as needed
  //   ];

  const calculateKPIs = () => {
    const currentDate = new Date();
    const currentWeekStart = new Date(currentDate);
    currentWeekStart.setDate(currentDate.getDate() - currentDate.getDay()); // Start of current week (Sunday)
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // Start of current month

    // Filter bookings for this week and month
    const bookingsThisWeek = bookings.filter(booking => new Date(booking.checkIn) >= currentWeekStart);
    const bookingsThisMonth = bookings.filter(booking => new Date(booking.checkIn) >= currentMonthStart);

    // Calculate revenue for this week and month
    const revenueThisWeek = bookingsThisWeek.reduce((total, booking) => total + booking.roomTotal, 0);
    const revenueThisMonth = bookingsThisMonth.reduce((total, booking) => total + booking.roomTotal, 0);

    // Calculate previous week and month revenue
    const prevWeekStart = new Date(currentWeekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7); // Start of previous week
    const prevMonthStart = new Date(currentMonthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1); // Start of previous month

    const prevWeekBookings = bookings.filter(booking => new Date(booking.checkIn) >= prevWeekStart && new Date(booking.checkIn) < currentWeekStart);
    const prevMonthBookings = bookings.filter(booking => new Date(booking.checkIn) >= prevMonthStart && new Date(booking.checkIn) < currentMonthStart);

    const revenuePrevWeek = prevWeekBookings.reduce((total, booking) => total + booking.roomTotal, 0);
    const revenuePrevMonth = prevMonthBookings.reduce((total, booking) => total + booking.roomTotal, 0);

    // Calculate percentage change
    const percentageChangeWeek = ((revenueThisWeek - revenuePrevWeek) / revenuePrevWeek) * 100;
    const percentageChangeMonth = ((revenueThisMonth - revenuePrevMonth) / revenuePrevMonth) * 100;

    return {
      revenueThisWeek,
      numBookingsThisWeek: bookingsThisWeek.length,
      revenueThisMonth,
      numBookingsThisMonth: bookingsThisMonth.length,
      percentageChangeWeek,
      percentageChangeMonth,
    };
  };

  const kpis = calculateKPIs();

  const renderDailyRevenueChart = () => {
    // Extract actual data of revenue again from the API response
    const data = bookings.map(booking => ({
      date: booking.checkIn,
      revenue: booking.roomTotal,
    }));

    return (
      <Card>
        <LineChart width={600} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
        </LineChart>
      </Card>
    );
  };

  const renderRevenueDistributionChart = () => {
    // Calculate revenue distribution by room type
    const roomTypes = {};
    bookings.forEach(booking => {
      roomTypes[booking.roomType] = roomTypes[booking.roomType] ? roomTypes[booking.roomType] + booking.roomTotal : booking.roomTotal;
    });

    const data = Object.keys(roomTypes).map(roomType => ({
      roomType,
      revenue: roomTypes[roomType],
    }));

    return (
      <Card>
        <BarChart width={600} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="roomType" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="revenue" fill="#8884d8" />
        </BarChart>
      </Card>
    );
  };

  const today = new Date().toISOString().split('T')[0];
  const todaysCheckIns = bookings.filter(booking => booking.checkIn === today);
  const todaysCheckOuts = bookings.filter(booking => booking.checkOut === today);

  const columns = [
    { title: 'Booking ID', dataIndex: 'bookingId', key: 'bookingId' },
    { title: 'Customer Name', dataIndex: 'customerName', key: 'customerName' },
    { title: 'Room Type', dataIndex: 'roomType', key: 'roomType' },
    { title: 'Check-in', dataIndex: 'checkIn', key: 'checkIn' },
    { title: 'Check-out', dataIndex: 'checkOut', key: 'checkOut' },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (text, record) => {
        return (
          <a
            href={`/bookings/${record.bookingId}`}
            onClick={(e) => {
              e.preventDefault();
              if (record.groupId === null) {
                console.log('Booking ID:', record.bookingId, 'Value:', record);
                history.push({
                  pathname: '/bookingConfirmation',
                  state: { customerId: record.bookingId }
                });
              } else {
                history.push({
                  pathname: '/GroupBookingConfirmation',
                  state: { groupId: record.groupId }
                });
                console.log('Group ID:', record.groupId, 'Value:', record);
              }
            }}
          >
            View Details
          </a>
        );
      },
    },
  ];

  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="KPIs" key="1">
        <div>
          <h2>KPIs</h2>
          <div className="site-statistic-demo-card">
            <Row gutter={16}>
              <Col span={6}>
                <Card>
                  <Statistic title="Revenue this Week" value={kpis.revenueThisWeek} precision={2}  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="Number of Bookings This Week" value={kpis.numBookingsThisWeek} />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="Revenue this Month" value={kpis.revenueThisMonth} precision={2}  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="Number of Bookings This Month" value={kpis.numBookingsThisMonth} />
                </Card>
              </Col>
            </Row>
          </div>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Daily Revenue" key="1">
              {renderDailyRevenueChart()}
            </TabPane>
            <TabPane tab="Revenue Distribution" key="2">
              {renderRevenueDistributionChart()}
            </TabPane>
          </Tabs>
        </div>
      </TabPane>
      <TabPane tab="Daybook" key="2">
        <div>
          <h2>Today's Check-ins</h2>
          <Table dataSource={todaysCheckIns} columns={columns} loading={loading} />
          <h2>Today's Check-outs</h2>
          <Table dataSource={todaysCheckOuts} columns={columns} loading={loading} />
        </div>
      </TabPane>
    </Tabs>
  );
};

export default Report;