import React, { useState, useEffect } from "react";
import { Table, Button, Space, Input, Typography, Tabs } from "antd";
import {
    EditOutlined,
    SaveOutlined,
    CloseOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const { TabPane } = Tabs;

function RoomType({ authToken }) {
    const [roomDataSource, setRoomDataSource] = useState([]);
    const [addonDataSource, setAddonDataSource] = useState([]);
    const [roomEditingKey, setRoomEditingKey] = useState("");
    const [addonEditingKey, setAddonEditingKey] = useState("");
    const [editedRoomPrice, setEditedRoomPrice] = useState("");
    const [editedAddonPrice, setEditedAddonPrice] = useState("");
    const [gstData, setGstData] = useState(null);
    const [isGstDataFetched, setIsGstDataFetched] = useState(false);
    const [editedGstValue, setEditedGstValue] = useState('');
    const [gstEditingKey, setGstEditingKey] = useState("");
    const [gstRefreshKey, setGstRefreshKey] = useState(0);
    const [editedGstValues, setEditedGstValues] = useState({});


    useEffect(() => {
        const fetchRoomConfig = async () => {
            try {
                const response = await fetch(
                    "http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomConfig/getAll",
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    const transformedData = data.map((item, index) => ({
                        key: `${index + 1}`,
                        name: item.roomType,
                        price: `₹${parseFloat(item.costPerDay).toFixed(2)}`,
                        amenities: item.amenities,
                    }));
                    setRoomDataSource(transformedData);
                } else {
                    console.error("Failed to fetch room configuration");
                }
            } catch (error) {
                console.error("Error fetching room configuration:", error);
            }
        };

        const fetchAddonConfig = async () => {
            try {
                const response = await fetch(
                    "http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/addOns/getAll",
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    const transformedData = data.map((item, index) => ({
                        key: `${index + 1}`,
                        name: item.name,
                        price: `₹${parseFloat(item.cost).toFixed(2)}`,
                    }));
                    setAddonDataSource(transformedData);
                } else {
                    console.error("Failed to fetch add-on configuration");
                }
            } catch (error) {
                console.error("Error fetching add-on configuration:", error);
            }
        };

        fetchRoomConfig();
        fetchAddonConfig();
    }, [authToken]);

    const isRoomEditing = (record) => record.key === roomEditingKey;
    const isAddonEditing = (record) => record.key === addonEditingKey;

    const handleRoomEdit = (record) => {
        setRoomEditingKey(record.key);
        setEditedRoomPrice(record.price);
    };

    const handleAddonEdit = (record) => {
        setAddonEditingKey(record.key);
        setEditedAddonPrice(record.price);
    };

    //
    const handleGstEdit = (record) => {
        setGstEditingKey(record.key);
        const gstValue = editedGstValues[record.key] || '';
        setEditedGstValues({ ...editedGstValues, [record.key]: gstValue });
    };
    

    //   const handleGstSave = async (key) => {
    //     // Logic to save the edited GST value
    //     setGstEditingKey("");
    //   };

    const handleGstCancel = () => {
        setGstEditingKey("");
    };

    //
    const handleRoomSave = async (key) => {
        const editedRow = roomDataSource.find((item) => item.key === key);
        const newPrice = editedRoomPrice.replace(/₹|,/g, "");
        const newData = [...roomDataSource];
        const index = newData.findIndex((item) => key === item.key);

        if (index > -1) {
            const item = newData[index];
            item.price = `₹${newPrice}`;
            setRoomDataSource(newData);
            setRoomEditingKey("");

            try {
                const response = await fetch(
                    `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/roomConfig/updateCost?roomType=${encodeURIComponent(
                        item.name
                    )}&costString=${encodeURIComponent(newPrice)}`,
                    {
                        method: "PUT",
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );

                if (response.ok) {
                    console.log(`Price updated for ${item.name}: ₹${newPrice}`);
                } else {
                    console.error("Failed to update room price");
                }
            } catch (error) {
                console.error("API call error:", error);
            }
        }
    };

    const handleAddonSave = async (key) => {
        const editedRow = addonDataSource.find((item) => item.key === key);
        const newPrice = editedAddonPrice.replace(/₹|,/g, "");
        const newData = [...addonDataSource];
        const index = newData.findIndex((item) => key === item.key);

        if (index > -1) {
            const item = newData[index];
            item.price = `₹${newPrice}`;
            setAddonDataSource(newData);
            setAddonEditingKey("");

            try {
                const response = await fetch(
                    `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/addOns/updateCost?addOnName=${encodeURIComponent(
                        item.name
                    )}&newCost=${encodeURIComponent(newPrice)}`,
                    {
                        method: "PUT",
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );

                if (response.ok) {
                    console.log(`Price updated for ${item.name}: ₹${newPrice}`);
                } else {
                    console.error("Failed to update add-on price");
                }
            } catch (error) {
                console.error("API call error:", error);
            }
        }
    };

    const handleRoomCancel = () => {
        setRoomEditingKey("");
    };

    const handleAddonCancel = () => {
        setAddonEditingKey("");
    };

    const fetchGstData = async () => {
        try {
            const response = await fetch("http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/gst/getAll", {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
    
            if (response.ok) {
                const gstDataResponse = await response.json();
                const transformedData = Object.entries(gstDataResponse.gst).map(([label, value], index) => ({
                    key: `${index + 1}`,
                    label: label,
                    value: `${value}%`,
                }));
                setGstData(transformedData);
                setIsGstDataFetched(true); // Ensure this state is updated to prevent re-fetching
            } else {
                console.error("Failed to fetch GST data");
            }
        } catch (error) {
            console.error("Error fetching GST data:", error);
        }
    };
    
    const handleTabChange = (key) => {
        if (key === "3" && !isGstDataFetched) {
            fetchGstData();
        }
    };

    const handleGstSave = async (key) => {
        const category = gstData.find(item => item.key === key)?.label;
        const newGstValue = editedGstValues[key].replace('%', '');
    
        // Determine the API parameter value for 'name' based on the category label
        let apiCategoryName = '';
        if (category.includes("Above 7500")) {
            apiCategoryName = 'above';
        } else if (category.includes("Below 7500")) {
            apiCategoryName = 'below';
        }
    
        try {
            const response = await fetch(`http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/gst/edit?name=${encodeURIComponent(apiCategoryName)}&newGst=${encodeURIComponent(newGstValue)}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
    
            if (response.ok) {
                const responseText = await response.text();
                if (responseText === 'Gst updated!') {
                    console.log(`GST updated successfully for category: ${category}`);
                    fetchGstData(); // Refresh the GST data
                    setGstEditingKey(""); // Reset the editing key
                    setEditedGstValues({}); // Clear the edited GST values
                } else {
                    console.error(`Failed to update GST rate for category: ${category}`);
                }
            } else {
                console.error(`Failed to update GST rate for category: ${category}`);
            }
        } catch (error) {
            console.error(`Error updating GST rate for category: ${category}, error:`, error);
        }
    };
    
    
    const gstColumns = [
        // Other column definitions remain the same
        {
            title: "Label",
            dataIndex: "label",
            key: "label",
            render: text => text,  
        },
        {
            title: "Value",
            dataIndex: "value",
            key: "value",
            render: (text, record) => {
                if (record.key === gstEditingKey) {
                    return (
                        <Input
                            value={editedGstValues[record.key]}
                            onChange={(e) => setEditedGstValues({ ...editedGstValues, [record.key]: e.target.value })}
                        />
                    );
                }
                return text;
            },
            
        },
        {
            title: "Action",
            key: "action",
            render: (text, record) => {
                const isEditing = record.key === gstEditingKey;
                return isEditing ? (
                    <Space size="middle">
                        <Button onClick={() => handleGstSave(record.key)} type="primary">Save</Button>
                        <Button onClick={handleGstCancel} type="default">Cancel</Button>
                    </Space>
                ) : (
                    <Button onClick={() => handleGstEdit(record)} type="primary">Edit</Button>
                );
            },
        },
    ];


    const roomColumns = [
        {
            title: "Room Type",
            dataIndex: "name",
            key: "name",
            width: "40%",
        },
        {
            title: "Price (INR)",
            dataIndex: "price",
            key: "price",
            render: (text, record) => {
                if (isRoomEditing(record)) {
                    return (
                        <Input
                            value={editedRoomPrice}
                            onChange={(e) => setEditedRoomPrice(e.target.value)}
                            onPressEnter={() => handleRoomSave(record.key)}
                            onBlur={() => handleRoomSave(record.key)}
                        />
                    );
                }
                return text;
            },
            width: "40%",
        },
        {
            title: "Action",
            key: "action",
            render: (text, record) => {
                const isCurrentlyEditing = isRoomEditing(record);
                return (
                    <Space size="middle">
                        {isCurrentlyEditing ? (
                            <>
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={() => handleRoomSave(record.key)}
                                />
                                <Button
                                    type="default"
                                    icon={<CloseOutlined />}
                                    onClick={handleRoomCancel}
                                />
                            </>
                        ) : (
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => handleRoomEdit(record)}
                            >
                                Edit
                            </Button>
                        )}
                    </Space>
                );
            },
            width: "20%",
        },
    ];

    const addonColumns = [
        {
            title: "Add-on Name",
            dataIndex: "name",
            key: "name",
            width: "40%",
        },
        {
            title: "Price (INR)",
            dataIndex: "price",
            key: "price",
            render: (text, record) => {
                if (isAddonEditing(record)) {
                    return (
                        <Input
                            value={editedAddonPrice}
                            onChange={(e) => setEditedAddonPrice(e.target.value)}
                            onPressEnter={() => handleAddonSave(record.key)}
                            onBlur={() => handleAddonSave(record.key)}
                        />
                    );
                }
                return text;
            },
            width: "40%",
        },
        {
            title: "Action",
            key: "action",
            render: (text, record) => {
                const isCurrentlyEditing = isAddonEditing(record);
                return (
                    <Space size="middle">
                        {isCurrentlyEditing ? (
                            <>
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={() => handleAddonSave(record.key)}
                                />
                                <Button
                                    type="default"
                                    icon={<CloseOutlined />}
                                    onClick={handleAddonCancel}
                                />
                            </>
                        ) : (
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => handleAddonEdit(record)}
                            >
                                Edit
                            </Button>
                        )}
                    </Space>
                );
            },
            width: "20%",
        },
    ];

    return (
        <div className="room-type-container">
            <Title level={3}>Hotel Room Types</Title>
            {/* //<Tabs defaultActiveKey="1"> */}
            <Tabs defaultActiveKey="1" onChange={handleTabChange}>

                <TabPane tab="Room Pricing" key="1">
                    <Table
                        dataSource={roomDataSource}
                        columns={roomColumns}
                        pagination={false}
                        rowClassName={(record) => (isRoomEditing(record) ? "editing-row" : "")}
                    />
                </TabPane>
                <TabPane tab="Add-ons Pricing" key="2">
                    <Table
                        dataSource={addonDataSource}
                        columns={addonColumns}
                        pagination={false}
                        rowClassName={(record) =>
                            isAddonEditing(record) ? "editing-row" : ""
                        }
                    />
                </TabPane>
                <TabPane tab="GST Pricing" key="3">
                    <Table
                        key={gstRefreshKey}
                        dataSource={gstData}
                        columns={gstColumns}
                        pagination={false}
                    />
                </TabPane>
            </Tabs>
        </div>
    );
}

export default RoomType;