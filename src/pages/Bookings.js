import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Space,
  Table,
  Pagination,
  Tag,
  Switch,
  TimePicker,
  Select,
} from "antd";
import { MinusOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { BathOutlined, AppstoreOutlined } from "@ant-design/icons";
import BookingDetails from "./BookingDetails";
import moment from "moment";

import "./Bookings.css";
import { Card, Checkbox, Row, Col } from "antd";
import { useBooking } from "./BookingContext";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { Spin } from "antd";
import { Tooltip } from 'antd';
import { message } from "antd";
import { Radio } from "antd";
import DatePicker from "react-datepicker";

const { Option } = Select;

function Bookings({ authToken }) {
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [checkIn, setCheckIn] = useState(moment().format("YYYY-MM-DD"));
  const [checkOut, setCheckOut] = useState(
    moment().add(1, "days").format("YYYY-MM-DD")
  );
  const [viewMode, setViewMode] = useState('table');
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutTime, setCheckOutTime] = useState('11:00');

  const [roomTypeFilter, setRoomTypeFilter] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [tableData, setTableData] = useState(apiData);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState("All");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const today = moment().format("YYYY-MM-DD");


  const [pageSize, setPageSize] = useState(9);

  const history = useHistory();
  const [numberOfNights, setNumberOfNights] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const bedTypeOptions = ["All", "Queen", "Twin"];
  const viewOptions = ["All", "City", "Parking"];
  const bathroomOptions = ["All", "Indian", "Western"];
  const [totalPages, setTotalPages] = useState(0);

  const [viewFilter, setViewFilter] = useState("All");
  const [bathroomFilter, setBathroomFilter] = useState("All");
  const [bedTypeFilter, setBedTypeFilter] = useState("All");

  useEffect(() => {
    setTotalPages(Math.ceil(apiData.length / pageSize));
  }, [apiData, pageSize]);

  const toggleRoomSelection = (room) => {
    if (selectedRooms.includes(room)) {
      setSelectedRooms(selectedRooms.filter(r => r !== room));
    } else {
      setSelectedRooms([...selectedRooms, room]);
    }
  };

  const dividerStyle = {
    height: 'auto',
    margin: '0 20px',
  };


  useEffect(() => {
    const fetchVacantRooms = async () => {
      const formattedCheckInDate = moment(checkIn).format("YYYY-MM-DD");
      const formattedCheckOutDate = moment(checkOut).format("YYYY-MM-DD");
      const url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/getVacantBetween?checkInDate=${formattedCheckInDate}&checkInTime=${checkInTime}&checkOutDate=${formattedCheckOutDate}&checkOutTime=${checkInTime}`;

      try {
        const response = await axios.get(url, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        setApiData(response.data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchVacantRooms();
  }, [checkIn, checkInTime, authToken]);





  useEffect(() => {
    const fetchVacantRoomsBetweenDates = async () => {
      const formattedCheckInDate = moment(checkIn).format("YYYY-MM-DD");
      const formattedCheckOutDate = moment(checkOut).format("YYYY-MM-DD");
      const url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/getVacantBetween?checkInDate=${formattedCheckInDate}&checkInTime=${checkInTime}&checkOutDate=${formattedCheckOutDate}&checkOutTime=${checkInTime}`;

      try {
        const response = await axios.get(url, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        setApiData(response.data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchVacantRoomsBetweenDates();
  }, [checkIn, checkOut, checkInTime, checkOutTime, authToken]);


  const handleCheckInChange = (event) => {
    const newCheckInDate = event.target.value;
    setCheckIn(newCheckInDate);

    // Automatically set the check-out date to at least one day after the new check-in date
    const newCheckOutDate = moment(newCheckInDate).add(1, 'days').format('YYYY-MM-DD');
    setCheckOut(newCheckOutDate);
  };

  const toggleViewMode = (checked) => {
    setViewMode(checked ? 'card' : 'table');
  };
  const renderCardView = (rooms) => {

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const visibleRooms = rooms.slice(startIndex, endIndex);
    return (
      <>
        <Row gutter={[16, 16]}>
          {visibleRooms.map((item, index) => (
            <Col key={index} span={8}>
              <Card
                hoverable
                style={{ borderRadius: '10px' }}
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>{item.room}</span>
                    <Checkbox
                      onChange={() => handleSelectRoom(item)}
                      checked={selectedRoom === item}
                    />
                  </div>
                }
                bordered={true}
              >
                <p><strong>Room Type:</strong> <Tag color="geekblue">{item.roomType}</Tag></p>
                <p><strong>Status:</strong> {item.status === 'vacant' ? <Tag color="green">Vacant</Tag> : <Tag color="red">Occupied</Tag>}</p>
                {item.viewType && <Tag color="blue">{item.viewType}</Tag>}
                {item.bedType && <Tag color="cyan">{item.bedType}</Tag>}
                {item.bathroomType && <Tag color="purple">{item.bathroomType}</Tag>}
                <p><strong>Cost per Day:</strong> ₹{item.costPerDay.toFixed(2)} / night</p>
              </Card>
            </Col>
          ))}
        </Row>
        <Pagination
          current={currentPage}
          onChange={(page) => setCurrentPage(page)}
          pageSize={pageSize}
          total={tableData.length}
          style={{ textAlign: 'center', marginTop: '20px' }}
        />
      </>
    );
  };

  const handleSelectRoom = (room) => {
    if (selectedRooms.includes(room)) {
      setSelectedRooms(selectedRooms.filter(selectedRoom => selectedRoom !== room));
      console.log("Updated selectedRooms:", selectedRooms);

    } else {
      setSelectedRooms([...selectedRooms, room]);
      console.log("Updated selectedRooms:", selectedRooms);

    }
  };

  useEffect(() => {
    console.log("Selected Rooms updated:", selectedRooms);
  }, [selectedRooms]);

  const searchRooms = () => {
    const filteredData = dummyData.filter((item) => {
      return (
        item.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.roomType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    setTableData(filteredData);
  };


  const handleCheckOutChange = (event) => {
    const newCheckOutDate = event.target.value;
    setCheckOut(newCheckOutDate);
  };

  useEffect(() => {
    let filteredData = apiData;

    if (selectedRoomType !== "All") {
      filteredData = filteredData.filter(
        (item) => item.room.roomType === selectedRoomType
      );
    }

    if (viewFilter !== "All") {
      filteredData = filteredData.filter(
        (item) =>
          item.room.viewType &&
          item.room.viewType.toLowerCase() === viewFilter.toLowerCase()
      );
    }

    if (bathroomFilter !== "All") {
      filteredData = filteredData.filter(
        (item) =>
          item.room.bathroomType &&
          item.room.bathroomType.toLowerCase() === bathroomFilter.toLowerCase()
      );
    }

    if (bedTypeFilter !== "All") {
      filteredData = filteredData.filter(
        (item) =>
          item.room.bedType &&
          item.room.bedType.toLowerCase() === bedTypeFilter.toLowerCase()
      );
    }

    setTableData(filteredData);
  }, [selectedRoomType, viewFilter, bathroomFilter, bedTypeFilter, apiData]);

  const columns = [
    {
      title: "Room Number",
      dataIndex: "room",
      key: "room",
    },
    {
      title: "Room Type",
      dataIndex: "roomType",
      key: "roomType",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "vacant" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "View",
      dataIndex: "viewType",
      key: "viewType",
      render: (viewType) => (
        viewType ? <Tag color="blue">{viewType}</Tag> : <Tag>N/A</Tag>
      ),
    },
    {
      title: "Bed",
      dataIndex: "bedType",
      key: "bedType",
      render: (bedType) => (
        bedType ? <Tag color="cyan">{bedType}</Tag> : <Tag>N/A</Tag>
      ),
    },
    {
      title: "Bathroom",
      dataIndex: "bathroomType",
      key: "bathroomType",
      render: (bathroomType) => (
        bathroomType ? <Tag color="purple">{bathroomType}</Tag> : <Tag>N/A</Tag>
      ),
    },
    {
      title: "Cost per Day",
      dataIndex: "costPerDay",
      key: "costPerDay",
      render: (costPerDay) => `₹${costPerDay.toFixed(2)}`,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        record.status === "vacant" ? (
          // <Checkbox onChange={() => setSelectedRoom(record)} />
          <Checkbox
            onChange={() => handleSelectRoom(record)}
            checked={selectedRooms.some(selectedRoom => selectedRoom.room === record.room)}
          />

        ) : (
          <Checkbox disabled />
        )
      ),
    },
  ];

  const updateBookingDetails = (checkIn, checkOut, adults, children) => {
    setBookingData({
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adults,
      children,
    });
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleRoomTypeFilterChange = (selectedTypes) => {
    onBookingDataChange({ roomTypeFilter: selectedTypes });
  };

  const handleProceedClick = () => {
    // if (selectedRooms.length === 0) {
    //   message.error("Please select a room.");
    //   return;
    // }
    // if (!checkIn || !checkOut) {
    //   message.error("Please select both check-in and check-out dates.");
    //   return;
    // }
    // if (!selectedRoom) {
    //   message.error("Please select a room.");
    //   return;
    // }
    const checkInMoment = moment(checkIn, "YYYY-MM-DD");
    const checkOutMoment = moment(checkOut, "YYYY-MM-DD");
    const numberOfNights = checkOutMoment.diff(checkInMoment, 'days');
    let totalRoomCharges = 0;
    selectedRooms.forEach(room => {
      totalRoomCharges += room.costPerDay * numberOfNights;
    });

    const gstRate = 0.18; // 18% GST
    const gstAmount = totalRoomCharges * gstRate;

    history.push("/bookingDetails", {
      checkInDate: checkIn,
      checkOutDate: checkOut,
      checkInTime: checkInTime,
      checkOutTime: checkOutTime,
      adults: adults,
      children: children,
      // selectedRoom: {
      //   ...selectedRoom,
      //   //roomNumber: selectedRoom.room.roomNumber,
      //   //roomType: selectedRoom.roomType,
      //   //costPerDay: selectedRoom.costPerDay,
      //   //totalRoomCharges,
      //   //gstAmount,
      //   numberOfNights,
      // },
      selectedRooms: selectedRooms.map(room => ({
        ...room,
        numberOfNights: numberOfNights,
        totalRoomCharges: room.costPerDay * numberOfNights,
        gstAmount: room.costPerDay * numberOfNights * gstRate
      })),
      authToken: authToken,
      // selectedRooms: selectedRooms

    });
  };


  useEffect(() => {
    let filteredData = apiData;

    if (selectedRoomType !== "All") {
      filteredData = filteredData.filter(
        (item) => item.roomType === selectedRoomType
      );
    }

    if (viewFilter !== "All") {
      filteredData = filteredData.filter((item) =>
        item.viewType
          ? item.viewType.toLowerCase() === viewFilter.toLowerCase()
          : false
      );
    } else {
      filteredData = filteredData.filter(
        (item) => item.viewType === null || item.viewType
      );
    }

    if (bathroomFilter !== "All") {
      filteredData = filteredData.filter((item) =>
        item.bathroomType
          ? item.bathroomType.toLowerCase() === bathroomFilter.toLowerCase()
          : false
      );
    } else {
      filteredData = filteredData.filter(
        (item) => item.bathroomType === null || item.bathroomType
      );
    }

    if (bedTypeFilter !== "All") {
      filteredData = filteredData.filter((item) =>
        item.bedType
          ? item.bedType.toLowerCase() === bedTypeFilter.toLowerCase()
          : false
      );
    } else {
      filteredData = filteredData.filter(
        (item) => item.bedType === null || item.bedType
      );
    }

    setTableData(filteredData);
  }, [selectedRoomType, viewFilter, bathroomFilter, bedTypeFilter, apiData]);

  const updateNumberOfNights = (checkInDate, checkOutDate) => {
    if (checkInDate && checkOutDate) {
      const duration = moment(checkOutDate).diff(moment(checkInDate), "days");
      setNumberOfNights(duration);
    }
  };

  const handleCounterChange = (index, action) => {
    const updatedTableData = [...tableData];
    const currentCount = updatedTableData[index].count || 0;
    if (action === "increment") {
      updatedTableData[index].count = currentCount + 1;
    } else if (action === "decrement" && currentCount > 0) {
      updatedTableData[index].count = currentCount - 1;
    }
    setTableData(updatedTableData);
  };



  const handleCheckInTimeChange = (time, timeString, okPressed) => {
    setCheckInTime(timeString);
    if (okPressed) {
      console.log("Selected Check-In Time:", timeString);
    }
  };

  const handleCheckOutTimeChange = (time, timeString, okPressed) => {
    setCheckOutTime(timeString);
    if (okPressed) {
      console.log("Selected Check-Out Time:", timeString);
    }
  };

  const incrementAdults = () => {
    if (adults >= 3) {
      message.error('Cannot select more than 3 adults');
    } else {
      setAdults(adults + 1);
    }
  };

  if (showBookingDetails) {
    return (
      <BookingDetails
        onBackClick={() => setShowBookingDetails(false)}
        checkInDate={checkIn}
        checkOutDate={checkOut}
        adults={adults}
        children={children}
        selectedRoom={selectedRoom}
        numberOfNights={numberOfNights}
        authToken={authToken}
      />
    );
  }
  return (
    <div className="bookings-wrapper">
      <h1 className="create-booking-header">Create Booking</h1>
      <Card className="booking-card" style={{ marginBottom: "20px", padding: '10px' }}>
        <Row gutter={[16, 16]}>

          <Col span={12}>
            <Space direction="vertical" size="middle">
              <div>
                <Space size="small">
                  <Button type={selectedRoomType === "All" ? "primary" : "default"} onClick={() => setSelectedRoomType("All")}>All</Button>
                  <Button type={selectedRoomType === "AC" ? "primary" : "default"} onClick={() => setSelectedRoomType("AC")}>AC</Button>
                  <Button type={selectedRoomType === "Non AC" ? "primary" : "default"} onClick={() => setSelectedRoomType("Non AC")}>Non AC</Button>
                  <Button type={selectedRoomType === "Deluxe" ? "primary" : "default"} onClick={() => setSelectedRoomType("Deluxe")}>Deluxe</Button>
                </Space>
              </div>

              <Row gutter={16}>
              <Col span={12}>
                  <div><strong>Check In Date:</strong></div>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={handleCheckInChange}
                    className="form-control"
                    min={today} // Set min date to today for check-in
                  />
                </Col>
                <Col span={12}>
                  <div><strong>Check In Time:</strong></div>
                  <TimePicker
                    value={moment(checkInTime, "HH:mm")}
                    onOk={(time) => handleCheckInTimeChange(time, time.format("HH:mm"), true)}
                    onChange={(time, timeString) => handleCheckInTimeChange(time, timeString, false)}
                    use12Hours
                    format="h:mm a"
                    style={{ width: "100%" }}
                  />
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <div><strong>Check Out Date:</strong></div>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="form-control"
                    min={today}
                  />

                </Col>
                <Col span={12}>
                  <div><strong>Check Out Time:</strong></div>
                  <TimePicker
                    value={moment(checkInTime, "HH:mm")}
                    onOk={(time) => handleCheckOutTimeChange(time, time.format("HH:mm"), true)}
                    onChange={(time, timeString) => handleCheckOutTimeChange(time, timeString, false)}
                    use12Hours
                    format="h:mm a"
                    style={{ width: "100%" }}
                    disabled
                  />
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <div><strong>Adults:</strong></div>
                  <Input.Group compact>
                    <Button icon={<MinusOutlined />} onClick={() => setAdults(adults > 1 ? adults - 1 : 1)} />
                    <Input style={{ width: '50px', textAlign: 'center' }} value={adults} readOnly />
                    <Button icon={<PlusOutlined />} onClick={incrementAdults} />
                  </Input.Group>
                </Col>
                <Col span={12}>
                  <div><strong>Children:</strong></div>
                  <Input.Group compact>
                    <Button icon={<MinusOutlined />} onClick={() => setChildren(children > 0 ? children - 1 : 0)} />
                    <Input style={{ width: '50px', textAlign: 'center' }} value={children} readOnly />
                    <Button icon={<PlusOutlined />} onClick={() => setChildren(children + 1)} />
                  </Input.Group>
                </Col>
              </Row>
            </Space>
          </Col>

          {/* Vertical Divider */}
          <Col span={1} style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ borderLeft: "2px solid #f0f0f0", height: "100%" }}></div>
          </Col>

          {/* Right Column: Filters and Check-out Details */}
          <Col span={11}>
            <Space direction="vertical" size="middle">
              <div>
                <div><strong>View Type:</strong></div>
                <Select defaultValue="All" style={{ width: "100%" }} onChange={(value) => setViewFilter(value)}>
                  <Option value="All">All</Option>
                  <Option value="City">City</Option>
                  <Option value="Parking">Parking</Option>
                  <Option value="Balcony">Balcony</Option>

                </Select>
              </div>


              <div>
                <div><strong>Bathroom Type:</strong></div>
                <Select defaultValue="All" style={{ width: "100%" }} onChange={(value) => setBathroomFilter(value)}>
                  <Option value="All">All</Option>
                  <Option value="Indian">Indian</Option>
                  <Option value="Western">Western</Option>
                </Select>
              </div>


              <div>
                <div><strong>Bed Type:</strong></div>
                <Select defaultValue="All" style={{ width: "100%" }} onChange={(value) => setBedTypeFilter(value)}>
                  <Option value="All">All</Option>
                  <Option value="Queen">Queen</Option>
                  <Option value="Twin">Twin</Option>
                </Select>
              </div>
              <div className="view-toggle">

              </div>
              <Switch
                checkedChildren="Card View"
                unCheckedChildren="Table View"
                onChange={toggleViewMode}
                checked={viewMode === 'card'}
              />
            </Space>
          </Col>
        </Row>
      </Card>


      <div className="table-container">
        <div className="table-container">


          {viewMode === 'table' ? (
            <Table
              columns={columns}
              dataSource={tableData}
              rowKey={(record, index) => index}
              pagination={{ size: "small" }}
              size="small"
            />
          ) : (
            renderCardView(tableData)
          )}
        </div>

      </div>
      <Button
        type="primary"
        className="proceed-button"
        onClick={handleProceedClick}
      >
        Proceed
      </Button>
    </div>
  );
}

export default Bookings; 