import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import devicesApi from '../api/devices';
import pricesApi from '../api/prices';
import { accountsApi } from '../api/accounts';
import { usersApi } from '../api/users';
import DeviceModal from '../components/DeviceModal';
import DeviceProductsModal from '../components/DeviceProductsModal';
import ConfirmModal from '../components/ConfirmModal';
import SearchBar from '../components/SearchBar';

const DevicesScreen = ({ userData }) => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [userAccounts, setUserAccounts] = useState({});
  const [myAccounts, setMyAccounts] = useState([]);
  const [accountDevices, setAccountDevices] = useState({});
  const [devicePrices, setDevicePrices] = useState({});
  
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [expandedAccountId, setExpandedAccountId] = useState(null);
  const [expandedDeviceId, setExpandedDeviceId] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  
  const [showDeviceProductsModal, setShowDeviceProductsModal] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  
  const [showDeleteDeviceConfirm, setShowDeleteDeviceConfirm] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      if (userData.idrole === 1) {
        const usersRes = await usersApi.getList({ limit: 1000, search: null });
        if (usersRes.success && usersRes.data) {
          const loadedUsers = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data.rows || []);
          setAllUsers(loadedUsers);
          setUsers(loadedUsers);
        }
      } else {
        const response = await accountsApi.getAccounts(userData.id);
        if (response.success) {
          setMyAccounts(response.data || []);
        }
      }
    } catch (e) {
      setUsers([]);
      setAllUsers([]);
      setMyAccounts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [search]);

  const handleSearch = () => {
    if (!search.trim()) {
      setUsers(allUsers);
      return;
    }

    const searchLower = search.toLowerCase();
    const filtered = allUsers.filter(user => {
      return (
        user.name?.toLowerCase().includes(searchLower) ||
        user.login?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    });
    
    setUsers(filtered);
  };

  const canModifyUser = (user) => {
    if (userData.idrole === 1) return true;
    return user.id === userData.id;
  };

  const toggleUserExpand = async (user) => {
    if (!canModifyUser(user)) return;
    
    if (expandedUserId === user.id) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(user.id);
      if (!userAccounts[user.id]) {
        await loadUserAccounts(user.id);
      }
    }
  };

  const loadUserAccounts = async (userId) => {
    try {
      const response = await accountsApi.getAccounts(userId);
      if (response.success) {
        setUserAccounts(prev => ({ ...prev, [userId]: response.data || [] }));
      }
    } catch (err) {
      setUserAccounts(prev => ({ ...prev, [userId]: [] }));
    }
  };

  const toggleAccountExpand = async (accountId) => {
    if (expandedAccountId === accountId) {
      setExpandedAccountId(null);
    } else {
      setExpandedAccountId(accountId);
      if (!accountDevices[accountId]) {
        await loadAccountDevices(accountId);
      }
    }
  };

  const loadAccountDevices = async (accountId) => {
    try {
      const response = await devicesApi.getDevices(accountId);
      if (response.success) {
        setAccountDevices(prev => ({ ...prev, [accountId]: response.data.rows || [] }));
      }
    } catch (err) {
      setAccountDevices(prev => ({ ...prev, [accountId]: [] }));
    }
  };

  const toggleDeviceExpand = async (deviceId) => {
    if (expandedDeviceId === deviceId) {
      setExpandedDeviceId(null);
    } else {
      setExpandedDeviceId(deviceId);
      if (!devicePrices[deviceId]) {
        await loadDevicePrices(deviceId);
      }
    }
  };

  const loadDevicePrices = async (deviceId) => {
    try {
      const response = await pricesApi.getPrices(deviceId);
      if (response.success) {
        setDevicePrices(prev => ({ ...prev, [deviceId]: response.data || [] }));
      }
    } catch (err) {
      setDevicePrices(prev => ({ ...prev, [deviceId]: [] }));
    }
  };

  const handleOpenCreateDeviceModal = (accountId) => {
    setSelectedAccountId(accountId);
    setEditingDevice(null);
    setShowDeviceModal(true);
  };

  const handleOpenEditDeviceModal = (device) => {
    setEditingDevice(device);
    setShowDeviceModal(true);
  };

  const handleCloseDeviceModal = () => {
    setShowDeviceModal(false);
    setEditingDevice(null);
    setSelectedAccountId(null);
  };

  const handleSaveDevice = async () => {
    if (editingDevice) {
      const accountId = editingDevice.account_id;
      await loadAccountDevices(accountId);
    } else {
      await loadAccountDevices(selectedAccountId);
    }
    handleCloseDeviceModal();
  };

  const handleOpenDeleteDeviceConfirm = (device) => {
    setDeviceToDelete(device);
    setShowDeleteDeviceConfirm(true);
  };

  const handleDeleteDevice = async () => {
    if (!deviceToDelete) return;
    try {
      await devicesApi.delete(deviceToDelete.id);
      await loadAccountDevices(deviceToDelete.account_id);
      setDevicePrices(prev => {
        const newPrices = { ...prev };
        delete newPrices[deviceToDelete.id];
        return newPrices;
      });
    } catch (err) {
      alert('Ошибка при удалении устройства');
    }
    setShowDeleteDeviceConfirm(false);
    setDeviceToDelete(null);
  };

  const handleOpenAssignProductsModal = (deviceId) => {
    setSelectedDeviceId(deviceId);
    setShowDeviceProductsModal(true);
  };

  const handleCloseDeviceProductsModal = () => {
    setShowDeviceProductsModal(false);
    setSelectedDeviceId(null);
  };

  const handleAssignProducts = async () => {
    if (selectedDeviceId) {
      await loadDevicePrices(selectedDeviceId);
    }
    handleCloseDeviceProductsModal();
  };


  return (
    <View className="flex-1 bg-white">
      {userData.idrole === 1 && (
        <SearchBar
          placeholder="Поиск по названию организации, логину или email..."
          value={search}
          onChangeText={setSearch}
          onSearch={handleSearch}
        />
      )}

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : userData.idrole === 1 ? (
        <ScrollView className="flex-1">
          <View className="min-w-full">
            <View className="flex-row bg-gray-100 border-b-2 border-blue-500 p-3">
              <Text className="w-12 font-bold text-center">#</Text>
              <Text className="flex-1 font-bold">Организация</Text>
              <Text className="w-64 font-bold">Email</Text>
            </View>

            {users.map((user, idx) => (
              <View key={user.id}>
                <TouchableOpacity
                  onPress={() => toggleUserExpand(user)}
                  className="flex-row items-center p-3 border-b border-gray-200 hover:bg-gray-50"
                  disabled={!canModifyUser(user)}
                >
                  <Text className="w-12 text-center text-gray-600">{idx + 1}</Text>
                  <View className="flex-1 flex-row items-center">
                    <Ionicons
                      name={expandedUserId === user.id ? 'chevron-down' : 'chevron-forward'}
                      size={20}
                      color="#6b7280"
                    />
                    <Text className="ml-2">{user.name}</Text>
                  </View>
                  <Text className="w-64 text-gray-600">{user.email}</Text>
                </TouchableOpacity>

                {expandedUserId === user.id && (
                  <View className="bg-gray-50 px-8 py-4">
                    <Text className="font-bold text-lg mb-3">Аккаунты организации</Text>
                    <View className="w-full">
                      <View className="flex-row bg-white border border-gray-200 rounded-t-lg p-2">
                        <Text className="w-12 font-semibold text-center">#</Text>
                        <Text className="flex-1 font-semibold">Название</Text>
                        <Text className="w-32 font-semibold">БИН</Text>
                        <Text className="w-40 font-semibold text-center">Действия</Text>
                      </View>

                        {(userAccounts[user.id] || []).map((account, accIdx) => (
                          <View key={account.id} className="bg-white border-l border-r border-b border-gray-200">
                            <View className="flex-row items-center p-2">
                              <Text className="w-12 text-center text-gray-600">{accIdx + 1}</Text>
                              <TouchableOpacity
                                onPress={() => toggleAccountExpand(account.id)}
                                className="flex-1 flex-row items-center"
                              >
                                <Ionicons
                                  name={expandedAccountId === account.id ? 'chevron-down' : 'chevron-forward'}
                                  size={18}
                                  color="#6b7280"
                                />
                                <Text className="ml-2">{account.name}</Text>
                              </TouchableOpacity>
                              <Text className="w-32 text-gray-600">{account.bin}</Text>
                              <View className="w-40 flex-row justify-center gap-2">
                                {userData.idrole === 1 && (
                                  <TouchableOpacity
                                    onPress={() => handleOpenCreateDeviceModal(account.id)}
                                    className="bg-blue-500 rounded px-3 py-1.5"
                                  >
                                    <Text className="text-white text-xs font-medium">Добавить устройство</Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            </View>

                            {expandedAccountId === account.id && (
                              <View className="bg-gray-50 px-6 py-3">
                                <Text className="font-semibold mb-2">Устройства</Text>
                                {(accountDevices[account.id] || []).length === 0 ? (
                                  <Text className="text-gray-500 italic">Нет устройств</Text>
                                ) : (
                                  <View className="bg-white border border-gray-200 rounded-lg">
                                    <View className="flex-row bg-gray-100 p-2 border-b border-gray-200">
                                      <Text className="w-10 font-semibold text-center">#</Text>
                                      <Text className="flex-1 font-semibold">Название</Text>
                                      <Text className="w-32 font-semibold">MachID</Text>
                                      <Text className="w-32 font-semibold text-center">Действия</Text>
                                    </View>

                                    {(accountDevices[account.id] || []).map((device, devIdx) => (
                                      <View key={device.id}>
                                        <View className="flex-row items-center p-2 border-b border-gray-200">
                                          <Text className="w-10 text-center text-gray-600">{devIdx + 1}</Text>
                                          <TouchableOpacity
                                            onPress={() => toggleDeviceExpand(device.id)}
                                            className="flex-1 flex-row items-center"
                                          >
                                            <Ionicons
                                              name={expandedDeviceId === device.id ? 'chevron-down' : 'chevron-forward'}
                                              size={16}
                                              color="#6b7280"
                                            />
                                            <Text className="ml-2">{device.name}</Text>
                                          </TouchableOpacity>
                                          <Text className="w-32 text-gray-600 text-sm">{device.machid}</Text>
                                          <View className="w-32 flex-row justify-center gap-2">
                                            <TouchableOpacity
                                              onPress={() => handleOpenEditDeviceModal(device)}
                                              className="bg-orange-50 p-1.5 rounded"
                                            >
                                              <Ionicons name="pencil" size={16} color="#FF6B35" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                              onPress={() => handleOpenDeleteDeviceConfirm(device)}
                                              className="bg-red-50 p-1.5 rounded"
                                            >
                                              <Ionicons name="trash" size={16} color="#ef4444" />
                                            </TouchableOpacity>
                                          </View>
                                        </View>

                                        {expandedDeviceId === device.id && (
                                          <View className="bg-gray-50 px-4 py-3">
                                            <View className="flex-row items-center mb-2">
                                              <Text className="font-semibold mr-2">Товары</Text>
                                            </View>

                                            {(devicePrices[device.id] || []).length === 0 ? (
                                              <Text className="text-gray-500 italic text-sm">Нет товаров</Text>
                                            ) : (
                                              <View className="bg-white border border-gray-200 rounded overflow-hidden">
                                                <View className="flex-row bg-gray-100 p-3 border-b border-gray-200">
                                                  <Text className="w-12 font-semibold text-center">#</Text>
                                                  <Text className="flex-1 font-semibold">Название</Text>
                                                  <Text className="w-24 font-semibold text-center">Кол-во</Text>
                                                  <Text className="w-32 font-semibold">Цена (тг)</Text>
                                                  <Text className="w-24 font-semibold text-center">Фото</Text>
                                                </View>

                                                {(devicePrices[device.id] || []).map((product, priceIdx) => (
                                                  <View key={product.id} className="flex-row items-center p-3 border-b border-gray-100 hover:bg-gray-50">
                                                    <Text className="w-12 text-center text-gray-600">{priceIdx + 1}</Text>
                                                    <View className="flex-1">
                                                      <Text className="font-medium">{product.name_ru}</Text>
                                                      {product.category && (
                                                        <Text className="text-xs text-gray-500 mt-1">{product.category}</Text>
                                                      )}
                                                    </View>
                                                    <Text className="w-24 text-center text-gray-700 font-medium">{product.quantity} шт</Text>
                                                    <Text className="w-32">{product.selling_price} ₸</Text>
                                                    <View className="w-24 items-center">
                                                      {product.image_url ? (
                                                        <Image
                                                          source={{ uri: product.image_url }}
                                                          className="w-16 h-16 rounded-lg"
                                                          resizeMode="cover"
                                                        />
                                                      ) : (
                                                        <View className="w-16 h-16 bg-gray-100 rounded-lg items-center justify-center">
                                                          <Ionicons name="image-outline" size={24} color="#9ca3af" />
                                                        </View>
                                                      )}
                                                    </View>
                                                  </View>
                                                ))}
                                              </View>
                                            )}
                                          </View>
                                        )}
                                      </View>
                                    ))}
                                  </View>
                                )}
                              </View>
                            )}
                          </View>
                        ))}
                      </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView className="flex-1">
          <View className="p-4">
            <Text className="text-xl font-bold mb-4">Мои счета</Text>
            
            {myAccounts.length === 0 ? (
              <Text className="text-gray-500 italic">Нет счетов</Text>
            ) : (
              <View className="bg-white border border-gray-200 rounded-lg">
                <View className="flex-row bg-gray-100 p-3 border-b border-gray-200">
                  <Text className="w-12 font-semibold text-center">#</Text>
                  <Text className="flex-1 font-semibold">Название</Text>
                  <Text className="w-32 font-semibold">БИН</Text>
                </View>

                {myAccounts.map((account, accIdx) => (
                  <View key={account.id}>
                    <View className="flex-row items-center p-3 border-b border-gray-200">
                      <Text className="w-12 text-center text-gray-600">{accIdx + 1}</Text>
                      <TouchableOpacity
                        onPress={() => toggleAccountExpand(account.id)}
                        className="flex-1 flex-row items-center"
                      >
                        <Ionicons
                          name={expandedAccountId === account.id ? 'chevron-down' : 'chevron-forward'}
                          size={18}
                          color="#6b7280"
                        />
                        <Text className="ml-2">{account.name}</Text>
                      </TouchableOpacity>
                      <Text className="w-32 text-gray-600">{account.bin}</Text>
                    </View>

                    {expandedAccountId === account.id && (
                      <View className="bg-gray-50 px-6 py-3">
                        <Text className="font-semibold mb-2">Устройства</Text>
                        {(accountDevices[account.id] || []).length === 0 ? (
                          <Text className="text-gray-500 italic">Нет устройств</Text>
                        ) : (
                          <View className="bg-white border border-gray-200 rounded-lg">
                            <View className="flex-row bg-gray-100 p-2 border-b border-gray-200">
                              <Text className="w-10 font-semibold text-center">#</Text>
                              <Text className="flex-1 font-semibold">Название</Text>
                              <Text className="w-32 font-semibold">MachID</Text>
                            </View>

                            {(accountDevices[account.id] || []).map((device, devIdx) => (
                              <View key={device.id}>
                                <View className="flex-row items-center p-2 border-b border-gray-200">
                                  <Text className="w-10 text-center text-gray-600">{devIdx + 1}</Text>
                                  <TouchableOpacity
                                    onPress={() => toggleDeviceExpand(device.id)}
                                    className="flex-1 flex-row items-center"
                                  >
                                    <Ionicons
                                      name={expandedDeviceId === device.id ? 'chevron-down' : 'chevron-forward'}
                                      size={16}
                                      color="#6b7280"
                                    />
                                    <Text className="ml-2">{device.name}</Text>
                                  </TouchableOpacity>
                                  <Text className="w-32 text-gray-600 text-sm">{device.machid}</Text>
                                </View>

                                {expandedDeviceId === device.id && (
                                  <View className="bg-gray-50 px-4 py-3">
                                    <View className="flex-row items-center mb-2">
                                      <Text className="font-semibold mr-2">Товары</Text>
                                      {userData.idrole === 2 && (
                                        <TouchableOpacity
                                          onPress={() => handleOpenAssignProductsModal(device.id)}
                                          className="bg-blue-500 rounded px-2 py-1"
                                        >
                                          <Text className="text-white text-xs">Распределить</Text>
                                        </TouchableOpacity>
                                      )}
                                    </View>

                                    {(devicePrices[device.id] || []).length === 0 ? (
                                      <Text className="text-gray-500 italic text-sm">Нет товаров</Text>
                                    ) : (
                                      <View className="bg-white border border-gray-200 rounded overflow-hidden">
                                        <View className="flex-row bg-gray-100 p-3 border-b border-gray-200">
                                          <Text className="w-12 font-semibold text-center">#</Text>
                                          <Text className="flex-1 font-semibold">Название</Text>
                                          <Text className="w-24 font-semibold text-center">Кол-во</Text>
                                          <Text className="w-32 font-semibold">Цена (тг)</Text>
                                          <Text className="w-24 font-semibold text-center">Фото</Text>
                                        </View>

                                        {(devicePrices[device.id] || []).map((product, priceIdx) => (
                                          <View key={product.id} className="flex-row items-center p-3 border-b border-gray-100">
                                            <Text className="w-12 text-center text-gray-600">{priceIdx + 1}</Text>
                                            <View className="flex-1">
                                              <Text className="font-medium">{product.name_ru}</Text>
                                              {product.category && (
                                                <Text className="text-xs text-gray-500 mt-1">{product.category}</Text>
                                              )}
                                            </View>
                                            <Text className="w-24 text-center text-gray-700 font-medium">{product.quantity} шт</Text>
                                            <Text className="w-32">{product.selling_price} ₸</Text>
                                            <View className="w-24 items-center">
                                              {product.image_url ? (
                                                <Image
                                                  source={{ uri: product.image_url }}
                                                  className="w-16 h-16 rounded-lg"
                                                  resizeMode="cover"
                                                />
                                              ) : (
                                                <View className="w-16 h-16 bg-gray-100 rounded-lg items-center justify-center">
                                                  <Ionicons name="image-outline" size={24} color="#9ca3af" />
                                                </View>
                                              )}
                                            </View>
                                          </View>
                                        ))}
                                      </View>
                                    )}
                                  </View>
                                )}
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {userData.idrole === 1 && (
        <DeviceModal
          visible={showDeviceModal}
          onClose={handleCloseDeviceModal}
          onSave={handleSaveDevice}
          device={editingDevice}
          mode={editingDevice ? 'edit' : 'create'}
          accountId={selectedAccountId}
        />
      )}

      {userData.idrole === 1 && (
        <ConfirmModal
          visible={showDeleteDeviceConfirm}
          title="Удалить устройство?"
          message={`Вы уверены, что хотите удалить устройство "${deviceToDelete?.name}"?`}
          onConfirm={handleDeleteDevice}
          onCancel={() => {
            setShowDeleteDeviceConfirm(false);
            setDeviceToDelete(null);
          }}
        />
      )}

      {userData.idrole === 2 && (
        <DeviceProductsModal
          visible={showDeviceProductsModal}
          onClose={handleCloseDeviceProductsModal}
          onSave={handleAssignProducts}
          deviceId={selectedDeviceId}
        />
      )}
    </View>
  );
};

export default DevicesScreen;
