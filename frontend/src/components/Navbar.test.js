import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';
import * as AuthContext from '../context/AuthContext';

// Spy on useAuth to control user context
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

jest.mock('../services/api', () => ({
  getUnreadCount: jest.fn().mockResolvedValue({ data: { unreadCount: 0 } }),
}));

const mockUseAuth = (overrides = {}) => {
  jest.spyOn(AuthContext, 'useAuth').mockReturnValue({
    user: null,
    logout: jest.fn(),
    unreadCount: 0,
    updateUnreadCount: jest.fn(),
    ...overrides,
  });
};

describe('Navbar Component', () => {
  afterEach(() => jest.restoreAllMocks());

  test('shows Login and Register buttons when user is NOT logged in', () => {
    mockUseAuth({ user: null });
    render(<Navbar />);
    expect(screen.getAllByText(/login/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/register/i).length).toBeGreaterThan(0);
  });

  test('shows Logout button when user IS logged in', () => {
    mockUseAuth({ user: { name: 'Aditya', role: 'customer' } });
    render(<Navbar />);
    expect(screen.getAllByText(/logout/i).length).toBeGreaterThan(0);
  });

  test('does NOT show Logout when user is NOT logged in', () => {
    mockUseAuth({ user: null });
    render(<Navbar />);
    expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();
  });

  test('shows Dashboard and Menu Management for admin user', () => {
    mockUseAuth({ user: { name: 'Admin', role: 'admin' } });
    render(<Navbar />);
    expect(screen.getAllByText(/dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/menu management/i).length).toBeGreaterThan(0);
  });

  test('shows My Orders and Cart for regular customer', () => {
    mockUseAuth({ user: { name: 'User', role: 'customer' } });
    render(<Navbar />);
    expect(screen.getAllByText(/my orders/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/cart/i).length).toBeGreaterThan(0);
  });

  test('hamburger toggler is present on mobile layout', () => {
    mockUseAuth({ user: null });
    render(<Navbar />);
    expect(screen.getByLabelText(/toggle navigation/i)).toBeInTheDocument();
  });

  test('clicking hamburger toggler expands the mobile menu', () => {
    mockUseAuth({ user: null });
    render(<Navbar />);
    const toggler = screen.getByLabelText(/toggle navigation/i);
    fireEvent.click(toggler);
    // After clicking, the collapse section should be in the DOM
    expect(document.getElementById('navbarMenu')).toBeInTheDocument();
  });

  test('shows notification badge when unreadCount > 0', () => {
    mockUseAuth({ user: { name: 'User', role: 'customer' }, unreadCount: 3 });
    render(<Navbar />);
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
  });
});
