import React, { useRef, useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Typography,
  Divider,
  Select,
} from "antd";
import { Table } from 'antd';
import './ViewBookings.css'; // Assume you create a CSS file for additional styles

import moment from "moment";
import {
  PrinterOutlined,
  DownloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import ReactToPrint from "react-to-print";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useLocation } from "react-router-dom";
const { Title, Paragraph } = Typography;
import BillingSummary from "./BillingSummary";
const { Option } = Select;

const Invoice = (props) => {
  const [form] = Form.useForm();
  const [invoiceData, setInvoiceData] = useState({
    invoiceId: "",
    date: null,
    name: "",
    email: "",
    address: "",
    phone: "",
    checkInDate: null,
    checkOutDate: null,
    taxId: "",
    items: [], // Ensure this is always an array
  });
  // Correct instantiation of moment for initial form values

  const [pendingAmt, setPendingAmt] = useState(0); // Initialize with a default value

  const componentRef = useRef();
  const location = useLocation();

  const { customerId } = location.state || {};
  const onValuesChange = (_, allValues) => {
    setInvoiceData((prevData) => ({
      ...prevData,
      ...allValues,
    }));
  };

  const { bookingId } = location.state || {};
  const [billingSummary, setBillingSummary] = useState(null);
  const handleDownloadPdf = async () => {
    const printAndDownloadButtons = document.querySelectorAll('.no-print');
    printAndDownloadButtons.forEach(button => {
      button.style.visibility = 'hidden';
    });

    // Optionally, apply print styles manually if needed
    document.body.classList.add("apply-print-styles");

    const element = componentRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      width: element.offsetWidth,
      height: element.offsetHeight,
    });

    const data = canvas.toDataURL("image/png");

    // Initialize jsPDF with orientation, unit, and format
    let pdf = new jsPDF("p", "mm", "a4");
    let pageWidth = pdf.internal.pageSize.getWidth();
    let pageHeight = pdf.internal.pageSize.getHeight();

    // Define margins (e.g., 10mm on each side)
    const marginLeft = 10;
    const marginRight = 10;

    // Calculate the content width by subtracting margins
    let contentWidth = pageWidth - marginLeft - marginRight;

    // Calculate the scaled image height to maintain the aspect ratio
    let imgHeight = canvas.height * contentWidth / canvas.width;

    // Ensure the content fits vertically; if not, adjust contentWidth and imgHeight
    if (imgHeight > pageHeight) {
      imgHeight = pageHeight;
      contentWidth = canvas.width * imgHeight / canvas.height;
    }

    pdf.addImage(data, "PNG", marginLeft, 0, contentWidth, imgHeight);
    pdf.save("invoice.pdf");

    // Restore visibility of buttons after capturing
    printAndDownloadButtons.forEach(button => {
      button.style.visibility = '';
    });

    // Remove print styles if added
    document.body.classList.remove("apply-print-styles");
  };


  const addItem = (description, rate) => {
    const newItem = {
      description,
      quantity: 1,
      rate,
      amount: rate,
    };

    setInvoiceData((prevData) => ({
      ...prevData,
      items: [...prevData.items, newItem],
    }));
  };

  const removeItem = (index) => {
    setInvoiceData((prevData) => {
      const updatedItems = prevData.items.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...prevData,
        items: updatedItems,
      };
    });
  };
  useEffect(() => {
    // Check if state exists and has the required properties
    if (location.state && location.state.checkInDate && location.state.checkOutDate && location.state.customerName) {
      let { checkInDate, checkOutDate, customerName } = location.state;

      // Convert string date values to moment objects
      checkInDate = moment(checkInDate); // Assuming checkInDate is a string
      checkOutDate = moment(checkOutDate); // Assuming checkOutDate is a string

      // Now it's safe to set form values
      form.setFieldsValue({
        checkInDate,
        checkOutDate,
        name: customerName,
        // Set any other field values as needed
      });
    }
  }, [location, form]);


  const calculateTotalAmount = () => {
    // Ensure items is treated as an array even if it's undefined
    const itemsWithAmount = (invoiceData.items || []).map((item) => {
      const quantity = item.quantity || 0;
      const rate = item.rate || 0;
      return {
        ...item,
        amount: quantity * rate,
      };
    });

    return itemsWithAmount.reduce((sum, item) => sum + item.amount, 0);
  };

  useEffect(() => {
    if (bookingId) {
      fetchBillingSummary(bookingId);
    }
  }, [bookingId]);
  useEffect(() => {
    // Check if state exists and has the required properties
    if (location.state && location.state.checkInDate && location.state.checkOutDate && location.state.customerName) {
      const { checkInDate, checkOutDate, customerName } = location.state;

      form.setFieldsValue({
        checkInDate: moment(checkInDate), // Assuming you're using moment.js for date handling
        checkOutDate: moment(checkOutDate),
        name: customerName,
        // Set any other field values as needed
      });
    }
  }, [location, form]);


  const fetchBillingSummary = async (id) => {
    try {
      const response = await fetch(
        `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/reservation/getSummary?bookingId=${id}`,
        {
          headers: {
            'Authorization': `Bearer ${props.authToken}`
          }
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      // Extract necessary data from the API response
      const { roomTotal, gstAmount, checkIn, checkOut, addOnTotal, discount, addOnMap } = data;

      // Remove the discount from the room total
      const roomTotalAfterDiscount = roomTotal - discount;

      // Calculate the number of days between check-in and check-out dates
      const numberOfDays = moment(checkOut).diff(moment(checkIn), 'days');

      // Calculate the cost per day for the combined "Breakfast & Mattress" item
      const costPerDay = addOnTotal / numberOfDays;

      // Construct the combined "Breakfast & Mattress" item
      const combinedItem = {
        key: '3',
        description: "Breakfast & Mattress", // Displayed description
        quantity: numberOfDays, // Quantity is the number of days
        rate: costPerDay, // Rate per day
        amount: addOnTotal, // Total amount
      };
      const hasMattress = "mattress" in addOnMap;
      const hasBreakfast = "breakfast" in addOnMap;
      const items = [
        {
          key: '1',
          description: "Room Total",
          quantity: numberOfDays, // Quantity is the number of days
          rate: (roomTotalAfterDiscount / numberOfDays).toFixed(2), // Rate per day after discount with 2 decimal places
          amount: roomTotalAfterDiscount.toFixed(2), // Room total after discount with 2 decimal places
        },
      ];
      if (hasMattress || hasBreakfast) {
        // Calculate the cost per day for the combined "Breakfast & Mattress" item
        const costPerDay = addOnTotal / numberOfDays;

        // Construct the combined "Breakfast & Mattress" item
        const combinedItem = {
          key: '2',
          description: "Breakfast & Mattress", // Displayed description
          quantity: numberOfDays, // Quantity is the number of days
          rate: costPerDay.toFixed(2), // Rate per day with 2 decimal places
          amount: addOnTotal.toFixed(2), // Total amount with 2 decimal places
        };

        const gstItem = [
          {
            key: '3',
            description: "GST (18%)",
            quantity: 1,
            rate: gstAmount.toFixed(2), // GST amount with 2 decimal places
            amount: gstAmount.toFixed(2), // GST amount with 2 decimal places
          },
        ]
        items.push(combinedItem, ...gstItem); // Add combined item to the items array
      }
      // Calculate total amount for each item and round off to 2 decimal places
      items.forEach(item => {
        item.total = (item.quantity * item.rate).toFixed(2);
      });

      // Update state with the new data
      setInvoiceData(prevData => ({
        ...prevData,
        items: items,
      }));

      // Update other necessary data
      setPendingAmt(data.pendingAmt);

      const newInvoiceData = {
        invoiceId: data.bookingId.toString(),
        date: moment().format("DD/MM/YYYY"),
        name: data.customerName,
        email: data.email || "",
        address: data.address,
        phone: data.phoneNumber.toString(),
        taxId: data.gstAmount.toString(),
        checkInDate: `${data.checkIn} ${data.checkInTime}`,
        checkOutDate: `${data.checkOut} ${data.checkOutTime}`,
      };

      form.setFieldsValue(newInvoiceData);
      setBillingSummary(data);
    } catch (error) {
      // Handle error
    }
  };

  const handlePrintAndDownload = async () => {
    const printAndDownloadButtons = document.querySelectorAll('.no-print');
    printAndDownloadButtons.forEach(button => {
      button.style.visibility = 'hidden';
    });

    // Optionally, apply print styles manually if needed
    document.body.classList.add("apply-print-styles");

    const element = componentRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      width: element.offsetWidth,
      height: element.offsetHeight,
    });

    const dataUrl = canvas.toDataURL("image/png");

    // Initialize jsPDF with orientation, unit, and format
    let pdf = new jsPDF("p", "mm", "a4");
    let pageWidth = pdf.internal.pageSize.getWidth();
    let pageHeight = pdf.internal.pageSize.getHeight();

    // Define margins (e.g., 10mm on each side)
    const marginLeft = 10;
    const marginRight = 10;

    // Calculate the content width by subtracting margins
    let contentWidth = pageWidth - marginLeft - marginRight;

    // Calculate the scaled image height to maintain the aspect ratio
    let imgHeight = canvas.height * contentWidth / canvas.width;

    // Ensure the content fits vertically; if not, adjust contentWidth and imgHeight
    if (imgHeight > pageHeight) {
      imgHeight = pageHeight;
      contentWidth = canvas.width * imgHeight / canvas.height;
    }

    pdf.addImage(dataUrl, "PNG", marginLeft, 0, contentWidth, imgHeight);
    pdf.save("invoice.pdf");

    // Restore visibility of buttons after capturing
    printAndDownloadButtons.forEach(button => {
      button.style.visibility = '';
    });

    // Remove print styles if added
    document.body.classList.remove("apply-print-styles");
  };





  const invoicePreviewStyle = {
    padding: '24px',
    border: '1px solid #f0f0f0',
    borderRadius: '4px',
    background: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  };

  const headerStyle = {
    marginBottom: '20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  };

  const sectionStyle = {
    marginBottom: '24px',
  };

  const tableStyle = {
    marginBottom: '24px',
  };

  const totalAmountStyle = {
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#000',
  };
  const addressContainer = {
    maxwidth: '200px',
    wordwrap: 'break-word',
  }

  const formatDateTime = (dateTime) => {
    return dateTime ? moment(dateTime).format("DD/MM/YYYY") : "N/A";
  };

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [invoicePreviewData, setInvoicePreviewData] = useState({
    invoiceId: "",
    date: getCurrentDate(), // Initialize with current date
  });

  const handleDateChange = (date) => {
    setInvoicePreviewData((prevData) => ({
      ...prevData,
      date: date.format("YYYY-MM-DD"),
    }));
  };

  return (
    <div style={{ padding: "20px" }}>
      <style>
        {`
          @media print {
            .no-print {
              display: none;
            }
            body {
              margin-left: 20mm; /* Increase left margin */
              margin-right: 20mm; /* Increase right margin */
              margin-top: 20mm; /* Increase right margin */
            }
          }
        `}
        {`
          .ant-table-row {
            padding-top: 8px !important; /* Reduce top padding */
            padding-bottom: 8px !important; /* Reduce bottom padding */
          }
          .ant-typography {
            margin-bottom: 4px !important; /* Reduce space between paragraphs */
          }
        `}
      </style>
      <Input
            placeholder="Search..."
            onSearch={value => console.log(value)} // Implement your search functionality here
            style={{ width: 300 }}
          />
      <Row gutter={16}>
        <Col span={12}>
          <Card
            title="Create New Invoice"
            bordered={false}
            style={{ minHeight: "100%" }}
          >
            <Form
              form={form}
              layout="vertical"
              onValuesChange={onValuesChange}
              initialValues={invoiceData}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="invoiceId"
                    label="Invoice Number"
                    rules={[
                      {
                        required: true,
                        message: "Please input the invoice number!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="date"
                    label="Date"
                    rules={[
                      {
                        required: true,
                        message: "Please input the date!",
                      },
                    ]}
                  >
                    <input type="date" style={{ width: "170px" }} defaultValue={getCurrentDate()} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="checkInDate" label="Check In">
                    <Input
                      placeholder="N/A"
                      disabled={true}
                      value={moment(form.getFieldValue('checkInDate')).format("DD/MM/YYYY")}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="checkOutDate" label="Check Out">
                    <Input
                      placeholder="N/A"
                      disabled={true}
                      value={moment(form.getFieldValue('checkOutDate')).format("DD/MM/YYYY")}
                    />
                  </Form.Item>
                </Col>

              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Name"
                    rules={[
                      {
                        required: true,
                        message: "Please input the name!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[
                      {
                        required: true,
                        message: "Please input the phone number!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      {
                        type: "email",
                        message: "The input is not a valid E-mail!",
                      },
                      {
                        required: true,
                        message: "Please input your E-mail!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="taxId"
                    label="GST Number"
                    rules={[
                      {
                        required: true,
                        message: "Please input the GST Number!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

            </Form>
          </Card>
        </Col>


        <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
          <Card title="Invoice Preview" bordered={false} style={invoicePreviewStyle}>
            <div ref={componentRef}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}> {/* Center the title and logo */}
                <Title level={4}>Invoice</Title> {/* Centered Invoice Title */}
              </div>
              <Row justify="space-between" style={headerStyle}>
                <Col>
                  <img
                    src="/images/hotel-madhuban-logo.png"
                    alt="Hotel Madhuban Logo"
                    style={{ width: "150px", marginBottom: "10px" }}
                  />
                </Col>
                <Col>
                  <Paragraph>
                    <strong>Invoice Number:</strong> {form.getFieldValue('invoiceId')}
                  </Paragraph>
                  <Paragraph>
                    <strong>Date:</strong> {form.getFieldValue('date') ? moment(form.getFieldValue('date')).format("DD/MM/YYYY") : "N/A"}
                  </Paragraph>
                </Col>
              </Row>

              <Divider />

              <Row justify="space-between" style={sectionStyle}>
                <Col>
                  <Paragraph><strong>Madhuban Hotel</strong></Paragraph>
                  <Paragraph>Shivaji Putla Rd, Rahman Ganj, </Paragraph>
                  <Paragraph>Jalna, Maharashtra 431203</Paragraph>

                  <Paragraph>+91-82650 65418</Paragraph>
                  <Paragraph> madhubanhotel@yahoo.com</Paragraph>
                  <Paragraph>GST: 27AAAFH8828F1ZB</Paragraph>
                </Col>
                <Col>
                  <Paragraph><strong>Name:</strong> {form.getFieldValue('name')}</Paragraph>
                  <Paragraph><strong>Phone:</strong> {form.getFieldValue('phone')}</Paragraph>
                  <Paragraph><strong>Email:</strong> {form.getFieldValue('email')}</Paragraph>


                  <Paragraph>
                    <strong>GST:</strong> {form.getFieldValue('taxId')}
                  </Paragraph>
                  <Paragraph>
                    <strong>Check-In:</strong> {formatDateTime(billingSummary?.checkIn)}
                  </Paragraph>
                  <Paragraph>
                    <strong>Check-Out:</strong> {formatDateTime(billingSummary?.checkOut)}
                  </Paragraph>
                </Col>
              </Row>

              <Table
                dataSource={invoiceData.items}
                pagination={false}
                bordered
                style={tableStyle}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={4} style={{ textAlign: 'right' }}>Grand Total</Table.Summary.Cell>
                      <Table.Summary.Cell index={1}><span style={totalAmountStyle}>₹{calculateTotalAmount().toFixed(2)}</span></Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              >
                <Table.Column title="Sr. No." dataIndex="key" key="key" render={(text, record, index) => index + 1} />
                <Table.Column title="Description" dataIndex="description" key="description" />
                <Table.Column title="Quantity" dataIndex="quantity" key="quantity" />
                <Table.Column title="Cost" dataIndex="rate" key="rate" />
                <Table.Column title="Total" key="total" render={(_, record) => (record.quantity * record.rate).toFixed(2)} />
              </Table>

              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <ReactToPrint
                  trigger={() => <Button icon={<PrinterOutlined />} className="no-print" />}
                  content={() => componentRef.current}
                />
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadPdf}
                  style={{ marginLeft: 8 }}
                  className="no-print"
                />
              </div>



            </div>
          </Card>


        </Col>
      </Row>
    </div>
  );
};

export default Invoice;
