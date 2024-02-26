import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { Table, Input, Button, Popover, Card, Switch, Tabs } from 'antd';
import { DownloadOutlined, FileTextOutlined } from '@ant-design/icons';

const { Column } = Table;
const { Meta } = Card;
const { TabPane } = Tabs;

const Ledger = (props) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const [filteredGroupData, setFilteredGroupData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [viewType, setViewType] = useState('table');
  const history = useHistory();

  useEffect(() => {
    axios
      .get('http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getPendingBills', {
        headers: {
          'Authorization': `Bearer ${props.authToken}`,
        },
      })
      .then((response) => {
        const aggregatedData = aggregateData(response.data);
        setData(aggregatedData);
        setFilteredData(aggregatedData);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [props.authToken]);

  useEffect(() => {
    axios
      .get('http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getPendingBillsForGroup', {
        headers: {
          'Authorization': `Bearer ${props.authToken}`,
        },
      })
      .then((response) => {
        const aggregatedGroupData = aggregateGroupData(response.data);
        setGroupData(aggregatedGroupData);
        setFilteredGroupData(aggregatedGroupData);
      })
      .catch((error) => {
        console.error('Error fetching group bookings:', error);
      });
  }, [props.authToken]);

  useEffect(() => {
    if (searchText === '') {
      setFilteredData(data);
      setFilteredGroupData(groupData);
    } else {
      const filtered = data.filter((item) =>
        item.customerName.toLowerCase().includes(searchText.toLowerCase())
      );
      const filteredGroup = groupData.filter((item) =>
        item.customerName.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredData(filtered);
      setFilteredGroupData(filteredGroup);
    }
  }, [searchText, data, groupData]);

  const aggregateData = (data) => {
    const aggregated = {};
    data.forEach((item) => {
      if (aggregated[item.customerName]) {
        aggregated[item.customerName].totalPendingAmount += item.pendingAmt;
        aggregated[item.customerName].bookings.push(item.bookingId);
      } else {
        aggregated[item.customerName] = {
          customerName: item.customerName,
          phone: item.phone,
          totalPendingAmount: item.pendingAmt,
          bookings: [item.bookingId],
        };
      }
    });
    return Object.values(aggregated);
  };

  const aggregateGroupData = (data) => {
    const aggregated = {};
    data.forEach((item) => {
      if (aggregated[item.groupId]) {
        aggregated[item.groupId].totalPendingAmount += item.pendingAmt;
      } else {
        aggregated[item.groupId] = {
          customerName: item.customerName,
          phone: item.phone,
          totalPendingAmount: item.pendingAmt,
          groupId: item.groupId
        };
      }
    });
    return Object.values(aggregated);
  };

  const navigateToBooking = (bookingId, isGroupBooking = false) => {
    if (isGroupBooking) {
      history.push(`/groupBookingConfirmation`, { groupId: bookingId });
    } else {
      history.push(`/bookingConfirmation`, { bookingId: bookingId });
    }
  };

  const renderPendingAmount = (text) => {
    const amount = parseFloat(text);
    const isPositive = amount > 0;
    return (
      <span style={{ color: isPositive ? '#f5222d' : '#52c41a', fontWeight: 'bold' }}>
        {isPositive ? '+' : '-'} ₹{Math.abs(amount).toFixed(2)}
      </span>
    );
  };

  const toggleView = (checked) => {
    setViewType(checked ? 'cards' : 'table');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>Pending Bills</h1>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Single Bookings" key="1">
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
            <Input.Search
              placeholder="Search by customer name"
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300, marginRight: 16 }}
            />
            <Switch
              checkedChildren="Cards"
              unCheckedChildren="Table"
              checked={viewType === 'cards'}
              onChange={toggleView}
            />
          </div>
          {viewType === 'table' ? (
            <Table dataSource={filteredData} pagination={false}>
              <Column title="Customer Name" dataIndex="customerName" key="customerName" />
              <Column title="Phone" dataIndex="phone" key="phone" />
              <Column
                title="Pending Amount"
                dataIndex="totalPendingAmount"
                key="totalPendingAmount"
                render={renderPendingAmount}
              />
              <Column
                title="Booking Count"
                key="bookings"
                render={(text, record) => (
                  <span>{record.bookings.length}</span>
                )}
              />
              <Column
                title="Actions"
                key="actions"
                render={(text, record) => (
                  <Popover
                    title={`Bookings for ${record.customerName}`}
                    content={
                      <div>
                        {record.bookings.map((bookingId) => (
                          <p
                            key={bookingId}
                            onClick={() => navigateToBooking(bookingId)}
                            style={{ cursor: 'pointer', margin: 0 }}
                          >
                            <FileTextOutlined /> Booking {bookingId}
                          </p>
                        ))}
                      </div>
                    }
                    trigger="click"
                  >
                    <Button type="link">View Bookings</Button>
                  </Popover>
                )}
              />
            </Table>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {filteredData.map((record) => (
                <Card
                  key={record.customerName}
                  style={{ width: 300, margin: '10px' }}
                  actions={[
                    <Popover
                      title={`Bookings for ${record.customerName}`}
                      content={
                        <div>
                          {record.bookings.map((bookingId) => (
                            <p
                              key={bookingId}
                              onClick={() => navigateToBooking(bookingId)}
                              style={{ cursor: 'pointer', margin: 0 }}
                            >
                              <FileTextOutlined /> Booking {bookingId}
                            </p>
                          ))}
                        </div>
                      }
                      trigger="click"
                    >
                      <Button type="link">View Bookings</Button>
                    </Popover>
                  ]}
                >
                  <Meta
                    title={record.customerName}
                    description={`Phone: ${record.phone}`}
                  />
                  <p>
                    <strong>Pending Amount: </strong>
                    {renderPendingAmount(record.totalPendingAmount)}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </TabPane>
        <TabPane tab="Group Bookings" key="2">
          {/* Adjust this section to display group bookings in your preferred format */}
          {/* This example uses a similar layout to single bookings for consistency */}
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
            <Input.Search
              placeholder="Search by customer name"
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300, marginRight: 16 }}
            />
            <Switch
              checkedChildren="Cards"
              unCheckedChildren="Table"
              checked={viewType === 'cards'}
              onChange={toggleView}
            />
          </div>
          {viewType === 'table' ? (
            <Table dataSource={filteredGroupData} pagination={false}>
              <Column title="Customer Name" dataIndex="customerName" key="customerName" />
              <Column title="Phone" dataIndex="phone" key="phone" />
              <Column
                title="Pending Amount"
                dataIndex="totalPendingAmount"
                key="totalPendingAmount"
                render={renderPendingAmount}
              />
              <Column
                title="Group ID"
                dataIndex="groupId"
                key="groupId"
              />
              <Column
                title="Actions"
                key="actions"
                render={(text, record) => (
                  <Button onClick={() => navigateToBooking(record.groupId, true)}>View Group</Button>
                )}
              />
            </Table>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {filteredGroupData.map((record) => (
                <Card
                  key={record.groupId}
                  style={{ width: 300, margin: '10px' }}
                  actions={[
                    <Button onClick={() => navigateToBooking(record.groupId, true)}>View Group</Button>
                  ]}
                >
                  <Meta
                    title={`Group ID: ${record.groupId}`}
                    description={`Customer: ${record.customerName} - Phone: ${record.phone}`}
                  />
                  <p>
                    <strong>Pending Amount: </strong>
                    {renderPendingAmount(record.totalPendingAmount)}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Ledger;
