import React, { useState, useEffect } from "react";
import {
  Input,
  Card,
  Row,
  Col,
  Button,
  Select,
  Tag,
  DatePicker,
  Slider,
  Modal,
  Space,
  Table,
  Switch,
  Drawer, Pagination,
  Form, message
} from "antd";
import initialRoomData from "./data.js";

import AddRoom from "./AddRoom"; // Import the AddRoom component

import "./Rooms.css";
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { RangePicker } = DatePicker;

function Rooms(props) {
  // State variables for filters, room data, and modals
  const [searchTerm, setSearchTerm] = useState("");
  const [roomsData, setRoomsData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddRoomVisible, setIsAddRoomVisible] = useState(false);

  const [editRowIndex, setEditRowIndex] = useState(null);
  const [bedTypeFilter, setBedTypeFilter] = useState("all");
  const [viewTypeFilter, setViewTypeFilter] = useState("all");
  const [bathroomTypeFilter, setBathroomTypeFilter] = useState("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState("all");
  const [floorFilter, setFloorFilter] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedDateRange, setSelectedDateRange] = useState([]);
  const [checkInDate, setCheckInDate] = useState(null); // Add check-in date state
  const [checkOutDate, setCheckOutDate] = useState(null); // Add check-out date state
  const [tableView, setTableView] = useState(false); // State variable for toggle between card and table view
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editRoomData, setEditRoomData] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [currentRoom, setCurrentRoom] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(18); // Adjust the number of items per page as needed

  const [tableCurrentPage, setTableCurrentPage] = useState(1);

  const tableItemsPerPage = 10; // Adjust the number of items per page as needed

  const filterByRoomType = (data) => {
    if (roomTypeFilter === 'all') {
      return data;
    }
    return data.filter((room) => room.roomType === roomTypeFilter);
  };

  // Filter by View Type
  const filterByViewType = (data) => {
    if (viewTypeFilter === 'all') {
      return data;
    }
    return data.filter((room) => room.view === viewTypeFilter);
  };

  // Filter by Bathroom Type
  const filterByBathroomType = (data) => {
    if (bathroomTypeFilter === 'all') {
      return data;
    }
    return data.filter((room) => room.bathroom === bathroomTypeFilter);
  };

  // Filter by Bed Type
  const filterByBedType = (data) => {
    if (bedTypeFilter === 'all') {
      return data;
    }
    return data.filter((room) => room.bed === bedTypeFilter);
  };

  // Filter by Floor
  const filterByFloor = (data) => {
    if (floorFilter === 'all') {
      return data;
    }
    return data.filter((room) => room.floor === floorFilter);
  };

  useEffect(() => {
    filterData();
  }, [roomTypeFilter, viewTypeFilter, bathroomTypeFilter, bedTypeFilter, floorFilter, roomsData]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/rooms/getAll",
          {
            headers: {
              'Authorization': `Bearer ${props.authToken}`
            }
          }
        );
        const data = await response.json();
        setRoomsData(data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  // Fetch vacant rooms when check-in date changes
  useEffect(() => {
    if (checkInDate) {
      fetchVacantRooms();
    }
  }, [checkInDate, checkOutDate]);

  // Fetch vacant rooms based on check-in and check-out dates
  const fetchVacantRooms = async () => {
    try {
      let url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/getVacantBetween?checkInDate=${checkInDate}`
      if (checkOutDate) {
        url += `&checkOutDate=${checkOutDate}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${props.authToken}`
        }
      });
      const data = await response.json();
      setRoomsData(data.map((item) => item.first));
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const handleOpenModal = () => {
    setIsAddRoomVisible(true); // Set the isAddRoomVisible state to true
  };


  const handleCloseModal = () => {
    setIsAddRoomVisible(false); // Set the isAddRoomVisible state to false to close the modal
  };
  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
    setEditRoomData(null); // Clear edit room data
  };
  // Handle editing a room - Fix to take roomData directly
  const handleEditRow = (roomData) => {
    setCurrentRoom(roomData); // Set the currentRoom state with the room data
    setIsDrawerVisible(true); // Open the drawer
  };



  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Consolidated function for adding/editing a room
  const handleSaveRoom = async () => {
    await handleRoomAction(currentRoom.roomNumber ? "PUT" : "POST", currentRoom);
  };


  // Define a function to handle the addition of a new room
  const handleAddNewRoom = async (newRoomData) => {
    // Make an API call to add the new room data
    try {
      const response = await fetch(
        "http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/rooms/add",
        {
          method: "POST", // Use POST method for adding a new room
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${props.authToken}`
          },
          body: JSON.stringify(newRoomData),
        }
      );

      if (response.ok) {
        message.success("Room added successfully");
        fetchRoomsData(); // Refresh the list of rooms after adding a new room
        handleCloseModal(); // Close the Add Room modal
      } else {
        message.error("Failed to add room");
      }
    } catch (error) {
      console.error("Error adding room: ", error);
      message.error("Error adding room");
    }
  };

  // Function to handle API calls for adding/editing a room
  const handleRoomAction = async (method, roomData) => {
    const url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/rooms/${method === "POST" ? "add" : `editRoom?roomNumber=${roomData.roomNumber}`
      }`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${props.authToken}`
        },
        body: JSON.stringify(roomData),
      });

      if (response.ok) {
        message.success(
          `Room ${method === "POST" ? "added" : "edited"} successfully`
        );
        fetchRoomsData(); // Refresh the list of rooms
      } else {
        message.error(`Failed to ${method === "POST" ? "add" : "edit"} room`);
      }
    } catch (error) {
      console.error(`Error ${method === "POST" ? "adding" : "editing"} room: `, error);
      message.error(`Error ${method === "POST" ? "adding" : "editing"} room`);
    }

    setIsDrawerVisible(false);
  };


  const handleChange = (e) => {
    const { name, value } = e.target ? e.target : e;
    setCurrentRoom((prevRoom) => ({
      ...prevRoom,
      [name]: value,
    }));
  };

  const handleDeleteRoom = async (roomNumber) => {
    try {
      const response = await fetch(
        `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/rooms/deleteByRoomNumber?roomNumber=${roomNumber}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${props.authToken}`
          },
        }
      );

      if (response.ok) {
        // Room deleted successfully, fetch updated room data
        fetchData(); // Refresh the room data
        message.success("Room deleted successfully");
      } else {
        console.error("Failed to delete room.");
        message.error("Failed to delete room");
      }
    } catch (error) {
      console.error("Error deleting room: ", error);
      message.error("Error deleting room");
    }
  };

  const handleEditRoom = async (editedRoomData) => {
    const url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/rooms/editRoom?roomNumber=${editedRoomData.roomNumber}`;

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${props.authToken}`

        },
        body: JSON.stringify(editedRoomData),
      });

      if (response.ok) {
        // Handle success
        console.log("Room edited successfully");
        // Refresh room data here
      } else {
        console.error("Failed to edit room.");
      }
    } catch (error) {
      console.error("Error editing room: ", error);
    }
  };



  const handleUpdateRoom = async () => {
    const url = `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/rooms/editRoom?roomNumber=${currentRoom.roomNumber}`;

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentRoom),
      });

      if (response.ok) {
        message.success("Room updated successfully");
        fetchRoomsData(); // Refresh the list of rooms
      } else {
        message.error("Failed to update room");
      }
    } catch (error) {
      console.error("Error updating room:", error);
      message.error("Error updating room");
    }

    setIsDrawerVisible(false);
  };

  function getTagColor(text) {
    if (!text) return "#B0B0B0";

    switch (text.toLowerCase()) {
      case "twin":
        return "#80C7E5";
      case "queen":
        return "#B6EBA0";
      case "city":
        return "#FFD19A";
      case "parking":
        return "#FFA0A0";
      case "indian":
        return "#D6A4E0";
      case "western":
        return "#FFB6C1";
      default:
        return "#B0B0B0";
    }
  }

  // Handle saving changes to a room
  const handleSaveRow = (index, updatedRoom) => {
    const updatedRooms = [...roomsData];
    updatedRooms[index] = updatedRoom;
    setRoomsData(updatedRooms);
    setEditRowIndex(null);
  };

  // const handleOpenEditRoomDrawer = (room) => {
  //   setCurrentRoom(room); // Set the room to be edited
  //   setIsDrawerVisible(true); // Open the drawer UI
  // };
  const handleOpenEditRoomDrawer = (room) => {
    setCurrentRoom(room); // Set the current room data for editing
    setIsAddRoomVisible(true); // Use the same state as for adding a room
  };


  // Handle selecting price range using the slider
  const handlePriceRangeChange = (value) => {
    setPriceRange(value);
  };

  // Handle selecting date range using the calendar
  const handleDateRangeChange = (value) => {
    setSelectedDateRange(value);
  };

  const tableDataSource = filteredData.slice(
    (tableCurrentPage - 1) * tableItemsPerPage,
    tableCurrentPage * tableItemsPerPage
  );

  const AddEditRoomForm = ({ editRoomData, onSave }) => {
    const [roomData, setRoomData] = useState({
      roomNumber: "",
      roomType: "",
      roomStatus: "vacant",
      bed: "",
      view: "", // Updated to use dropdown for View Type
      bathroom: "",
      floor: "",
    });

    useEffect(() => {
      if (editRoomData) {
        // If editing, populate the form with the existing data
        setRoomData(editRoomData);
      }
    }, [editRoomData]);

    const handleChange = (name, value) => {
      setCurrentRoom((prevRoom) => ({
        ...prevRoom,
        [name]: value,
      }));
    };

    const handleSubmit = () => {
      onSave(roomData);
    };

    return (
      <div>
        <Form layout="vertical">
          <Form.Item label="Room Number">
            <Input
              name="roomNumber"
              value={currentRoom.roomNumber}
              onChange={(e) => handleChange("roomNumber", e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Room Type">
            <Input
              name="roomType"
              value={currentRoom.roomType}
              onChange={(e) => handleChange("roomType", e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Bed Type">
            <Select
              name="bed"
              value={currentRoom.bed}
              onChange={(value) => handleChange("bed", value)}
            >
              <Option value="Queen">Queen</Option>
              <Option value="Twin">Twin</Option>
            </Select>
          </Form.Item>
          <Form.Item label="View Type">
            <Select
              name="view"
              value={currentRoom.view}
              onChange={(value) => handleChange("view", value)}
            >
              <Option value="City">City</Option>
              <Option value="Balcony">Balcony</Option>
              <Option value="Parking">Parking</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Bathroom">
            <Input
              name="bathroom"
              value={currentRoom.bathroom}
              onChange={(e) => handleChange("bathroom", e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Floor">
            <Input
              name="floor"
              value={currentRoom.floor}
              onChange={(e) => handleChange("floor", e.target.value)}
            />
          </Form.Item>
          <Form.Item>

          </Form.Item>
        </Form>
      </div>
    );
  };


  // Function to render room cards
  const renderRoomCards = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const paginatedRooms = filteredData.slice(startIndex, endIndex);

    return paginatedRooms.map((room, index) => (
      <Col key={index} xs={24} sm={12} md={8} lg={6} xl={4}>
        <Card
          className={`room-card ${editRowIndex === index ? "edit-mode" : ""}`}
          title={` ${room.roomNumber}`}
          extra={
            <Space>
              <EditOutlined onClick={() => handleOpenEditRoomDrawer(room)} />
              <DeleteOutlined onClick={() => handleDeleteRoom(room.roomNumber)} />
            </Space>
          }
        >
          {editRowIndex === index ? (
            <div className="edit-form">
              {/* Edit form fields */}
              <Input
                value={room.roomNumber}
                onChange={(e) => handleEditChange(e, index, "roomNumber")}
              />
              {/* ... other form fields ... */}
              <Button
                type="primary"
                onClick={() => handleSaveRow(index, room)}
                icon={<CheckOutlined />}
              />
              <Button
                onClick={() => setEditRowIndex(null)}
                icon={<CloseOutlined />}
              />
            </div>
          ) : (
            <div className="room-details">
              {/* Display room details, amenities, and status */}
              <p>
                <strong>Floor:</strong> {room.floor}
              </p>
              {/* ... other room details ... */}
              <Tag color={getTagColor(room.bed)}>{room.bed}</Tag>
              <Tag color={getTagColor(room.view)}>{room.view}</Tag>
              <Tag color={getTagColor(room.bathroom)}>{room.bathroom}</Tag>
              <p>
                <strong>Room Type:</strong> {room.roomType}
              </p>
              <p>
                <strong>Status:</strong> {room.roomStatus}
              </p>
            </div>
          )}
        </Card>
      </Col>

    ));

  };

  // Define columns for the Ant Design table
  const columns = [
    {
      title: "Room Number",
      dataIndex: "roomNumber",
      key: "roomNumber",
      sorter: (a, b) => a.roomNumber - b.roomNumber,
    },
    {
      title: "Floor",
      dataIndex: "floor",
      key: "floor",
    },
    {
      title: "Bed Type",
      dataIndex: "bed",
      key: "bed",
      render: (text) => <Tag color={getTagColor(text)}>{text}</Tag>,
    },
    {
      title: "View Type",
      dataIndex: "view",
      key: "view",
      render: (text) => <Tag color={getTagColor(text)}>{text}</Tag>,
    },
    {
      title: "Bathroom Type",
      dataIndex: "bathroom",
      key: "bathroom",
      render: (text) => <Tag color={getTagColor(text)}>{text}</Tag>,
    },
    {
      title: "Room Type",
      dataIndex: "roomType",
      key: "roomType",
    },
    {
      title: "Status",
      dataIndex: "roomStatus",
      key: "roomStatus",
    },
    {
      title: "Actions",
      key: "actions",
      // render: (text, record, index) => (
      //   <Space>
      //     <EditOutlined onClick={() => handleOpenEditRoomDrawer(room)} />
      //     <DeleteOutlined onClick={() => handleDeleteRoom(record.roomNumber)} />
      //   </Space>
      // ),
      render: (text, record, index) => (
        <Space>
          <EditOutlined onClick={() => handleOpenEditRoomDrawer(record)} />
          <DeleteOutlined onClick={() => handleDeleteRoom(record.roomNumber)} />
        </Space>
      ),
    },
  ];

  const filterData = () => {
    let filtered = [...roomsData];

    if (roomTypeFilter !== 'all') {
      filtered = filtered.filter(room => room.roomType === roomTypeFilter);
    }
    if (viewTypeFilter !== 'all') {
      filtered = filtered.filter(room => room.view === viewTypeFilter);
    }
    if (bathroomTypeFilter !== 'all') {
      filtered = filtered.filter(room => room.bathroom === bathroomTypeFilter);
    }
    if (bedTypeFilter !== 'all') {
      filtered = filtered.filter(room => room.bed === bedTypeFilter);
    }
    if (floorFilter !== 'all') {
      filtered = filtered.filter(room => room.floor === floorFilter);
    }

    setFilteredData(filtered);
  };

  useEffect(() => {
    filterData();
  }, [roomTypeFilter, viewTypeFilter, bathroomTypeFilter, bedTypeFilter, floorFilter, roomsData]);


  return (
    <div>
      {/* Filter Card */}
      {/* Filter Card */}
      <Card className="filter-card" style={{ marginBottom: "20px", width: "100%" }}>
        <Row gutter={16} align="middle">
          {/* Room Type Filter */}
          <Col xs={24} sm={12} md={6} lg={4}>
            <div><b>Room Type</b></div>
            <Select defaultValue="all" style={{ width: "100%" }} onChange={setRoomTypeFilter}>
              <Option value="all">All</Option>
              <Option value="AC">AC</Option>
              <Option value="Non AC">Non AC</Option>
              <Option value="Deluxe">Deluxe</Option>

            </Select>
          </Col>

          {/* View Type Filter */}
          <Col xs={24} sm={12} md={6} lg={4}>
            <div><b>View Type</b></div>
            <Select defaultValue="all" style={{ width: "100%" }} onChange={setViewTypeFilter}>
              <Option value="all">All</Option>
              <Option value="Balcony">Balcony</Option>
              <Option value="Parking">Parking</Option>
              <Option value="City">City</Option>

            </Select>
          </Col>

          {/* Bathroom Type Filter */}
          <Col xs={24} sm={12} md={6} lg={4}>
            <div><b>Bathroom Type</b></div>
            <Select defaultValue="all" style={{ width: "100%" }} onChange={setBathroomTypeFilter}>
              <Option value="all">All</Option>
              <Option value="Indian">Indian</Option>
              <Option value="Western">Western</Option>
            </Select>
          </Col>

          {/* Bed Type Filter */}
          <Col xs={24} sm={12} md={6} lg={4}>
            <div><b>Bed Type</b></div>
            <Select defaultValue="all" style={{ width: "100%" }} onChange={setBedTypeFilter}>
              <Option value="all">All</Option>
              <Option value="Queen">Queen</Option>
              <Option value="Twin">Twin</Option>
            </Select>
          </Col>

          {/* Floor Filter */}
          <Col xs={24} sm={12} md={6} lg={4}>
            <div><b>Floor</b></div>
            <Select defaultValue="all" style={{ width: "100%" }} onChange={setFloorFilter}>
              <Option value="all">All</Option>
              <Option value="1">1</Option>
              <Option value="2">2</Option>
            </Select>
          </Col>

          {/* Table View / Card View Toggle */}
          <Col xs={24} sm={12} md={6} lg={4}>
            <Switch checkedChildren="Table View" unCheckedChildren="Card View" checked={tableView} onChange={setTableView} />
          </Col>

          {/* Add Room Button */}
          <Col xs={24} sm={12} md={6} lg={4}>
            <Button type="primary" onClick={handleOpenModal} style={{ marginRight: 16 }}>Add Room</Button>
          </Col>
        </Row>
      </Card>


      {isAddRoomVisible && (
        // <AddRoom onClose={handleCloseModal} onSave={handleAddNewRoom} />
        <AddRoom
          props={props}
          onClose={handleCloseModal}
          onSave={handleSaveRoom} // You might need to modify this function to handle both add and edit
          editRoomData={currentRoom}

        />
      )}
      {tableView ? (
        <Table
          columns={columns}
          dataSource={filteredData} // Use the full filtered data source
          rowKey="roomNumber"
          pagination={{
            current: tableCurrentPage,
            pageSize: tableItemsPerPage,
            total: filteredData.length, // Total count of the data
            onChange: (page) => {
              setTableCurrentPage(page); // Update the current page state when page changes
            },
          }}
        />

      ) : (
        <Row gutter={[16, 16]}>{renderRoomCards()}</Row>
      )}


      <Pagination
        current={currentPage}
        total={filteredData.length}
        pageSize={itemsPerPage}
        onChange={(page) => setCurrentPage(page)}
        style={{ marginTop: "16px" }}
      />



    </div>
  );
}

export default Rooms; 