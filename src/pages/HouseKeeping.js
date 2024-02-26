import React, { useState, useEffect } from "react";
import {
  Card,
  Tag,
  Typography,
  Select,
  Input,
  Space,
  Form, Badge,
  Row,
  Col,
  Button,
  Modal,
  Popover,
  message, Tooltip,
  Tabs,
} from "antd";
import {
  UserOutlined,
  ClockCircleOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { EditOutlined, EllipsisOutlined, FlagOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const { TabPane } = Tabs;

const Housekeeping = (props) => {
  const [housekeepingTasks, setHousekeepingTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState({
    room: "",
    taskName: "",
    status: "",
    floor: "",
    priority: "",
  });
  const [roomOptions, setRoomOptions] = useState([]);

  useEffect(() => {
    console.log("Auth Token received in Frontdesk:", props.authToken);
  }, [props.authToken]);

  useEffect(() => {
    fetch("http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/task/getAll", {
      headers: {
        'Authorization': `Bearer ${props.authToken}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setHousekeepingTasks(data);
        setFilteredTasks(data);

        const roomNumbers = data.map((task) => task.roomNumber);
        const uniqueRoomNumbers = Array.from(new Set(roomNumbers));
        setRoomOptions(uniqueRoomNumbers);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        message.error("Error fetching data from the API");
      });
  }, [props.authToken]);

  useEffect(() => {
    const applyFilters = () => {
      const filtered = housekeepingTasks.filter((task) => {
        return Object.keys(filters).every((key) => {
          if (!filters[key]) return true; // If filter is not set, include all tasks
          if (key === 'room') {
            // Direct comparison for room number
            return task.roomNumber.toString() === filters[key].toString();
          } else {
            // Case insensitive comparison for other filters
            return task[key]?.toString().toLowerCase().includes(filters[key].toString().toLowerCase());
          }
        });
      });
      setFilteredTasks(filtered);
    };

    applyFilters();
  }, [filters, housekeepingTasks]);
  const fetchTasks = () => {
    fetch("http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/task/getAll", {
      headers: {
        'Authorization': `Bearer ${props.authToken}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setHousekeepingTasks(data);
        setFilteredTasks(data);

        const roomNumbers = data.map((task) => task.roomNumber);
        const uniqueRoomNumbers = Array.from(new Set(roomNumbers));
        setRoomOptions(uniqueRoomNumbers);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        message.error("Error fetching data from the API");
      });
  };
  useEffect(() => {
    fetchTasks(); // Initial fetch

    const intervalId = setInterval(() => {
      fetchTasks(); // Fetch tasks every 30 seconds
    }, 30000); // Adjust the interval as needed

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [props.authToken]);


  const handleStatusChange = async (task, newStatus) => {
    try {
      const currentDate = new Date().toISOString().split("T")[0];
      const requestBody = {
        roomNumber: task.roomNumber,
        status: newStatus || "Assigned",
        priority: task.priority || "Low",
        date: currentDate || null,
      };

      const response = await fetch(
        `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/task/editTask?taskId=${task.taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${props.authToken}`
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (response.ok) {
        const updatedTasks = housekeepingTasks.map((t) =>
          t.taskId === task.taskId
            ? { ...t, status: newStatus || "Assigned" }
            : t
        );
        setHousekeepingTasks(updatedTasks);
        setFilteredTasks(updatedTasks);
        message.success("Task status updated successfully");
      } else {
        console.error("Failed to update task status via API");
        message.error("Failed to update task status via API");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      message.error("Error updating task status");
    }
  };

  const handlePriorityChange = async (task, newPriority) => {
    try {
      const currentDate = new Date().toISOString().split("T")[0];
      const requestBody = {
        roomNumber: task.roomNumber,
        status: task.status || "Assigned",
        priority: newPriority || "Low",
        date: currentDate || null,
      };

      const response = await fetch(
        `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/task/editTask?taskId=${task.taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${props.authToken}`

          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const updatedTasks = housekeepingTasks.map((t) =>
          t.taskId === task.taskId
            ? { ...t, priority: newPriority || "Low" }
            : t
        );
        setHousekeepingTasks(updatedTasks);
        setFilteredTasks(updatedTasks);
        message.success("Task priority updated successfully");
      } else {
        console.error("Failed to update task priority via API");
        message.error("Failed to update task priority via API");
      }
    } catch (error) {
      console.error("Error updating task priority:", error);
      message.error("Error updating task priority");
    }
  };
  const handleClearFilters = () => {
    setFilters({
      room: "",
      taskName: "",
      status: "",
      floor: "",
      priority: "",
    });
  };






  const renderCard = (task) => {
    const cardBackgroundColor = getCardBackgroundColor(task.status);

    return (
      <Card
        key={task.taskId}
        style={{
          width: '100%',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          borderLeft: `8px solid ${getPriorityColor(task.priority)}`,
          marginBottom: '16px',
        }}
        hoverable
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#333" }}>Room {task.roomNumber}</p>
            <p style={{ margin: 0, color: "#888" }}>Customer: {task.customerName}</p>
            <p style={{ margin: 0, color: "#888" }}>Number of Guests: {task.numOfGuests}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Tag color={getPriorityColor(task.priority)}>{task.priority}</Tag>
            <Tag color={getStatusColor(task.status)}>{task.status}</Tag>
          </div>
        </div>
        <div style={{ marginTop: "12px" }}>
          <p style={{ margin: 0 }}>Task Name: {task.taskName}</p>
          <p style={{ margin: 0 }}>Check Out: {task.checkOutTime}</p>
          <p style={{ margin: 0 }}>Room Status: {task.roomStatus}</p>
        </div>
        <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
          <Popover
            content={
              <div>
                <Button type="link" onClick={() => handlePriorityChange(task, "High")}>High</Button>
                <Button type="link" onClick={() => handlePriorityChange(task, "Medium")}>Medium</Button>
                <Button type="link" onClick={() => handlePriorityChange(task, "Low")}>Low</Button>
              </div>
            }
            title="Change Priority"
            trigger="click"
          >
            <Button type="link">Change Priority</Button>
          </Popover>
          <Button
            type="primary"
            onClick={() => handleStatusChange(task, getNextStatus(task.status))}
            style={{ marginLeft: "8px" }}
          >
            {getNextStatusText(task.status)}
          </Button>
        </div>
      </Card>
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "green";
      default:
        return "default";
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "assigned":
        return "blue";
      case "work in progress":
        return "orange";
      case "completed":
        return "green";
      default:
        return "default";
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus.toLowerCase()) {
      case "assigned":
        return "Work in Progress";
      case "work in progress":
        return "Completed";
      case "completed":
        return "Assigned";
      default:
        return "Assigned";
    }
  };

  const getNextStatusText = (currentStatus) => {
    switch (currentStatus.toLowerCase()) {
      case "assigned":
        return "Mark as Work in Progress";
      case "work in progress":
        return "Mark as Completed";
      case "completed":
        return "Reopen";
      default:
        return "Mark as Work in Progress";
    }
  };

  const getCardBackgroundColor = (status) => {
    switch (status.toLowerCase()) {
      case "assigned":
        return "#F7F7F7"; // Light gray
      case "work in progress":
        return "#FFF3E0"; // Light orange
      case "completed":
        return "#E8F5E9"; // Light green
      default:
        return "#FFFFFF"; // White
    }
  };





  // const getStatusColor = (status) => {
  //   switch (status.toLowerCase()) {
  //     case "assigned":
  //       return "blue";
  //     case "work in progress":
  //       return "orange";
  //     case "completed":
  //       return "green";
  //     default:
  //       return "default";
  //   }
  // };


  // const getPriorityColor = (priority) => {

  //   const formattedPriority = priority.toLowerCase();

  //   switch (formattedPriority) {
  //     case "high":
  //       return "red";
  //     case "medium":
  //       return "orange";
  //     case "low":
  //       return "green";
  //     default:
  //       return "default";
  //   }
  // };


  const priorityOrder = {
    High: 1,
    Medium: 2,
    Low: 3,
  };

  const activeTasks = filteredTasks.filter((task) => task.status !== "Completed");
  const closedTasks = filteredTasks.filter((task) => task.status === "Completed");

  return (
    <div style={{ padding: "20px" }}>
      <Title level={3}>Housekeeping Tasks</Title>
      <Card
        style={{ marginBottom: "16px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", borderRadius: "8px" }}
      >
        <Form layout="vertical">
          <Row gutter={24}>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label="Room">
                <Select
                  placeholder="Select Room"
                  allowClear
                  value={filters.room}
                  onChange={(value) => setFilters((filters) => ({ ...filters, room: value }))}
                >
                  {roomOptions.map((roomNumber) => (
                    <Option key={roomNumber} value={roomNumber.toString()}>
                      Room {roomNumber}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Form.Item label="Task Name">
                <Select
                  placeholder="Select Task Name"
                  allowClear
                  value={filters.taskName}
                  onChange={(value) => setFilters((filters) => ({ ...filters, taskName: value }))}
                >
                  <Option value="Cleaning">Cleaning</Option>
                  <Option value="Room Service">Room Service</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label="Status">
                <Select
                  placeholder="Select Status"
                  allowClear
                  value={filters.status}
                  onChange={(value) => setFilters((filters) => ({ ...filters, status: value }))}
                >
                  <Option value="Assigned">Assigned</Option>
                  <Option value="Work In Progress">Work In Progress</Option>
                  <Option value="Completed">Completed</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label="Priority">
                <Select
                  placeholder="Select Priority"
                  allowClear
                  value={filters.priority}
                  onChange={(value) => setFilters((filters) => ({ ...filters, priority: value }))}
                >
                  <Option value="High">High</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="Low">Low</Option>
                </Select>
              </Form.Item>

              <Row justify="start" style={{ marginBottom: '16px' }}> {/* Remove any bottom margin if needed */}
                <Col flex="none"> {/* Use flex="none" to avoid taking extra space */}
                  <Button type="primary" onClick={handleClearFilters}>
                    Reset
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
          </Row>
        </Form>
      </Card>
      <Tabs defaultActiveKey="active" type="card">
        <TabPane tab="Active" key="active">
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1, paddingRight: '16px' }}> {/* Add paddingRight for spacing */}
              <Title level={4}>Room Service Tasks</Title>
              {activeTasks
                .filter(task => task.taskName === 'Room Service')
                .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
                .map(task => renderCard(task))}
            </div>
            <div style={{ flex: 1, paddingLeft: '16px' }}> {/* Add paddingLeft for spacing */}
              <Title level={4}>Cleaning Tasks</Title>
              {activeTasks
                .filter(task => task.taskName === 'Cleaning')
                .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
                .map(task => renderCard(task))}
            </div>
          </div>
        </TabPane>
        <TabPane tab="Closed" key="closed">
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1, paddingRight: '16px' }}> {/* Add paddingRight for spacing */}
              <Title level={4}>Room Service Tasks</Title>
              {closedTasks
                .filter(task => task.taskName === 'Room Service')
                .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
                .map(task => renderCard(task))}
            </div>
            <div style={{ flex: 1, paddingLeft: '16px' }}> {/* Add paddingLeft for spacing */}
              <Title level={4}>Cleaning Tasks</Title>
              {closedTasks
                .filter(task => task.taskName === 'Cleaning')
                .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
                .map(task => renderCard(task))}
            </div>
          </div>
        </TabPane>
      </Tabs>

    </div>
  );
};

export default Housekeeping;



// import React, { useState, useEffect } from "react";
// import {
//   Card,
//   Tag,
//   Typography,
//   Select,
//   Row,
//   Col,
//   Button,
//   Popover,
//   message,
//   Tabs,
// } from "antd";

// const { Title } = Typography;
// const { Option } = Select;
// const { TabPane } = Tabs;

// const Housekeeping = (props) => {
//   const [housekeepingTasks, setHousekeepingTasks] = useState([]);
//   const [filteredTasks, setFilteredTasks] = useState([]);
//   const [filters, setFilters] = useState({
//     room: "",
//     taskName: "",
//     status: "",
//     floor: "",
//     priority: "",
//   });
//   const [roomOptions, setRoomOptions] = useState([]);

//   useEffect(() => {
//     fetchTasks();
//     const intervalId = setInterval(fetchTasks, 30000);
//     return () => clearInterval(intervalId);
//   }, [props.authToken]);

//   const fetchTasks = async () => {
//     try {
//       const response = await fetch("http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/task/getAll", {
//         headers: {
//           'Authorization': `Bearer ${props.authToken}`
//         }
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setHousekeepingTasks(data);
//         setFilteredTasks(data);

//         const roomNumbers = data.map((task) => task.roomNumber);
//         const uniqueRoomNumbers = Array.from(new Set(roomNumbers));
//         setRoomOptions(uniqueRoomNumbers);
//       } else {
//         console.error("Error fetching data:", response.statusText);
//         message.error("Error fetching data from the API");
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       message.error("Error fetching data from the API");
//     }
//   };

//   useEffect(() => {
//     const applyFilters = () => {
//       const filtered = housekeepingTasks.filter((task) => {
//         return Object.keys(filters).every((key) => {
//           if (!filters[key]) return true;
//           if (key === 'room') {
//             return task.roomNumber.toString() === filters[key].toString();
//           } else {
//             return task[key]?.toString().toLowerCase().includes(filters[key].toString().toLowerCase());
//           }
//         });
//       });
//       setFilteredTasks(filtered);
//     };
//     applyFilters();
//   }, [filters, housekeepingTasks]);

//   const handleStatusChange = async (task, newStatus) => {
//     try {
//       const currentDate = new Date().toISOString().split("T")[0];
//       const requestBody = {
//         roomNumber: task.roomNumber,
//         status: newStatus || "Assigned",
//         priority: task.priority || "Low",
//         date: currentDate || null,
//       };

//       const response = await fetch(
//         `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/task/editTask?taskId=${task.taskId}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             'Authorization': `Bearer ${props.authToken}`
//           },
//           body: JSON.stringify(requestBody),
//         },
//       );

//       if (response.ok) {
//         const updatedTasks = housekeepingTasks.map((t) =>
//           t.taskId === task.taskId
//             ? { ...t, status: newStatus || "Assigned" }
//             : t
//         );
//         setHousekeepingTasks(updatedTasks);
//         setFilteredTasks(updatedTasks);
//         message.success("Task status updated successfully");
//       } else {
//         console.error("Failed to update task status via API");
//         message.error("Failed to update task status via API");
//       }
//     } catch (error) {
//       console.error("Error updating task status:", error);
//       message.error("Error updating task status");
//     }
//   };

//   const handlePriorityChange = async (task, newPriority) => {
//     try {
//       const currentDate = new Date().toISOString().split("T")[0];
//       const requestBody = {
//         roomNumber: task.roomNumber,
//         status: task.status || "Assigned",
//         priority: newPriority || "Low",
//         date: currentDate || null,
//       };

//       const response = await fetch(
//         `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/task/editTask?taskId=${task.taskId}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             'Authorization': `Bearer ${props.authToken}`

//           },
//           body: JSON.stringify(requestBody),
//         }
//       );

//       if (response.ok) {
//         const updatedTasks = housekeepingTasks.map((t) =>
//           t.taskId === task.taskId
//             ? { ...t, priority: newPriority || "Low" }
//             : t
//         );
//         setHousekeepingTasks(updatedTasks);
//         setFilteredTasks(updatedTasks);
//         message.success("Task priority updated successfully");
//       } else {
//         console.error("Failed to update task priority via API");
//         message.error("Failed to update task priority via API");
//       }
//     } catch (error) {
//       console.error("Error updating task priority:", error);
//       message.error("Error updating task priority");
//     }
//   };

//   const handleClearFilters = () => {
//     setFilters({
//       room: "",
//       taskName: "",
//       status: "",
//       floor: "",
//       priority: "",
//     });
//   };

//   const renderCard = (task) => (
//     <Card
//       key={task.taskId}
//       style={{
//         width: "100%",
//         boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
//         borderRadius: "8px",
//         borderLeft: `8px solid ${getPriorityColor(task.priority)}`,
//         marginBottom: "16px",
//       }}
//       hoverable
//     >
//        <Row gutter={16}>
//          <Col span={6} style={{ marginBottom: "16px" }}>
//                      <Tag color="blue">Task ID:</Tag> {task.taskId}
//          </Col>
//          <Col span={6} style={{ marginBottom: "16px" }}>
//            <Tag color="geekblue">Customer:</Tag> {task.customerName}
//          </Col>
//          <Col span={6} style={{ marginBottom: "16px" }}>
//            <Tag color="magenta">Number of Guests:</Tag> {task.numOfGuests}
//          </Col>
//          <Col span={6} style={{ marginBottom: "16px" }}>
//            <Tag color="volcano">Room Number:</Tag> Room {task.roomNumber}
//          </Col>
//       </Row>
//        <Row gutter={16}>
//          <Col span={6} style={{ marginBottom: "16px" }}>
//            <Tag color="purple">Task Name:</Tag> {task.taskName}
//          </Col>
//          <Col span={6} style={{ marginBottom: "16px" }}>
//            <Tag color="cyan">Check Out:</Tag> {task.checkOutTime}
//          </Col>
//          <Col span={6} style={{ marginBottom: "16px" }}>
//            <Tag color="gold">Room Status:</Tag> {task.roomStatus}
//          </Col>
//         <Col span={6} style={{ marginBottom: "16px" }}>
//            <div style={{ display: "flex", alignItems: "center" }}>
//              <Tag
//               color={getPriorityColor(task.priority)}
//               style={{ marginRight: "8px" }}
//             >
//               {task.priority}
//             </Tag>
//             <Tag>{task.status}</Tag>
//           </div>
//           <div style={{ marginTop: "16px" }}>
//             {task.status === "Assigned" && (
//               <Button
//                 type="primary"
//                 onClick={() => handleStatusChange(task, "Work in Progress")}
//                 style={{ marginRight: "8px" }}
//               >
//                 Mark as Work in Progress
//               </Button>
//             )}
//             {task.status === "Work in Progress" && (
//               <Button
//                 type="primary"
//                 onClick={() => handleStatusChange(task, "Completed")}
//                 style={{ marginRight: "8px" }}
//               >
//                 Mark as Completed
//               </Button>
//             )}
//             {task.status === "Completed" && (
//               <Button
//                 type="primary"
//                 onClick={() => handleStatusChange(task, "Assigned")}
//                 style={{ marginRight: "8px" }}
//               >
//                 Reopen
//               </Button>
//             )}
//             <Popover
//               content={
//                 <div>
//                   <Button
//                     type="link"
//                     onClick={() => handlePriorityChange(task, "High")}
//                   >
//                     High
//                   </Button>
//                   <Button
//                     type="link"
//                     onClick={() => handlePriorityChange(task, "Medium")}
//                   >
//                     Medium
//                   </Button>
//                   <Button
//                     type="link"
//                     onClick={() => handlePriorityChange(task, "Low")}
//                   >
//                     Low
//                   </Button>
//                 </div>
//               }
//               title="Change Priority"
//               trigger="click"
//             >
//               <Button type="link">Change Priority</Button>
//             </Popover>
//           </div>
//         </Col>
//       </Row>
//     </Card>   
//   );

//   const getPriorityColor = (priority) => {
//     const formattedPriority = priority.toLowerCase();
//     switch (formattedPriority) {
//       case "high":
//         return "red";
//       case "medium":
//         return "orange";
//       case "low":
//         return "green";
//       default:
//         return "default";
//     }
//   };

//   const priorityOrder = {
//     High: 1,
//     Medium: 2,
//     Low: 3,
//   };

//   const activeTasks = filteredTasks.filter((task) => task.status !== "Completed");
//   const closedTasks = filteredTasks.filter((task) => task.status === "Completed");

//   return (
//     <div>
//       <Title level={3}>Housekeeping Tasks</Title>
//       <Tabs defaultActiveKey="active" type="card">
//         <TabPane tab="Active" key="active">
//           <div style={{ display: 'flex' }}>
//             <div style={{ flex: 1 }}>
//               <Title level={4}>Room Service Tasks</Title>
//               {activeTasks
//                 .filter(task => task.taskName === 'Room Service')
//                 .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
//                 .map(task => renderCard(task))}
//             </div>
//             <div style={{ flex: 1 }}>
//               <Title level={4}>Cleaning Tasks</Title>
//               {activeTasks
//                 .filter(task => task.taskName === 'Cleaning')
//                 .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
//                 .map(task => renderCard(task))}
//             </div>
//           </div>
//         </TabPane>
//         <TabPane tab="Closed" key="closed">
//           {closedTasks.map((task) => renderCard(task))}
//         </TabPane>
//       </Tabs>
//     </div>
//   );
// };

// export default Housekeeping;