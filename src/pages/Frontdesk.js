import React, { useState, useEffect } from "react";
import Card from "./Card";
import "./Frontdesk.css";
import { Select, DatePicker } from "antd";
import { useHistory } from "react-router-dom";

const { Option } = Select;

const Frontdesk = ({ authToken }) => {
  const history = useHistory();
  const [roomsData, setRoomsData] = useState([]);
  const [currentFilter, setCurrentFilter] = useState("All");
  const [dropdownValue, setDropdownValue] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/currentStatus",
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        let data = await response.json();
        data = data.map(item => {
          const lowerCaseStatus = item.first.status.toLowerCase();
          if (lowerCaseStatus === "dueout") {
            item.first.status = item.first.roomAvailabilityStatus || "dueout";
            item.first.customerName = "";
          } else if (lowerCaseStatus === "dirty") {
            item.first.customerName = "";
          } else if (lowerCaseStatus === "vacant" && item.first.roomAvailabilityStatus === "reserved") {
            item.first.status = item.first.roomAvailabilityStatus;
          } else if (lowerCaseStatus === "vacant") {
            item.first.customerName = "";
          }
          return item;
        });
        setRoomsData(data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [authToken, selectedDate]);

  const handleDateChange = async (date, dateString) => {
    setSelectedDate(dateString);
    try {
      const response = await fetch(
        `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomStatus/currentStatus?date=${dateString}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      let data = await response.json();
      data = data.map(item => {
        if (item.first.status === "dueout") {
          item.first.status = item.first.roomAvailabilityStatus || "dueout";
          item.first.customerName = "";
        }
        return item;
      });
      setRoomsData(data);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const handleCardClick = (roomData) => {
    setSelectedRoom(roomData);
    const room = roomData.first;
    const isGroupBooking = room.groupId; // Adjust this based on your actual data to determine group booking

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const defaultCheckInTime = "10:00:00";
    const defaultCheckOutTime = "10:00:00";

    if (room.status === "vacant") {
      history.push({
        pathname: "/bookingDetails",
        state: {
          selectedRoom: room,
          roomNumber: room.room,
          roomType: room.roomType,
          costPerDay: room.costPerDay,
          checkInDate: today.toISOString().split("T")[0],
          checkOutDate: tomorrow.toISOString().split("T")[0],
          checkInTime: defaultCheckInTime,
          checkOutTime: defaultCheckOutTime,
        },
      });
    } else if (isGroupBooking) {
      history.push({
        pathname: "/groupBookingConfirmation",
        state: {
          groupId: room.groupId,
          // Add other necessary state here for group booking
        },
      });
    } else {
      history.push({
        pathname: "/bookingConfirmation",
        state: {
          bookingId: room.bookingId,
          customerId: room.bookingId,
          roomNumber: room.room,
          roomType: room.roomType,
          costPerDay: room.costPerDay,
          checkInDate: room.checkIn,
          checkOutDate: room.checkOut,
        },
      });
    }
  };

  const handleDropdownChange = (value) => {
    setDropdownValue(value);
  };

  const getFilteredRooms = () => {
    let filteredRooms = currentFilter === "All"
      ? roomsData
      : roomsData.filter(item => item.first.status === currentFilter);

    if (dropdownValue) {
      filteredRooms = filteredRooms.filter(item => item.first.floor === dropdownValue);
    }
    return filteredRooms;
  };

  const filteredRooms = getFilteredRooms();

  return (
    <div>
      <div className="filter-section">
        <button onClick={() => setCurrentFilter("All")} className="pill-button">
          All ({roomsData.length})
        </button>
        <button onClick={() => setCurrentFilter("occupied")} className="pill-button pill-button-occupied">
          Occupied({roomsData.filter(item => item.first.status === "occupied").length})
        </button>
        <button onClick={() => setCurrentFilter("vacant")} className="pill-button pill-button-vacant">
          Vacant ({roomsData.filter(item => item.first.status === "vacant").length})
        </button>
        <button onClick={() => setCurrentFilter("reserved")} className="pill-button pill-button-reserved">
          Reserved ({roomsData.filter(item => item.first.status === "reserved").length})
        </button>
        <button onClick={() => setCurrentFilter("outOfOrder")} className="pill-button pill-button-outOfOrder">
          Out Of Order ({roomsData.filter(item => item.first.status === "outOfOrder").length})
        </button>
        <button onClick={() => setCurrentFilter("dueout")} className="pill-button pill-button-dueOut">
          Due Out ({roomsData.filter(item => item.first.status === "dueout").length})
        </button>
        <button onClick={() => setCurrentFilter("dirty")} className="pill-button pill-button-dirty">
          Dirty ({roomsData.filter(item => item.first.status === "dirty").length})
        </button>
      </div>
      <div className="dropdown-container">
        <Select value={dropdownValue} onChange={handleDropdownChange} className="dropdown">
          <Option value="">All</Option>
          <Option value="1">First Floor</Option>
          <Option value="2">Second Floor</Option>
        </Select>
        <DatePicker onChange={handleDateChange} className="date-picker" style={{ width: "180px" }} />
      </div>
      <div className="grid-container">
        {filteredRooms.map((room, index) => (
          <Card
            authToken={authToken}
            key={index}
            roomNumber={room.first.room}
            roomType={room.first.roomType}
            guestName={room.first.customerName}
            status={room.first.status}
            bedType={room.first.bedType}
            viewType={room.first.viewType}
            bathroomType={room.first.bathroomType}
            tasks={room.second ? room.second.tasks : []}
            icons={{ iconGroup: [room.first.bedType, room.first.viewType, room.first.bathroomType] }}
            onClick={() => handleCardClick(room)}
          />
        ))}
      </div>
    </div>
  );
};

export default Frontdesk;