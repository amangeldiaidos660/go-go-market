import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  blue: {
    primary: '#3bb9eb',
    primaryLight: '#50c3f0',
    primaryDark: '#2a9bcf',
    background: '#e6f7fd',
  },
  orange: {
    primary: '#FF6B35',
    primaryLight: '#FF8B5C',
    primaryDark: '#E5501B',
    background: '#FFF3EF',
  },
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('blue');

  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const switchTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem('appTheme', themeName);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, theme: themes[currentTheme], switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

