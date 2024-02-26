import React, { useState, useEffect } from "react";
import { Drawer, Form, Input, Select, Button, message } from "antd";

const { Option } = Select;

function AddRoom({ onClose, onSave, props, editRoomData }) {
  console.log(props)
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(true);

  const drawerTitle = editRoomData && Object.keys(editRoomData).length > 0 ? "Edit Room" : "Add Room";

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        const isEditing = editRoomData && Object.keys(editRoomData).length > 0;
        const url = isEditing
          ? `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/rooms/editRoom?roomNumber=${editRoomData.roomNumber}`
          : "http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/rooms/add";

        const method = isEditing ? "PUT" : "PUT";

        fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${props.authToken}`,
          },
          body: JSON.stringify(values),
        })
          .then((response) => {
            if (response.ok) {
              console.log(response)
              message.success(`Room updated successfully`);
              onClose()
              return response.text();
            }
            throw new Error('Network response was not ok.');
          })
          
          .catch((error) => {
            console.error("Error:", error);
          });
      })
      
  };

  useEffect(() => {
    if (editRoomData && Object.keys(editRoomData).length > 0) {
      form.setFieldsValue({
        roomNumber: editRoomData.roomNumber,
        bed: editRoomData.bed,
        floor: editRoomData.floor,
        status: editRoomData.roomStatus,
        roomType: editRoomData.roomType,
        view: editRoomData.view,
        bathroom: editRoomData.bathroom,
      });
    } else {
      form.resetFields();
    }
  }, [editRoomData, form, visible]);


  return (
    <Drawer
      title={drawerTitle}
      placement="right"
      onClose={onClose}
      visible={visible}
      width={400}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button onClick={handleSave} type="primary">
            Save
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        name="addRoomForm"
        initialValues={{
          roomNumber: "",
          bed: "",
          floor: "1",
          status: "",
          roomType: "AC",
          view: "Parking",
          bathroom: "Indian",
        }}
      >
        <Form.Item
          name="roomNumber"
          label="Room Number"
          rules={[
            {
              required: true,
              message: "Please enter room number!",
            },
          ]}
        >
          <Input placeholder="Enter room number" />
        </Form.Item>

        <Form.Item
          name="bed"
          label="Bed Type"
          initialValue="Queen"
          rules={[
            {
              required: true,
              message: "Please select bed type!",
            },
          ]}
        >
          <Select>
            <Option value="Queen">Queen</Option>
            <Option value="Twin">Twin</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="floor"
          label="Room Floor"
          initialValue="1"
          rules={[
            {
              required: true,
              message: "Please select room floor!",
            },
          ]}
        >
          <Select>
            <Option value="1">1</Option>
            <Option value="2">2</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[
            {
              required: true,
              message: "Please enter status!",
            },
          ]}
        >
          <Select >
            <Option value="vacant">Vacant</Option>
            <Option value="out of order">Out of order</Option>
          </Select>        
          </Form.Item>
        <Form.Item
          name="roomType"
          label="Room Type"
          initialValue="AC"
          rules={[
            {
              required: true,
              message: "Please select room type!",
            },
          ]}
        >
          <Select>
            <Option value="AC">AC</Option>
            <Option value="Non AC">Non AC</Option>
            <Option value="Deluxe">Deluxe</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="view"
          label="View Type"
          initialValue="Parking"
          rules={[
            {
              required: true,
              message: "Please select view type!",
            },
          ]}
        >
          <Select>
            <Option value="Parking">Parking</Option>
            <Option value="City">City</Option>
            <Option value="Balcony">Balcony</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="bathroom"
          label="Bathroom Type"
          initialValue="Indian"
          rules={[
            {
              required: true,
              message: "Please select bathroom type!",
            },
          ]}
        >
          <Select>
            <Option value="Indian">Indian</Option>
            <Option value="Western">Western</Option>
          </Select>
        </Form.Item>
      </Form>
    </Drawer>
  );
}

export default AddRoom;