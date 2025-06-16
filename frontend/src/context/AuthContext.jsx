// AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState({
    token: localStorage.getItem('token'),
    userId: localStorage.getItem('user_id'),
    username: localStorage.getItem('username'),
  });

  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user_id', data.user_id);
    localStorage.setItem('username', data.username);
    setAuthUser({
      token: data.token,
      userId: data.user_id,
      username: data.username,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    setAuthUser(null);
  };

  const value = { authUser, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};