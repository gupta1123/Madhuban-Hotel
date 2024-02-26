import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  DatePicker,
  Select,
  Space,
  List,
  Button,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  CloseOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { FormControl, FormLabel,  Box } from '@chakra-ui/react';

const { Title, Text } = Typography;
const { Option } = Select;

const AddTransactions = ({
  bookingId,
  authToken,
  onTransactionsUpdated,
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [transactions, setTransactions] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [form] = Form.useForm();
  const today = new Date().toISOString().split("T")[0];




  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getAllTransactions?bookingId=${bookingId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}` 
          }
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setTransactions(data);
      onTransactionsUpdated(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };
  useEffect(() => {
    if (bookingId) {
      fetchTransactions();
    }
  }, [bookingId]);

  useEffect(() => {
    if (selectedTransaction) {
      const transformedTransaction = {
        ...selectedTransaction,
        date: moment(selectedTransaction.date),
      };
      form.setFieldsValue(transformedTransaction);
    }
  }, [selectedTransaction, form]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // const handleAddTransactionClick = () => {
  //   form.setFieldsValue({ method: "online" });
  //   setShowForm(true);
  //   setEditMode(false);
  //   setSelectedTransaction(null);
  //   form.resetFields();
  // };

  const updateTransaction = async () => {
    const values = form.getFieldsValue();

    const payload = {
      amountPaid: values.amountPaid,
      paymentMode: values.paymentMode,
      bookingId: bookingId,
      date: values.date.format("YYYY-MM-DD"),
    };

    try {
      const response = await fetch(
        "http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/billing/getAllTransactions/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${authToken}` 

          },
          body: JSON.stringify(payload),
        }
      );
      fetchTransactions();
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      console.log("Transaction updated successfully");
    } catch (error) {
      fetchTransactions();
      console.error("Error updating transaction:", error);
    }
  };

  const handleAddTransactionClick = () => {
    setShowForm(true);
    setEditMode(false);
    setSelectedTransaction(null);
    form.resetFields();
    form.setFieldsValue({
      paymentMode: "online",
      date: moment(), // Set the default date to the current date
    });
  };
  

  const handleEditTransactionClick = (transaction) => {
    setShowForm(true);
    setEditMode(true);
    // setSelectedTransaction(transaction);
    // setSelectedTransaction({ ...transaction, transactionId: transaction.id });
    setSelectedTransaction({ ...transaction });
  };

  const handleCancelClick = () => {
    setShowForm(false);
    setEditMode(false);
    setSelectedTransaction(null);
    form.resetFields();
  };

  const saveTransaction = () => {
    form
      .validateFields()
      .then(async (values) => {
        const formattedValues = {
          ...values,
          date: moment(values.date).format("YYYY-MM-DD"),
        };

        console.log("Form Data:", formattedValues);
        console.log(bookingId);

        const payload = {
          bookingId: bookingId,
          ...formattedValues,
        };

        console.log("payload", payload);
        try {
          const response = await fetch(
            "http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/transaction/create",
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${authToken}` 

              },
              body: JSON.stringify(payload),
            }
          );

          fetchTransactions();
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          console.log("Response from API:", result);
        } catch (error) {
          console.error("Error making API call:", error);
        }

        if (editMode) {
          const updatedTransactions = transactions.map((transaction) =>
            transaction.id === selectedTransaction.id
              ? { ...transaction, ...formattedValues }
              : transaction
          );
          setTransactions(updatedTransactions);
        } else {
          setTransactions([
            ...transactions,
            { ...formattedValues, id: transactions.length + 1 },
          ]);
        }
        form.resetFields();
        setShowForm(false);
        setEditMode(false);
        setSelectedTransaction(null);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  // const deleteTransaction = async (id) => {
  //   try {
  //     // const response = await fetch(
  //     //   `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/transaction/delete?transactionId=${id}&bookingId=${bookingId}`,
  //     //   {
  //     //     method: "DELETE",
  //     //   }
  //     // );

  //     // if (!response.ok) {
  //     //   throw new Error(`HTTP error! Status: ${response.status}`);
  //     // }

  //     console.log("Transaction deleted successfully");

  //     console.log("Booking ID:", bookingId);
  //     console.log("Transaction ID:", id);

  //     const updatedTransactions = transactions.filter(
  //       (transaction) => transaction.id !== id
  //     );
  //     setTransactions(updatedTransactions);
  //   } catch (error) {
  //     console.error("Error deleting transaction:", error);
  //   }
  // };
  const deleteTransaction = async (transactionId) => {
    console.log(
      "Deleting transaction with Booking ID:",
      bookingId,
      "and Transaction ID:",
      transactionId
    );

    try {
      const response = await fetch(
        `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/transaction/delete?transactionId=${transactionId}&bookingId=${bookingId}`,
        {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${authToken}` 
        }
        }
      );

      fetchTransactions();
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      console.log("Transaction deleted successfully");

      const updatedTransactions = transactions.filter(
        (transaction) => transaction.id !== transactionId
      );
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const logTransactionDetails = async (transactionId, formattedValues) => {
    console.log(formattedValues);
    console.log(transactionId);
    if (transactionId) {
      const transactionDetails = {
        amountPaid: formattedValues.amountPaid,
        paymentMode: formattedValues.paymentMode,
        bookingId: bookingId,
        date: formattedValues.date,
      };

      console.log("Transaction Details for Updating:");
      console.log(transactionDetails);

      try {
        const response = await fetch(
          `http://ec2-54-211-23-206.compute-1.amazonaws.com:8081/transaction/edit?bookingId=${bookingId}&transactionId=${transactionId.transactionId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              'Authorization': `Bearer ${authToken}` 

            },
            body: JSON.stringify(transactionDetails),
          }
        );
        form.resetFields();
        setShowForm(false);
        setEditMode(false);
        setSelectedTransaction(null);
        fetchTransactions();
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Response from API:", result);
      } catch (error) {
        console.error("Error updating transaction:", error);
      }
    } else {
      console.log("Transaction not found for ID:", transactionId);
    }
  };
  const responsiveStyle = {
    ...styles.transactionCard,
    width: windowWidth < 768 ? "100%" : "90%",
    margin: windowWidth < 480 ? "10px 0" : "20px auto",
  };
  return (
    <Card style={styles.transactionCard}>
      <div style={styles.headerContainer}>
        <Title level={4} style={styles.headerTitle}>
          Transactions
        </Title>
        <Button style={styles.addButton} onClick={handleAddTransactionClick}>
          <PlusOutlined /> Add Transaction
        </Button>
      </div>

      {showForm && (
        <Form form={form} layout="vertical" style={styles.transactionForm}>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <FormControl id="date" style={{ flex: 1, marginRight: 16, marginBottom: 16 }} isRequired>
            <FormLabel htmlFor="date">Date</FormLabel>
            <Input
              as="input"
              type="date"
              defaultValue={today} // Set today's date as default
              min={today} // Disable past dates
              onChange={(e) => form.setFieldsValue({ date: moment(e.target.value) })}
              bg="white" // Add this to ensure the background is white
            />
          </FormControl>
            <Form.Item
              name="amountPaid"
              label="Amount"
              min={0}
              rules={[{ required: true, message: "Please input amount!" }]}
              style={{ flex: 1, marginRight: 16, marginBottom: 16 }}
            >
              <Input prefix="₹" type="number"               min={0}
 />
            </Form.Item>
            <Form.Item
              name="paymentMode"
              label="Payment Method"
              style={{ flex: 1, marginRight: 16, marginBottom: 16 }}
            >
              <Select defaultValue="online">
                <Option value="online">Online</Option>
                <Option value="cash">Cash</Option>
                <Option value="creditCard">Credit Card</Option>
                <Option value="upi">UPI</Option>
              </Select>
            </Form.Item>
          </div>
          <Space>
            <Button
              type="primary"
              onClick={() => {
                if (editMode) {
                  form
                    .validateFields()
                    .then((values) => {
                      const formattedValues = {
                        ...values,
                        date: moment(values.date).format("YYYY-MM-DD"),
                      };

                      logTransactionDetails(
                        selectedTransaction,
                        formattedValues
                      );
                    })
                    .catch((info) => {
                      console.log("Validate Failed:", info);
                    });
                } else {
                  saveTransaction();
                }
              }}
            >
              {editMode ? "Update" : "Save"}
            </Button>

            <Button onClick={handleCancelClick}>
              <CloseOutlined /> Cancel
            </Button>
          </Space>
        </Form>
      )}

      {Array.isArray(transactions) && transactions.length >= 0 && (
        <List
          itemLayout="horizontal"
          dataSource={transactions}
          renderItem={(item) => (
            <Card key={item.id} style={styles.transactionListItem}>
              <div style={styles.transactionDetails}>
                <Text style={styles.transactionId}>Transaction #{item.id}</Text>
                <Text style={styles.transactionText}>
                🗓️ {moment(item.date).format("YYYY-MM-DD")} | 💵: ₹
                  {item.amountPaid} | 💳: {item.paymentMode}
                </Text>
                <div style={styles.actionButtons}>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => handleEditTransactionClick(item)}
                    style={styles.editButton}
                  />
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={() => deleteTransaction(item.transactionId)}
                    style={styles.deleteButton}
                  />
                </div>
              </div>
            </Card>
          )}
        />
      )}
    </Card>
  );
};

const styles = {
  transactionCard: {
    maxWidth: "100%",
    width: "825px",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  headerContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    margin: 0,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: 5,
  },
  transactionForm: {
    marginBottom: 20,
  },
  transactionListItem: {
    backgroundColor: "#f5f5f5",
    margin: "10px 0",
    borderRadius: 5,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  transactionDetails: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
  },
  transactionId: {
    margin: 0,
    color: "#333333",
    fontWeight: "bold",
  },
  transactionText: {
    margin: 0,
    color: "#333333",
  },
  actionButtons: {
    display: "flex",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: "#F44336",
    color: "white",
    border: "none",
  },
};

export default AddTransactions;