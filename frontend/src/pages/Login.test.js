import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import Login from './Login';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

// Mock the api module so no real HTTP calls are made
jest.mock('../services/api', () => ({
  login: jest.fn(),
  getUnreadCount: jest.fn().mockResolvedValue({ data: { unreadCount: 0 } }),
}));

const renderLogin = () =>
  render(
    <AuthProvider>
      <Login />
    </AuthProvider>
  );

describe('Login Page', () => {
  test('renders email and password input fields', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
  });

  test('renders a Login button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('displays "Email is required" error when email is empty and submitted', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  test('displays "Password is required" error when password is empty and submitted', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test('displays invalid email error for malformed email', async () => {
    renderLogin();
    const emailField = screen.getByPlaceholderText(/enter email/i);
    fireEvent.change(emailField, { target: { value: 'notanemail' } });
    fireEvent.blur(emailField);
    await waitFor(() => {
      expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
    });
  });

  test('displays password length error for short password', async () => {
    renderLogin();
    const pwdField = screen.getByPlaceholderText(/enter password/i);
    fireEvent.change(pwdField, { target: { value: '12' } });
    fireEvent.blur(pwdField);
    await waitFor(() => {
      expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
    });
  });

  test('has a link to the Register page', () => {
    renderLogin();
    expect(screen.getByText(/register/i)).toBeInTheDocument();
  });
});
