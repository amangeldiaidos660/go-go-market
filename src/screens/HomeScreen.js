import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import SideNav from '../components/SideNav';

const HomeScreen = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('users');
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return (
          <View style={styles.content}>
            <Text style={styles.title}>Пользователи</Text>
            <Text style={styles.subtitle}>Список пользователей будет здесь</Text>
          </View>
        );
      case 'transactions':
        return (
          <View style={styles.content}>
            <Text style={styles.title}>Транзакции</Text>
            <Text style={styles.subtitle}>История транзакций будет здесь</Text>
          </View>
        );
      case 'statistics':
        return (
          <View style={styles.content}>
            <Text style={styles.title}>Статистика</Text>
            <Text style={styles.subtitle}>Графики и статистика будут здесь</Text>
          </View>
        );
      case 'devices':
        return (
          <View style={styles.content}>
            <Text style={styles.title}>Ваши устройства</Text>
            <Text style={styles.subtitle}>Список устройств будет здесь</Text>
          </View>
        );
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
        />
      )}
      
      <View style={styles.mainWrapper}>
        {isMobile && (
          <SideNav 
            activeSection={activeSection}
            onSelectSection={setActiveSection}
            onLogout={onLogout}
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
