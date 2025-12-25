import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AccountModal = ({ visible, onClose, onSave, loading = false, mode = 'create', editData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    bin: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && editData) {
        setFormData({
          name: editData.name || '',
          bin: editData.bin || '',
        });
      } else {
        setFormData({
          name: '',
          bin: '',
        });
      }
      setErrors({});
      setServerError('');
      setServerSuccess('');
    }
  }, [visible, mode, editData]);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Укажите название счета';
    }

    if (!formData.bin.trim()) {
      newErrors.bin = 'Укажите БИН банка';
    } else if (!/^\d{12}$/.test(formData.bin.trim())) {
      newErrors.bin = 'БИН должен содержать ровно 12 цифр';
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
      bin: formData.bin.trim(),
    };

    if (mode === 'edit' && editData) {
      cleanData.id = editData.id;
    }

    try {
      const result = await onSave(cleanData);
      
      if (result.success) {
        setServerSuccess(mode === 'create' ? 'Счет успешно создан!' : 'Счет успешно обновлен!');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setServerError(result.error || `Ошибка ${mode === 'create' ? 'создания' : 'обновления'} счета`);
      }
    } catch (err) {
      setServerError('Ошибка соединения с сервером');
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
              {mode === 'create' ? 'Добавить счет' : 'Редактировать счет'}
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
                <Text className="text-green-600 text-sm">{serverSuccess}</Text>
              </View>
            )}

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Название счета <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800"
                placeholder="Введите название счета"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
              {errors.name && (
                <Text className="text-red-500 text-xs mt-1">{errors.name}</Text>
              )}
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                БИН банка <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800"
                placeholder="Например: 123456789012"
                value={formData.bin}
                onChangeText={(text) => setFormData({ ...formData, bin: text })}
                keyboardType="numeric"
                maxLength={12}
              />
              {errors.bin && (
                <Text className="text-red-500 text-xs mt-1">{errors.bin}</Text>
              )}
            </View>
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

export default AccountModal;
