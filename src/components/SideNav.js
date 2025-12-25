import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const SideNav = ({ activeSection, onSelectSection, onLogout, userData }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { currentTheme, theme, switchTheme } = useTheme();

  const allMenuItems = [
    { id: 'users', label: 'Пользователи', icon: 'people', roleRequired: 1 },
    { id: 'profile', label: 'Профиль', icon: 'person-circle', roleRequired: null },
    { id: 'transactions', label: 'Транзакции', icon: 'card', roleRequired: null },
    { id: 'statistics', label: 'Статистика', icon: 'stats-chart', roleRequired: null },
    { id: 'devices', label: 'Девайсы', icon: 'phone-portrait', roleRequired: null },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (item.roleRequired === null) return true;
    return userData?.idrole === item.roleRequired;
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleMenuItemClick = (id) => {
    onSelectSection(id);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  if (isMobile) {
    return (
      <>
        <View style={styles.mobileHeader}>
          <TouchableOpacity
            onPress={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={styles.hamburger}
          >
            <Ionicons name={isMobileMenuOpen ? "close" : "menu"} size={28} color="#212121" />
          </TouchableOpacity>
          <Text style={styles.mobileTitle}>Go Market</Text>
        </View>

        {isMobileMenuOpen && (
          <View style={styles.mobileMenu}>
            <View style={styles.mobileMenuContent}>
              {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  activeSection === item.id && { ...styles.menuItemActive, backgroundColor: theme.background }
                ]}
                onPress={() => handleMenuItemClick(item.id)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={item.icon} 
                  size={20} 
                  color={activeSection === item.id ? theme.primary : '#757575'} 
                />
                <Text style={[
                  styles.menuText,
                  activeSection === item.id && { ...styles.menuTextActive, color: theme.primary }
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                disabled={isLoggingOut}
                activeOpacity={0.7}
              >
                {isLoggingOut ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Ionicons name="log-out" size={18} color="#ffffff" />
                    <Text style={styles.logoutText}>Выход</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <View style={[styles.logo, { backgroundColor: theme.primary }]}>
        <Text style={styles.logoText}>G</Text>
      </View>
        <Text style={styles.appName}>Go Market</Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              activeSection === item.id && { ...styles.menuItemActive, backgroundColor: theme.background }
            ]}
            onPress={() => onSelectSection(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={item.icon} 
              size={20} 
              color={activeSection === item.id ? theme.primary : '#757575'} 
            />
            <Text style={[
              styles.menuText,
              activeSection === item.id && { ...styles.menuTextActive, color: theme.primary }
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.themeSwitcher}>
          <Text style={styles.themeSwitcherLabel}>Тема:</Text>
          <View style={styles.themeButtons}>
            <TouchableOpacity
              style={[
                styles.themeButton,
                currentTheme === 'blue' && styles.themeButtonActive,
                { borderColor: '#3bb9eb' }
              ]}
              onPress={() => switchTheme('blue')}
            >
              <View style={[styles.themeColor, { backgroundColor: '#3bb9eb' }]} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeButton,
                currentTheme === 'orange' && styles.themeButtonActive,
                { borderColor: '#FF6B35' }
              ]}
              onPress={() => switchTheme('orange')}
            >
              <View style={[styles.themeColor, { backgroundColor: '#FF6B35' }]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoggingOut}
          activeOpacity={0.7}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Ionicons name="log-out" size={18} color="#ffffff" />
              <Text style={styles.logoutText}>Выход</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    flexDirection: 'column',
  },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    position: 'relative',
    zIndex: 1000,
  },
  hamburger: {
    padding: 8,
    marginRight: 12,
  },
  mobileTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  mobileMenu: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  mobileMenuContent: {
    backgroundColor: '#ffffff',
    padding: 16,
    maxHeight: '80%',
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  menu: {
    flex: 1,
    paddingVertical: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuItemActive: {
  },
  menuText: {
    fontSize: 16,
    color: '#757575',
    fontWeight: '500',
    marginLeft: 12,
  },
  menuTextActive: {
    fontWeight: '600',
  },
  themeSwitcher: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  themeSwitcherLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
    fontWeight: '500',
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  themeButtonActive: {
    borderWidth: 3,
  },
  themeColor: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: '#f44336',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SideNav;
