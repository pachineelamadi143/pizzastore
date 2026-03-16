import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock dependencies
jest.mock('../services/api', () => ({
  getUnreadCount: jest.fn().mockResolvedValue({ data: { unreadCount: 0 } }),
}));
jest.mock('../hooks/useWebSocket', () => jest.fn());

// ── Stateful consumer – re-renders whenever context updates ─────────────
let ctxRef = {};

const Consumer = () => {
  const ctx = useAuth();
  Object.assign(ctxRef, ctx);
  return <span data-testid="ready">ready</span>;
};

async function setup(storageFn) {
  ctxRef = {};
  if (storageFn) storageFn();
  await act(async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
  });
  await waitFor(() => screen.getByTestId('ready'));
}

describe('AuthContext', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('user is null when no session exists', async () => {
    await setup();
    expect(ctxRef.user).toBeNull();
  });

  test('loading is false after mount', async () => {
    await setup();
    await waitFor(() => expect(ctxRef.loading).toBe(false));
  });

  test('login() saves token and user to sessionStorage', async () => {
    await setup();
    act(() => ctxRef.login({ name: 'Aditya', role: 'customer' }, 'test-jwt'));
    expect(sessionStorage.getItem('token')).toBe('test-jwt');
    expect(JSON.parse(sessionStorage.getItem('user')).name).toBe('Aditya');
  });

  test('logout() clears sessionStorage', async () => {
    sessionStorage.setItem('token', 'tok');
    sessionStorage.setItem('user', JSON.stringify({ name: 'X' }));
    await setup();
    act(() => ctxRef.logout());
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('user')).toBeNull();
  });

  test('session token persists in sessionStorage after mount with saved session', async () => {
    await setup(() => {
      sessionStorage.setItem('token', 'saved-token');
      sessionStorage.setItem('user', JSON.stringify({ name: 'User', role: 'customer' }));
    });
    expect(sessionStorage.getItem('token')).toBe('saved-token');
  });

  test('addToast is a function', async () => {
    await setup();
    expect(typeof ctxRef.addToast).toBe('function');
  });

  test('removeToast is a function', async () => {
    await setup();
    expect(typeof ctxRef.removeToast).toBe('function');
  });
});
