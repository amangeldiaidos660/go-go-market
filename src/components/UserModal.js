import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const generateSecurePassword = () => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

const UserModal = ({ visible, onClose, onSave, loading = false, mode = 'create', editData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    login: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && editData) {
        setFormData({
          name: editData.name || '',
          email: editData.email || '',
          login: editData.login || '',
          password: '',
        });
      } else {
        const newPassword = generateSecurePassword();
        setFormData({
          name: '',
          email: '',
          login: '',
          password: newPassword,
        });
      }
      setErrors({});
      setServerError('');
      setServerSuccess('');
    }
  }, [visible, mode, editData]);

  const handleEmailChange = (email) => {
    const loginPart = email.split('@')[0];
    if (mode === 'create' && loginPart && !formData.login) {
      setFormData({ ...formData, email, login: loginPart });
    } else {
      setFormData({ ...formData, email });
    }
  };

  const regeneratePassword = () => {
    const newPassword = generateSecurePassword();
    setFormData({ ...formData, password: newPassword });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Укажите название организации';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Укажите email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Некорректный email';
    }

    if (!formData.login.trim()) {
      newErrors.login = 'Укажите логин';
    }

    if (mode === 'create' && !formData.password) {
      newErrors.password = 'Пароль не сгенерирован';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setServerError('');
    setServerSuccess('');

    const cleanData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      login: formData.login.trim().toLowerCase(),
      idrole: 2,
    };

    if (mode === 'create') {
      cleanData.password = formData.password;
    }

    if (mode === 'edit' && editData) {
      cleanData.id = editData.id;
    }

    try {
      const result = await onSave(cleanData);
      
      if (result.success) {
        setServerSuccess(mode === 'create' ? 'Пользователь успешно создан!' : 'Пользователь успешно обновлен!');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setServerError(result.error || `Ошибка ${mode === 'create' ? 'создания' : 'обновления'} пользователя`);
      }
    } catch (err) {
      setServerError('Ошибка соединения с сервером');
    }
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-xl w-[90%] max-w-[500px] max-h-[90%]">
          <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-800">
              {mode === 'create' ? 'Добавить пользователя' : 'Редактировать пользователя'}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-5">
            {serverError && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <Text className="text-red-600 text-sm">{serverError}</Text>
              </View>
            )}

            {serverSuccess && (
              <View className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                <Text className="text-orange-600 text-sm">{serverSuccess}</Text>
              </View>
            )}

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Название организации <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800"
                placeholder="Введите название организации"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
              {errors.name && (
                <Text className="text-red-500 text-xs mt-1">{errors.name}</Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Email <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800"
                placeholder="example@domain.com"
                value={formData.email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Логин <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800"
                placeholder="Логин пользователя"
                value={formData.login}
                onChangeText={(text) => setFormData({ ...formData, login: text })}
                autoCapitalize="none"
              />
              {errors.login && (
                <Text className="text-red-500 text-xs mt-1">{errors.login}</Text>
              )}
            </View>

            {mode === 'create' && (
              <>
                <View className="mb-2">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">
                    Пароль <Text className="text-red-500">*</Text>
                  </Text>
                  <View className="flex-row gap-2">
                    <TextInput
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800"
                      value={formData.password}
                      editable={false}
                      selectTextOnFocus={true}
                    />
                    <TouchableOpacity
                      className="bg-gray-100 rounded-lg px-4 justify-center items-center"
                      onPress={regeneratePassword}
                    >
                      <Ionicons name="refresh" size={20} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-gray-100 rounded-lg px-4 justify-center items-center"
                      onPress={() => copyToClipboard(formData.password)}
                    >
                      <Ionicons name="copy-outline" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>
                  )}
                </View>

                <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <View className="flex-row items-start gap-2">
                    <Ionicons name="warning" size={20} color="#f59e0b" />
                    <Text className="flex-1 text-yellow-700 text-xs">
                      Важно! Сохраните пароль перед созданием пользователя. После создания вы не сможете его увидеть снова.
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          <View className="flex-row gap-3 p-5 border-t border-gray-200">
            <TouchableOpacity
              className="flex-1 bg-gray-200 rounded-lg py-3 justify-center items-center"
              onPress={onClose}
              disabled={loading}
            >
              <Text className="text-gray-700 text-base font-semibold">Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-blue-500 rounded-lg py-3 justify-center items-center"
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  {mode === 'create' ? 'Создать' : 'Сохранить'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UserModal;
