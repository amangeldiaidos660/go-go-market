import React from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ConfirmModal = ({ visible, onClose, onConfirm, loading = false, title, message, userName }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-xl w-[90%] max-w-[400px]">
          <View className="p-5 border-b border-gray-200">
            <View className="flex-row items-center gap-3">
              <View className="bg-red-100 rounded-full p-3">
                <Ionicons name="trash" size={24} color="#ef4444" />
              </View>
              <Text className="flex-1 text-xl font-bold text-gray-800">{title || 'Подтверждение'}</Text>
            </View>
          </View>

          <View className="p-5">
            <Text className="text-base text-gray-700 mb-2">{message || 'Вы уверены?'}</Text>
            {userName && (
              <View className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2">
                <Text className="text-sm text-gray-600">Пользователь:</Text>
                <Text className="text-base font-semibold text-gray-800 mt-1">{userName}</Text>
              </View>
            )}
          </View>

          <View className="flex-row gap-3 p-5 border-t border-gray-200">
            <TouchableOpacity
              className="flex-1 bg-gray-200 rounded-lg py-3 justify-center items-center"
              onPress={onClose}
              disabled={loading}
            >
              <Text className="text-gray-700 text-base font-semibold">Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-red-500 rounded-lg py-3 justify-center items-center"
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-semibold">Удалить</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;
