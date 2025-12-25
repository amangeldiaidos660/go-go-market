import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usersApi } from '../api/users';
import { accountsApi } from '../api/accounts';
import UserModal from '../components/UserModal';
import ConfirmModal from '../components/ConfirmModal';
import SearchBar from '../components/SearchBar';
import AccountModal from '../components/AccountModal';

const UsersScreen = ({ userData }) => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingUser, setEditingUser] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [userAccounts, setUserAccounts] = useState({});
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [accountModalLoading, setAccountModalLoading] = useState(false);
  const [accountModalMode, setAccountModalMode] = useState('create');
  const [editingAccount, setEditingAccount] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [confirmAccountVisible, setConfirmAccountVisible] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(null);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await usersApi.getList({ search: null, limit: 1000 });
      
      if (response.success) {
        const loadedUsers = response.data.rows || [];
        setAllUsers(loadedUsers);
        setUsers(loadedUsers);
        setTotal(response.data.total || 0);
      } else {
        setError(response.error || 'Ошибка загрузки пользователей');
      }
    } catch (err) {
      console.error('Load users error:', err);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
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
    if (!userData) return false;
    if (user.id === userData.id) return false;
    if (user.idrole <= userData.idrole) return false;
    return true;
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingUser(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (user) => {
    if (!canModifyUser(user)) {
      if (user.id === userData.id) {
        alert('Вы не можете редактировать свои собственные данные');
      } else {
        alert('Вы не можете редактировать пользователя с ролью выше или равной вашей');
      }
      return;
    }
    setModalMode('edit');
    setEditingUser(user);
    setModalVisible(true);
  };

  const handleSaveUser = async (userData) => {
    setModalLoading(true);
    try {
      let response;
      if (modalMode === 'create') {
        response = await usersApi.create(userData);
      } else {
        response = await usersApi.update(userData.id, userData);
      }
      
      setModalLoading(false);
      
      if (response.success) {
        loadUsers();
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      setModalLoading(false);
      return { success: false, error: 'Ошибка соединения с сервером' };
    }
  };

  const handleOpenDeleteModal = (user) => {
    if (!canModifyUser(user)) {
      if (user.id === userData.id) {
        alert('Вы не можете удалить свой собственный аккаунт');
      } else {
        alert('Вы не можете удалить пользователя с ролью выше или равной вашей');
      }
      return;
    }
    setDeletingUser(user);
    setConfirmVisible(true);
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    setDeleteLoading(true);
    try {handleOpenCreateModal
      const response = await usersApi.delete(deletingUser.id);
      setDeleteLoading(false);
      
      if (response.success) {
        setConfirmVisible(false);
        setDeletingUser(null);
        loadUsers();
      } else {
        alert(response.error || 'Ошибка удаления пользователя');
      }
    } catch (err) {
      setDeleteLoading(false);
      alert('Ошибка соединения с сервером');
    }
  };

  const toggleUserExpand = async (user) => {
    if (!canModifyUser(user)) {
      return;
    }

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
        setUserAccounts(prev => ({
          ...prev,
          [userId]: response.data || []
        }));
      } else {
        console.error('Error loading accounts:', response.error);
        setUserAccounts(prev => ({
          ...prev,
          [userId]: []
        }));
      }
    } catch (err) {
      console.error('Error loading accounts:', err);
      setUserAccounts(prev => ({
        ...prev,
        [userId]: []
      }));
    }
  };

  const handleOpenCreateAccountModal = (userId) => {
    setSelectedUserId(userId);
    setAccountModalMode('create');
    setEditingAccount(null);
    setAccountModalVisible(true);
  };

  const handleOpenEditAccountModal = (account, userId) => {
    setSelectedUserId(userId);
    setAccountModalMode('edit');
    setEditingAccount(account);
    setAccountModalVisible(true);
  };

  const handleSaveAccount = async (accountData) => {
    setAccountModalLoading(true);
    try {
      let response;
      
      if (accountModalMode === 'create') {
        response = await accountsApi.create({
          user_id: selectedUserId,
          name: accountData.name,
          bin: accountData.bin,
        });
      } else {
        response = await accountsApi.update({
          id: editingAccount.id,
          user_id: selectedUserId,
          name: accountData.name,
          bin: accountData.bin,
        });
      }
      
      setAccountModalLoading(false);
      
      if (response.success) {
        await loadUserAccounts(selectedUserId);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Ошибка сохранения счета' };
      }
    } catch (err) {
      setAccountModalLoading(false);
      return { success: false, error: 'Ошибка соединения с сервером' };
    }
  };

  const handleOpenDeleteAccountModal = (account, userId) => {
    setSelectedUserId(userId);
    setDeletingAccount(account);
    setConfirmAccountVisible(true);
  };

  const handleDeleteAccount = async () => {
    if (!deletingAccount) return;

    setDeleteAccountLoading(true);
    try {
      const response = await accountsApi.delete(deletingAccount.id);
      
      if (response.success) {
        await loadUserAccounts(selectedUserId);
        setDeleteAccountLoading(false);
        setConfirmAccountVisible(false);
        setDeletingAccount(null);
      } else {
        setDeleteAccountLoading(false);
        alert(response.error || 'Ошибка удаления счета');
      }
    } catch (err) {
      setDeleteAccountLoading(false);
      alert('Ошибка соединения с сервером');
    }
  };

  if (loading && users.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text className="mt-2.5 text-base text-gray-600">Загрузка пользователей...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <SearchBar
        placeholder="Поиск по имени, логину или email..."
        value={search}
        onChangeText={setSearch}
        onSearch={handleSearch}
        onAdd={() => setModalVisible(true)}
        addButtonText="Добавить пользователя"
        showAddButton={true}
      />
      {error && (
        <View className="flex-row items-center p-4 m-4 bg-white rounded-lg border-l-4 border-red-500 gap-2.5">
          <Ionicons name="alert-circle" size={24} color="#ff3b30" />
          <Text className="flex-1 text-sm text-red-500">{error}</Text>
        </View>
      )}

      {!error && users.length === 0 && (
        <View className="flex-1 justify-center items-center p-10">
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text className="mt-4 text-base text-gray-400">Пользователи не найдены</Text>
        </View>
      )}

      {users.length > 0 && (
        <ScrollView className="flex-1 bg-white m-4 rounded-lg shadow-sm" horizontal>
          <View className="flex-1">
            <View className="flex-row bg-gray-100 border-b-2 border-primary py-3 px-4 min-w-[1082px]">
              <Text className="w-[60px] text-sm font-bold text-gray-800">ID</Text>
              <Text className="w-[150px] text-sm font-bold text-gray-800">Имя</Text>
              <Text className="w-[120px] text-sm font-bold text-gray-800">Логин</Text>
              <Text className="w-[200px] text-sm font-bold text-gray-800">Email</Text>
              <Text className="w-[120px] text-sm font-bold text-gray-800">Роль</Text>
              <Text className="w-[150px] text-sm font-bold text-gray-800">Создан</Text>
              <Text className="w-[100px] text-sm font-bold text-gray-800">Действия</Text>
            </View>

            <ScrollView className="max-h-[600px]">
              {users.map((user) => (
                <View key={user.id}>
                  <View className="flex-row border-b border-gray-200 py-3 px-4 min-w-[1082px]">
                    <Text className="w-[60px] text-sm text-gray-800 justify-center">{user.id}</Text>
                    <Text className="w-[150px] text-sm text-gray-800 font-medium justify-center">{user.name}</Text>
                    <Text className="w-[120px] text-sm text-gray-600 justify-center">@{user.login}</Text>
                    <Text className="w-[200px] text-sm text-gray-600 justify-center">{user.email}</Text>
                    <View className="w-[120px] justify-center">
                      <View className="bg-primary px-2.5 py-1 rounded-xl self-start">
                        <Text className="text-xs font-semibold text-white">{user.role_name}</Text>
                      </View>
                    </View>
                    <Text className="w-[150px] text-xs text-gray-400 justify-center">{user.created_at}</Text>
                    <View className="w-[100px] justify-center">
                      <View className="flex-row gap-2">
                        {canModifyUser(user) ? (
                          <>
                            <TouchableOpacity onPress={() => toggleUserExpand(user)} className="p-1.5 bg-gray-100 rounded">
                              <Ionicons 
                                name={expandedUserId === user.id ? "chevron-down" : "chevron-forward"} 
                                size={18} 
                                color="#666" 
                              />
                            </TouchableOpacity>
                            <TouchableOpacity 
                              className="p-1.5 bg-green-50 rounded"
                              onPress={() => handleOpenEditModal(user)}
                            >
                              <Ionicons name="pencil" size={18} color="#FF6B35" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                              className="p-1.5 bg-red-50 rounded"
                              onPress={() => handleOpenDeleteModal(user)}
                            >
                              <Ionicons name="trash" size={18} color="#ff3b30" />
                            </TouchableOpacity>
                          </>
                        ) : (
                          <View className="flex-row items-center gap-1">
                            <Ionicons name="lock-closed" size={16} color="#999" />
                            <Text className="text-xs text-gray-400">Нет прав</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  {expandedUserId === user.id && (
                    <View className="bg-gray-50 px-8 py-4 border-b border-gray-200">
                      <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-base font-bold text-gray-700">Счета пользователя</Text>
                        <TouchableOpacity
                          className="bg-blue-500 px-4 py-2 rounded-lg flex-row items-center gap-2"
                          onPress={() => handleOpenCreateAccountModal(user.id)}
                        >
                          <Ionicons name="add" size={18} color="#fff" />
                          <Text className="text-white text-sm font-semibold">Добавить счет</Text>
                        </TouchableOpacity>
                      </View>

                      {userAccounts[user.id] && userAccounts[user.id].length > 0 ? (
                        <View className="bg-white rounded-lg overflow-hidden">
                          <View className="flex-row bg-gray-100 border-b border-gray-200 py-2 px-3">
                            <Text className="w-[200px] text-xs font-bold text-gray-700">Название счета</Text>
                            <Text className="w-[200px] text-xs font-bold text-gray-700">БИН банка</Text>
                            <Text className="w-[100px] text-xs font-bold text-gray-700">Действия</Text>
                          </View>

                          {userAccounts[user.id].map((account) => (
                            <View key={account.id} className="flex-row border-b border-gray-100 py-2 px-3">
                              <Text className="w-[200px] text-sm text-gray-800">{account.name}</Text>
                              <Text className="w-[200px] text-sm text-gray-800">{account.bin}</Text>
                              <View className="w-[100px] flex-row gap-2">
                                <TouchableOpacity
                                  className="p-1.5 bg-blue-50 rounded"
                                  onPress={() => handleOpenEditAccountModal(account, user.id)}
                                >
                                  <Ionicons name="pencil" size={16} color="#3b82f6" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  className="p-1.5 bg-red-50 rounded"
                                  onPress={() => handleOpenDeleteAccountModal(account, user.id)}
                                >
                                  <Ionicons name="trash" size={16} color="#ef4444" />
                                </TouchableOpacity>
                              </View>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <View className="bg-white rounded-lg p-6 items-center">
                          <Ionicons name="wallet-outline" size={48} color="#ccc" />
                          <Text className="text-gray-400 mt-2">У пользователя нет счетов</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      )}

      <UserModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveUser}
        loading={modalLoading}
        mode={modalMode}
        editData={editingUser}
      />

      <ConfirmModal
        visible={confirmVisible}
        onClose={() => setConfirmVisible(false)}
        onConfirm={handleDeleteUser}
        loading={deleteLoading}
        title="Удалить пользователя"
        message="Вы действительно хотите удалить этого пользователя?"
        userName={deletingUser?.name}
      />

      <AccountModal
        visible={accountModalVisible}
        onClose={() => setAccountModalVisible(false)}
        onSave={handleSaveAccount}
        loading={accountModalLoading}
        mode={accountModalMode}
        editData={editingAccount}
      />

      <ConfirmModal
        visible={confirmAccountVisible}
        onClose={() => setConfirmAccountVisible(false)}
        onConfirm={handleDeleteAccount}
        loading={deleteAccountLoading}
        title="Удалить счет"
        message="Вы действительно хотите удалить этот счет?"
        userName={deletingAccount?.account_number}
      />
    </View>
  );
};

export default UsersScreen;
