import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { getUnreadCount } from '../services/api';
import useWebSocket from '../hooks/useWebSocket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);

  // Use a ref so handleWsMessage always has the latest user without re-creating
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  // ── Toast notifications state ────────────────────────────────────
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const resetAdminUnread = useCallback(() => {
    setAdminUnreadCount(0);
  }, []);

  // ── WebSocket message handler ────────────────────────────────────
  const handleWsMessage = useCallback((data) => {
    const { type, message } = data;
    const currentUser = userRef.current;

    // ── User-facing events (non-admin) ────────────────────────────
    if (
      type === 'ORDER_PLACED' ||
      type === 'ORDER_STATUS_UPDATE' ||
      type === 'ORDER_CANCELLED'
    ) {
      addToast(type, message);
      // Increment badge count immediately (no round-trip needed)
      setUnreadCount((prev) => prev + 1);
    }

    // ── Admin-facing events ───────────────────────────────────────
    if (currentUser?.role === 'admin') {
      if (type === 'NEW_ORDER') {
        addToast('NEW_ORDER', message);
        setAdminUnreadCount((prev) => prev + 1);
      }
      if (type === 'ORDER_CANCELLED_BY_USER') {
        addToast('ORDER_CANCELLED_BY_USER', message);
        setAdminUnreadCount((prev) => prev + 1);
      }
    }

    // Forward ALL events to any page-level handler (e.g. AdminOrders / AdminDashboard)
    if (typeof window._adminWsHandler === 'function') {
      window._adminWsHandler(data);
    }
  }, [addToast]);

  // Only connect the WS when a token exists
  useWebSocket(token, handleWsMessage);

  // ── Restore session from sessionStorage ──────────────────────────
  useEffect(() => {
    const savedToken = sessionStorage.getItem('token');
    const savedUser = sessionStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      updateUnreadCount();
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateUnreadCount = async () => {
    try {
      if (sessionStorage.getItem('token')) {
        const res = await getUnreadCount();
        setUnreadCount(res.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const login = (userData, userToken) => {
    setUser(userData);
    userRef.current = userData;
    setToken(userToken);
    sessionStorage.setItem('token', userToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    userRef.current = null;
    setToken(null);
    setUnreadCount(0);
    setAdminUnreadCount(0);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        unreadCount,
        updateUnreadCount,
        adminUnreadCount,
        resetAdminUnread,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);