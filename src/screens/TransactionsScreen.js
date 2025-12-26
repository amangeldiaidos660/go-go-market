import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ordersApi } from '../api/orders';
import devicesApi from '../api/devices';
import { accountsApi } from '../api/accounts';
import { usersApi } from '../api/users';

const TransactionsScreen = ({ userData }) => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedMachid, setSelectedMachid] = useState(null);
  const [error, setError] = useState(null);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    if (devices.length > 0) {
      if (selectedMachid) {
        loadTransactions(selectedMachid);
      } else {
        loadAllTransactions();
      }
    }
  }, [devices, selectedMachid]);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const allDevices = [];
      
      if (userData.idrole === 1) {
        const usersRes = await usersApi.getList({ limit: 1000, search: null });
        if (usersRes.success && usersRes.data) {
          const users = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data.rows || []);
          
          for (const user of users) {
            const accountsRes = await accountsApi.getAccounts(user.id);
            if (accountsRes.success && accountsRes.data) {
              const accounts = accountsRes.data;
              
              for (const account of accounts) {
                const devicesRes = await devicesApi.getDevices(account.id);
                if (devicesRes.success && devicesRes.data?.rows) {
                  devicesRes.data.rows.forEach(device => {
                    allDevices.push({
                      ...device,
                      accountName: account.name,
                      userName: user.name,
                    });
                  });
                }
              }
            }
          }
        }
      } else {
        const accountsRes = await accountsApi.getAccounts(userData.id);
        if (accountsRes.success && accountsRes.data) {
          const accounts = accountsRes.data;
          
          for (const account of accounts) {
            const devicesRes = await devicesApi.getDevices(account.id);
            if (devicesRes.success && devicesRes.data?.rows) {
              devicesRes.data.rows.forEach(device => {
                allDevices.push({
                  ...device,
                  accountName: account.name,
                });
              });
            }
          }
        }
      }
      
      setDevices(allDevices);
      
      if (allDevices.length > 0 && !selectedMachid) {
        setSelectedMachid(allDevices[0].machid);
      }
    } catch (err) {
      setError('Ошибка загрузки устройств');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (machid) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordersApi.getOrdersByMachid(machid);
      if (response.success) {
        setTransactions(response.data || []);
      } else {
        setError(response.error || 'Ошибка загрузки транзакций');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const loadAllTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const allTransactions = [];
      
      for (const device of devices) {
        const response = await ordersApi.getOrdersByMachid(device.machid);
        if (response.success && response.data) {
          response.data.forEach(order => {
            allTransactions.push({
              ...order,
              deviceName: device.name,
              accountName: device.accountName,
            });
          });
        }
      }
      
      allTransactions.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB - dateA;
      });
      
      setTransactions(allTransactions);
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const parseProductName = (productNameStr) => {
    try {
      const products = JSON.parse(productNameStr);
      if (Array.isArray(products)) {
        return products.map(p => `${p.name} (${p.quantity} шт)`).join(', ');
      }
      return productNameStr;
    } catch {
      return productNameStr;
    }
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text className="mt-2 text-gray-600">Загрузка транзакций...</Text>
      </View>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text className="mt-4 text-red-600 text-lg font-semibold">Ошибка</Text>
        <Text className="mt-2 text-gray-600 text-center">{error}</Text>
        <TouchableOpacity
          onPress={() => {
            if (selectedMachid) {
              loadTransactions(selectedMachid);
            } else {
              loadAllTransactions();
            }
          }}
          className="mt-4 bg-primary px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <View className="p-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">Транзакции</Text>
        <Text className="text-sm text-gray-600 mt-1">История оплаченных транзакций</Text>
      </View>

      {devices.length > 1 && (
        <View className="p-4 bg-white border-b border-gray-200">
          <Text className="text-sm font-medium text-gray-700 mb-2">Фильтр по устройству</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            <TouchableOpacity
              onPress={() => setSelectedMachid(null)}
              className={`px-4 py-2 rounded-lg mr-2 ${
                selectedMachid === null
                  ? 'bg-primary'
                  : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedMachid === null
                    ? 'text-white'
                    : 'text-gray-700'
                }`}
              >
                Все устройства
              </Text>
            </TouchableOpacity>
            {devices.map(device => (
              <TouchableOpacity
                key={device.machid}
                onPress={() => setSelectedMachid(device.machid)}
                className={`px-4 py-2 rounded-lg mr-2 ${
                  selectedMachid === device.machid
                    ? 'bg-primary'
                    : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedMachid === device.machid
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {device.name} ({device.machid})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView className="flex-1 p-4">
        {transactions.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text className="mt-4 text-gray-400 text-lg">Нет транзакций</Text>
            <Text className="text-gray-400 text-sm mt-2">
              {selectedMachid ? 'Для выбранного устройства нет оплаченных транзакций' : 'Нет оплаченных транзакций'}
            </Text>
          </View>
        ) : (
          <View className="bg-white rounded-lg shadow-sm overflow-hidden">
            {isMobile ? (
              transactions.map((transaction, index) => (
                <View
                  key={transaction.id}
                  className={`p-4 ${index < transactions.length - 1 ? 'border-b border-gray-200' : ''}`}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-800">
                        {formatDate(transaction.created_at)}
                      </Text>
                      {transaction.deviceName && (
                        <Text className="text-xs text-gray-500 mt-1">
                          {transaction.deviceName} ({transaction.device_id})
                        </Text>
                      )}
                    </View>
                    <View className="bg-green-50 px-3 py-1 rounded">
                      <Text className="text-sm font-bold text-green-700">
                        {transaction.amount.toFixed(2)} ₸
                      </Text>
                    </View>
                  </View>
                  <View className="mt-2">
                    <Text className="text-xs text-gray-500 mb-1">Товары:</Text>
                    <Text className="text-sm text-gray-700">
                      {parseProductName(transaction.product_name)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <>
                <View className="flex-row bg-gray-100 border-b-2 border-primary p-3">
                  <Text className="w-16 font-bold text-center">#</Text>
                  <Text className="flex-1 font-bold">Дата и время</Text>
                  <Text className="w-48 font-bold">Устройство</Text>
                  <Text className="flex-1 font-bold">Товары</Text>
                  <Text className="w-32 font-bold text-right">Сумма</Text>
                </View>
                {transactions.map((transaction, index) => (
                  <View
                    key={transaction.id}
                    className={`flex-row items-center p-3 border-b border-gray-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <Text className="w-16 text-center text-gray-600">{index + 1}</Text>
                    <Text className="flex-1 text-sm text-gray-700">
                      {formatDate(transaction.created_at)}
                    </Text>
                    <View className="w-48">
                      {transaction.deviceName ? (
                        <>
                          <Text className="text-sm text-gray-800">{transaction.deviceName}</Text>
                          <Text className="text-xs text-gray-500">ID: {transaction.device_id}</Text>
                        </>
                      ) : (
                        <Text className="text-sm text-gray-600">{transaction.device_id}</Text>
                      )}
                    </View>
                    <Text className="flex-1 text-sm text-gray-700">
                      {parseProductName(transaction.product_name)}
                    </Text>
                    <View className="w-32 items-end">
                      <View className="bg-green-50 px-3 py-1 rounded">
                        <Text className="text-sm font-bold text-green-700">
                          {transaction.amount.toFixed(2)} ₸
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default TransactionsScreen;

