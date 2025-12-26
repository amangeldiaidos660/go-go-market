import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import SideNav from '../components/SideNav';
import UsersScreen from './UsersScreen';
import ProfileScreen from './ProfileScreen';
import DevicesScreen from './DevicesScreen';
import InvoicesScreen from './InvoicesScreen';
import StatisticsScreen from './StatisticsScreen';
import TransactionsScreen from './TransactionsScreen';

const HomeScreen = ({ onLogout, userData }) => {
  const getDefaultSection = () => {
    const saved = localStorage.getItem('activeSection');
    if (saved) {
      return saved;
    }
    return userData?.idrole === 1 ? 'users' : userData?.idrole === 2 ? 'invoices' : 'profile';
  };

  const [activeSection, setActiveSection] = useState(getDefaultSection);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  useEffect(() => {
    localStorage.setItem('activeSection', activeSection);
  }, [activeSection]);

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UsersScreen userData={userData} />;
      case 'profile':
        return <ProfileScreen userData={userData} />;
      case 'transactions':
        return <TransactionsScreen userData={userData} />;
      case 'statistics':
        return <StatisticsScreen userData={userData} />;
      case 'devices':
        return <DevicesScreen userData={userData} />;
      case 'invoices':
        return <InvoicesScreen userData={userData} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {!isMobile && (
        <SideNav 
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          onLogout={onLogout}
          userData={userData}
        />
      )}
      
      <View style={styles.mainWrapper}>
        {isMobile && (
          <SideNav 
            activeSection={activeSection}
            onSelectSection={setActiveSection}
            onLogout={onLogout}
            userData={userData}
          />
        )}
        <ScrollView style={styles.mainContent}>
          {renderContent()}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  mainWrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  mainContent: {
    flex: 1,
    padding: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
  },
});

export default HomeScreen;
