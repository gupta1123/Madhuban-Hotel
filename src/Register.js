import React from 'react';
import { Button, Form, Input, Select } from 'antd';

const Register = ({ onRegister, onNavigate }) => {
  return (
    <div className="custom-card">
      <h2>Register</h2>
      <Form onFinish={handleRegister}>
        <Form.Item
          name="username"
          rules={[
            {
              required: true,
              message: "Please input your username!",
            },
          ]}
        >
          <Input
            className="custom-input"
            placeholder="Username"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          hasFeedback
          rules={[
            {
              required: true,
              message: 'Please confirm your password!',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords that you entered do not match!'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm Password" />
        </Form.Item>
        <Form.Item
          name="roles"
          rules={[{ required: true, message: 'Please select your role!' }]}
        >
          <Select placeholder="Select a role">
            <Select.Option value="RECEPTION">RECEPTION</Select.Option>
            <Select.Option value="ADMIN">ADMIN</Select.Option>
            <Select.Option value="HOUSEKEEPING">HOUSE KEEPING</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Register
          </Button>
          <Button
            type="default"
            onClick={() => setCurrentPage("login")}
            style={{ marginLeft: "10px" }}
          >
            Back to Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
