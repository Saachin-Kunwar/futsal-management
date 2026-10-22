import { useState } from 'react';
import AuthContext from './auth-context';
import API, { getApiErrorMessage } from '../services/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    if (!storedUser || !token) {
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return null;
    }
  });

  const login = async (username, password) => {
    try {
      const response = await API.post('accounts/login/', { username, password });
      const { access, refresh, user } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return { success: true, role: user.role };
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(error, 'Invalid credentials. Please try again.'),
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};