import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchBar = ({ 
  placeholder = "Поиск...", 
  value, 
  onChangeText, 
  onSearch,
  onAdd,
  addButtonText = "Добавить",
  showAddButton = false,
  filters = null
}) => {
  const handleTextChange = (text) => {
    onChangeText(text);
  };

  const handleSearch = () => {
    onSearch();
  };

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View className="bg-white border-b border-gray-200">
      <View className="p-3">
        {/* Строка поиска */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 gap-2 mb-2">
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            className="flex-1 h-11 text-base text-gray-800"
            placeholder={placeholder}
            value={value}
            onChangeText={handleTextChange}
            onSubmitEditing={handleSearch}
          />
          {value.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Кнопки */}
        <View className="flex-row gap-2">
          <TouchableOpacity 
            className="flex-1 bg-blue-500 py-2.5 rounded-lg items-center justify-center"
            onPress={handleSearch}
          >
            <Text className="text-white text-sm font-semibold">Найти</Text>
          </TouchableOpacity>
          {showAddButton && (
            <TouchableOpacity 
              className="flex-1 bg-green-500 py-2.5 rounded-lg items-center justify-center"
              onPress={onAdd}
            >
              <Text className="text-white text-sm font-semibold">{addButtonText}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Фильтры (если переданы) */}
        {filters && (
          <View className="flex-row flex-wrap gap-2 mt-2">
            {filters}
          </View>
        )}
      </View>
    </View>
  );
};

export default SearchBar;
