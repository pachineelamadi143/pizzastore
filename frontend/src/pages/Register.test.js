import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from './Register';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

// Mock api so no real HTTP calls are made
jest.mock('../services/api', () => ({
  register: jest.fn(),
}));

const renderRegister = () =>
  render(<Register />);

describe('Register Page', () => {
  test('renders all 4 input fields', () => {
    renderRegister();
    expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/min 6 characters/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/10-digit number/i)).toBeInTheDocument();
  });

  test('renders a Register submit button', () => {
    renderRegister();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('shows "Full name is required" on empty submit', async () => {
    renderRegister();
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
    });
  });

  test('shows "Email is required" on empty submit', async () => {
    renderRegister();
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  test('shows "Phone number is required" on empty submit', async () => {
    renderRegister();
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => {
      expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
    });
  });

  test('shows invalid phone error for non-10-digit number', async () => {
    renderRegister();
    const phoneField = screen.getByPlaceholderText(/10-digit number/i);
    fireEvent.change(phoneField, { target: { value: '12345' } });
    fireEvent.blur(phoneField);
    await waitFor(() => {
      expect(screen.getByText(/valid 10-digit phone number/i)).toBeInTheDocument();
    });
  });

  test('shows invalid email error for malformed email', async () => {
    renderRegister();
    const emailField = screen.getByPlaceholderText(/enter email/i);
    fireEvent.change(emailField, { target: { value: 'bademail' } });
    fireEvent.blur(emailField);
    await waitFor(() => {
      expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
    });
  });

  test('has a link to the Login page', () => {
    renderRegister();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });
});
