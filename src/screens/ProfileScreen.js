import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ userData }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleName = (idrole) => {
    if (idrole === 1) return 'Супер Администратор';
    if (idrole === 2) return 'Контрагент';
    return 'Пользователь';
  };

  const getRoleColor = (idrole) => {
    if (idrole === 1) return 'bg-purple-500';
    if (idrole === 2) return 'bg-primary';
    return 'bg-gray-500';
  };

  if (!userData) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-base text-gray-600">Данные пользователя не загружены</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row p-4 bg-white gap-2.5 border-b border-gray-200">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-800">Мой профиль</Text>
          <Text className="text-sm text-gray-600 mt-1">Информация о вашей учетной записи</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-xl shadow-sm overflow-hidden">
          <View className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary/10 to-primary/5">
            <View className="flex-row items-center gap-4">
              <View className="bg-primary rounded-full w-20 h-20 justify-center items-center">
                <Text className="text-white text-3xl font-bold">
                  {userData.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-800">{userData.name}</Text>
                <View className={`${getRoleColor(userData.idrole)} px-3 py-1 rounded-full self-start mt-2`}>
                  <Text className="text-white text-sm font-semibold">{getRoleName(userData.idrole)}</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="p-6">
            <View className="mb-5">
              <View className="flex-row items-center mb-2">
                <Ionicons name="mail-outline" size={20} color="#666" />
                <Text className="ml-2 text-sm font-semibold text-gray-500 uppercase">Email</Text>
              </View>
              <Text className="text-base text-gray-800 ml-7">{userData.email || 'Не указан'}</Text>
            </View>

            <View className="mb-5 pb-5 border-b border-gray-200">
              <View className="flex-row items-center mb-2">
                <Ionicons name="person-outline" size={20} color="#666" />
                <Text className="ml-2 text-sm font-semibold text-gray-500 uppercase">Логин</Text>
              </View>
              <Text className="text-base text-gray-800 ml-7">@{userData.login || 'Не указан'}</Text>
            </View>

            <View className="mb-5">
              <View className="flex-row items-center mb-2">
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text className="ml-2 text-sm font-semibold text-gray-500 uppercase">Дата создания</Text>
              </View>
              <Text className="text-base text-gray-800 ml-7">{formatDate(userData.created_at)}</Text>
            </View>

            {userData.updated_at && (
              <View className="mb-5">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text className="ml-2 text-sm font-semibold text-gray-500 uppercase">Последнее обновление</Text>
                </View>
                <Text className="text-base text-gray-800 ml-7">{formatDate(userData.updated_at)}</Text>
              </View>
            )}
          </View>
        </View>

        {userData.idrole === 1 && (
          <View className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
            <View className="flex-row items-start gap-3">
              <Ionicons name="warning" size={24} color="#9333ea" />
              <View className="flex-1">
                <Text className="text-purple-900 font-semibold mb-1">Привилегированный доступ</Text>
                <Text className="text-purple-700 text-sm">
                  У вас есть полные права супер-администратора. Будьте осторожны при управлении пользователями и системными настройками.
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <View className="flex-row items-start gap-3">
            <Ionicons name="information-circle" size={24} color="#3b82f6" />
            <View className="flex-1">
              <Text className="text-blue-900 font-semibold mb-1">Информация</Text>
              <Text className="text-blue-700 text-sm">
                Для изменения данных профиля обратитесь к администратору системы.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
