import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import './global.css';
import LoginForm from './src/components/LoginForm';
import HomeScreen from './src/screens/HomeScreen';
import { authApi } from './src/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      setIsAuthenticated(false);
    }
  };

  return (
    <>
      {isAuthenticated ? (
        <HomeScreen onLogout={handleLogout} />
      ) : (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      )}
      <StatusBar style="auto" />
    </>
  );
}
