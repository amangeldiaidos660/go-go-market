import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import './global.css';
import LoginForm from './src/components/LoginForm';
import HomeScreen from './src/screens/HomeScreen';
import { authApi, apiClient } from './src/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedSessionId = localStorage.getItem('sessionId');
    const savedUserData = localStorage.getItem('userData');
    
    if (savedSessionId && savedUserData) {
      apiClient.setSessionId(savedSessionId);
      setUserData(JSON.parse(savedUserData));
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setUserData(user);
    localStorage.setItem('userData', JSON.stringify(user));
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setIsAuthenticated(false);
      setUserData(null);
      localStorage.removeItem('sessionId');
      localStorage.removeItem('userData');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      setIsAuthenticated(false);
      setUserData(null);
      localStorage.removeItem('sessionId');
      localStorage.removeItem('userData');
    }
  };

  if (loading) {
    return null;
  }

  return (
    <>
      {isAuthenticated ? (
        <HomeScreen onLogout={handleLogout} userData={userData} />
      ) : (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      )}
      <StatusBar style="auto" />
    </>
  );
}
