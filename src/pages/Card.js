import React, { useState, useEffect } from "react";
import { Menu, Dropdown, Drawer, Form, Input, Select, Button, message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faToilet,
  faMountain,
  faParking,
  faTasks,
  faSprayCan,
  faBroom,
  faUser,
  faConciergeBell, // This represents Room Service
  faCity
} from "@fortawesome/free-solid-svg-icons";
import { DatePicker } from "antd";
import { LuBedSingle } from "react-icons/lu";

const { Option } = Select;

const statusColors = {
  vacant: "#fdddb3",
  occupied: "#92deba",
  reserved: "#f9a63a",
  outOfOrder: "#5d6679",
  dueout: "#b6d3fa",
  dirty: "#aa3028",
};

const taskStatusColor = {
  Assigned: "red",
  Pending: "orange",
  Completed: "blue",
};

const iconMapping = {
  Queen: faBed,
  Twin: faBed,
  Single: faBed,
  Double: faBed,
  Balcony: faMountain,
  Mountain: faMountain,
  Parking: faParking,
  City:faCity,
  Western: faToilet,
  Indian: faToilet,
  task: faTasks,
  Cleaning: faSprayCan,
  RoomService: faConciergeBell, // Add this line for Room Service
  User: faUser,
};

const cardStyle = {
  border: "1px solid #ccc",
  borderRadius: "4px",
  boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.2)",
  padding: "1px",
  margin: "8px",
};

const headerStyle = (status) => ({
  backgroundColor: statusColors[status && status.toLowerCase()] || "#00f",
  height: "20px",
});


const roomNumberStyle = {
  float: "left",
  marginRight: "8px",
};

const roomTypeStyle = {
  float: "right",
};

const guestNameStyle = {
  textAlign: "center",
  fontWeight: "bold",
  minHeight: "20px", // Set a minimum height to maintain consistency
};


const iconsContainerStyle = {
  display: "flex",
  justifyContent: "space-between", // Align icons at the ends
  alignItems: "flex-end", // Align icons at the bottom
  marginTop: "8px",
  padding: "0 16px", // Add horizontal padding to both icon groups
  marginBottom: "8px", // Add vertical margin to both icon groups
};


const iconStyle = {
  fontSize: "18px",
  marginRight: "8px",
};

const taskIconStyle = (color) => ({
  fontSize: "18px",
  color: color === "Assigned" ? "red" : color === "Work in Progress" ? "orange" : color,
});


const Card = ({
  roomNumber,
  roomType,
  guestName,
  status,
  bedType,
  viewType,
  bathroomType,
  authToken,
  tasks = [],
  onClick,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();

  const handleCreateTask = () => {
    form.resetFields();
    form.setFieldsValue({
      roomNumber: roomNumber.toString(),
      status: "Assigned", // Set the status field to "Assigned"
    });
    setDrawerVisible(true);
  };



  const onClose = () => {
    setDrawerVisible(false);
  };

  const handleSaveFromDrawer = async () => {
    try {
      const values = await form.validateFields();

      // Formatting the date to match the dueDate field requirement
      const formattedValues = {
        ...values,
        roomNumber: parseInt(values.roomNumber, 10),
        dueDate: values.date.format("YYYY-MM-DD"), // Make sure the DatePicker's value is formatted
        status: "Assigned", // Static value for status as per requirement
      };

      const response = await fetch(
        "http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/task/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(formattedValues),
        }
      );


      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      message.success("Task created successfully!");
      setDrawerVisible(false);
    } catch (error) {
      console.error("Error creating task:", error);
      message.error("Failed to create task.");
    }
  };


  const cardContextMenu = (
    <Menu>
      <Menu.Item key="createTask" onClick={handleCreateTask}>
        Create Task
      </Menu.Item>
    </Menu>
  );

  const showTaskIcon = tasks.length > 0;
  const taskIconColor = tasks.some((task) => task.status === "Assigned") ? "red" : "green";
  const cleaningTask = tasks.find(task => task.taskName === "Cleaning");
  const roomServiceTask = tasks.find(task => task.taskName === "Room Service");

  return (
    <>
      <Dropdown overlay={cardContextMenu} trigger={["contextMenu"]}>
        <div style={cardStyle} onClick={onClick}>
          <div style={headerStyle(status)}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' }}>
            <div style={roomNumberStyle}>
              {`Room: ${roomNumber}`}
            </div>
            <div style={roomTypeStyle}>
              {roomType}
            </div>
          </div>
          <div style={{ ...guestNameStyle, padding: '8px 16px' }}>
            {guestName || "   "}
          </div>
          <div style={iconsContainerStyle}>
            <div>
              <FontAwesomeIcon icon={iconMapping[bedType]} title={`Bed Type: ${bedType}`} style={iconStyle} />
              <FontAwesomeIcon icon={iconMapping[viewType]} title={`View Type: ${viewType}`} style={iconStyle} />
              <FontAwesomeIcon icon={iconMapping[bathroomType]} title={`Bathroom Type: ${bathroomType}`} style={iconStyle} />
            </div>
            <div>
            {cleaningTask && (
            <FontAwesomeIcon
              icon={iconMapping.Cleaning}
              title="Cleaning"
              style={taskIconStyle(taskStatusColor[cleaningTask.status])}
            />
          )}
          {roomServiceTask && (
            <FontAwesomeIcon
              icon={iconMapping.RoomService}
              title="Room Service"
              style={taskIconStyle(taskStatusColor[roomServiceTask.status])}
            />
          )}
        </div>
      </div>
        </div>
      </Dropdown>
      <Drawer
        title={drawerVisible && "Add New Task"}
        width={300}
        onClose={onClose}
        visible={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div style={{ textAlign: "right", marginTop: "25px" }}>
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button onClick={handleSaveFromDrawer} type="primary">
              Save
            </Button>
          </div>
        }
      >
        <Form
          layout="vertical"
          hideRequiredMark
          initialValues={{ status: "Pending", priority: "Medium" }}
          form={form}
        >
          <Form.Item
            name="roomNumber"
            label="Room Number"
            rules={[
              { required: true, message: "Please input the room number!" },
            ]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="taskName"
            label="Task Name"
            rules={[{ required: true, message: "Please select a task name" }]}
          >
            <Select placeholder="Select a task">
              <Option value="Cleaning">Cleaning</Option>
              <Option value="Room Service">Room Service</Option>
            </Select>
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker format="YYYY-MM-DD" required />
          </Form.Item>


          <Form.Item name="priority" label="Priority">
            <Select>
              <Option value="Low">Low</Option>
              <Option value="Medium">Medium</Option>
              <Option value="High">High</Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default Card;
