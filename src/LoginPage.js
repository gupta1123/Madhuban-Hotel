import React from 'react';
import { Form, Input, Button } from 'antd';

const LoginPage = ({ onLogin }) => {
  return (
    <div className="login-form">
      <h2>Login</h2>
      <Form onFinish={onLogin}>
        <Form.Item name="username" rules={[{ required: true, message: 'Please input your username!' }]}>
          <Input placeholder="Username" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">Login</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginPage;
