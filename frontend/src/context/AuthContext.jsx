import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('civicconnect_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('civicconnect_token') || '');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Set default axios header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('civicconnect_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('civicconnect_token');
    }
  }, [token]);

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('civicconnect_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('civicconnect_user');
    }
    setLoading(false);
  }, [user]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data);
      const unread = res.data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    setToken(res.data.access_token);
    setUser(res.data.user);
    fetchNotifications();
    return res.data.user;
  };

  const register = async (userData) => {
    const res = await axios.post('/api/auth/register', userData);
    setToken(res.data.access_token);
    setUser(res.data.user);
    fetchNotifications();
    return res.data.user;
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('civicconnect_user');
    localStorage.removeItem('civicconnect_token');
  };

  const switchRole = async (roleKey) => {
    try {
      const demoAccessKey = import.meta.env.PROD && import.meta.env.VITE_DEMO_MODE === 'true'
        ? window.prompt('Enter the class demo access key:')
        : null;
      if (import.meta.env.PROD && import.meta.env.VITE_DEMO_MODE === 'true' && !demoAccessKey) return null;
      const res = await axios.post(`/api/auth/demo-switch/${roleKey}`, null, {
        headers: demoAccessKey ? { 'X-Demo-Key': demoAccessKey } : undefined,
      });
      setToken(res.data.access_token);
      setUser(res.data.user);
      fetchNotifications();
      return res.data.user;
    } catch (err) {
      console.error('Demo switch error:', err);
      throw err;
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      switchRole,
      notifications,
      unreadCount,
      fetchNotifications,
      markNotificationRead
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
