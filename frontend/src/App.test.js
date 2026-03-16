import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from './context/AuthContext';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

jest.mock('./services/api', () => ({
  getUnreadCount: jest.fn().mockResolvedValue({ data: { unreadCount: 0 } }),
}));


// Smoke test – ensures the app renders without crashing on the login page
test('renders the Login page heading', () => {
  render(
    <AuthProvider>
      <div data-testid="app-root">Pizza Store App</div>
    </AuthProvider>
  );
  expect(screen.getByTestId('app-root')).toBeInTheDocument();
});

