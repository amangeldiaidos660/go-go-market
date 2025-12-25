import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import devicesApi from '../api/devices';

const DeviceModal = ({ visible, onClose, onSave, device, mode, accountId }) => {
  const [formData, setFormData] = useState({
    name: '',
    name2: '',
    machid: '',
    descr: '',
    descr2: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && device) {
        setFormData({
          name: device.name || '',
          name2: device.name2 || '',
          machid: device.machid || '',
          descr: device.descr || '',
          descr2: device.descr2 || ''
        });
      } else if (mode === 'create') {
        setFormData({
          name: '',
          name2: '',
          machid: '',
          descr: '',
          descr2: ''
        });
        generateMachid();
      }
      setError('');
      setServerError('');
      setServerSuccess('');
    }
  }, [visible, device, mode]);

  const generateMachid = async () => {
    try {
      const response = await devicesApi.getMachid();
      if (response.success && response.machid) {
        setFormData(prev => ({ ...prev, machid: response.machid.toString() }));
      }
    } catch (err) {
      console.error('Error generating machid:', err);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Название (RU) обязательно');
      return;
    }

    if (!formData.machid) {
      setError('MachID обязателен');
      return;
    }

    setLoading(true);
    setError('');
    setServerError('');
    setServerSuccess('');

    try {
      const payload = {
        name: formData.name,
        name2: formData.name2 || '',
        machid: formData.machid ? parseInt(formData.machid) : null,
        descr: formData.descr || '',
        descr2: formData.descr2 || '',
        account_id: mode === 'edit' ? device.account_id : parseInt(accountId),
        dev_type: 2,
        amount: 100
      };

      if (mode === 'edit') {
        payload.id = device.id;
      }

      const response = mode === 'edit' 
        ? await devicesApi.update(payload)
        : await devicesApi.create(payload);

      if (response.OK || response.success) {
        setServerSuccess(mode === 'edit' ? 'Устройство успешно обновлено!' : 'Устройство успешно создано!');
        setTimeout(() => {
          onSave();
          onClose();
        }, 1500);
      } else {
        const errorMsg = Array.isArray(response.error) 
          ? response.error.map(e => e.msg || JSON.stringify(e)).join('\n')
          : response.error || 'Ошибка при сохранении';
        setServerError(errorMsg);
      }
    } catch (err) {
      setServerError(err.message || 'Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-lg p-6 w-11/12 max-w-md">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold">
              {mode === 'edit' ? 'Редактировать устройство' : 'Добавить устройство'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView className="max-h-96">
            {error && (
              <View className="bg-red-50 border border-red-200 rounded p-2 mb-3">
                <Text className="text-red-600 text-sm">{error}</Text>
              </View>
            )}

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
              <Text className="mb-1 font-medium">Название (RU) *</Text>
              <TextInput
                className="border border-gray-300 rounded px-3 py-2"
                value={formData.name}
                onChangeText={(value) => handleChange('name', value)}
                placeholder="Введите название"
              />
            </View>

            <View className="mb-4">
              <Text className="mb-1 font-medium">Название (KZ)</Text>
              <TextInput
                className="border border-gray-300 rounded px-3 py-2"
                value={formData.name2}
                onChangeText={(value) => handleChange('name2', value)}
                placeholder="Атауын енгізіңіз"
              />
            </View>

            <View className="mb-4">
              <Text className="mb-1 font-medium">MachID</Text>
              <TextInput
                className="border border-gray-300 rounded px-3 py-2 bg-gray-100"
                value={formData.machid}
                editable={false}
              />
            </View>

            <View className="mb-4">
              <Text className="mb-1 font-medium">Описание (RU)</Text>
              <TextInput
                className="border border-gray-300 rounded px-3 py-2"
                value={formData.descr}
                onChangeText={(value) => handleChange('descr', value)}
                placeholder="Описание устройства"
                multiline
                numberOfLines={3}
              />
            </View>

            <View className="mb-4">
              <Text className="mb-1 font-medium">Описание (KZ)</Text>
              <TextInput
                className="border border-gray-300 rounded px-3 py-2"
                value={formData.descr2}
                onChangeText={(value) => handleChange('descr2', value)}
                placeholder="Құрылғының сипаттамасы"
                multiline
                numberOfLines={3}
              />
            </View>

            {error && (
              <View className="mb-4 p-3 bg-red-50 rounded">
                <Text className="text-red-600">{error}</Text>
              </View>
            )}
          </ScrollView>

          <View className="flex-row gap-2 mt-4">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 border border-gray-300 rounded px-4 py-2"
            >
              <Text className="text-center text-gray-700">Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className="flex-1 bg-blue-500 rounded px-4 py-2"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-center text-white font-medium">Сохранить</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeviceModal;
