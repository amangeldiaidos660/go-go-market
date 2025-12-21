import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import pricesApi from '../api/prices';

const PriceModal = ({ visible, onClose, onSave, price, mode, deviceId }) => {
  const [formData, setFormData] = useState({
    name: '',
    name2: '',
    amount: '',
    category: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');

  useEffect(() => {
    if (visible) {
      loadCategories();
      
      if (mode === 'edit' && price) {
        setFormData({
          name: price.name || '',
          name2: price.name2 || '',
          amount: price.amount?.toString() || '',
          category: price.category || ''
        });
        setImageUrl(price.url || '');
        setImageFile(null);
      } else {
        setFormData({
          name: '',
          name2: '',
          amount: '',
          category: ''
        });
        setImageUrl('');
        setImageFile(null);
      }
      setError('');
      setServerError('');
      setServerSuccess('');
    }
  }, [visible, price, mode]);

  const loadCategories = async () => {
    const response = await pricesApi.getCategories();
    if (response.success) {
      setCategories(response.data);
    } else {
      Alert.alert('Ошибка', 'Не удалось загрузить категории');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        
        if (blob.size > 10 * 1024 * 1024) {
          Alert.alert('Ошибка', 'Размер файла не должен превышать 10 МБ');
          return;
        }

        setImageFile({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg'
        });
        setImageUrl(asset.uri);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Название (RU) обязательно');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Цена должна быть больше 0');
      return;
    }

    if (!formData.category) {
      setError('Категория обязательна');
      return;
    }

    setLoading(true);
    setError('');
    setServerError('');
    setServerSuccess('');

    try {
      let finalImageUrl = imageUrl;

      if (imageFile && (imageFile.uri.startsWith('file://') || imageFile.uri.startsWith('blob:'))) {
        setUploadingImage(true);
        const uploadResult = await pricesApi.uploadImage(imageFile);
        setUploadingImage(false);

        if (uploadResult.success) {
          finalImageUrl = uploadResult.url;
        } else {
          setServerError('Ошибка загрузки изображения: ' + uploadResult.error);
          setLoading(false);
          return;
        }
      }

      const payload = {
        device_id: deviceId,
        name: formData.name,
        name2: formData.name2 || formData.name,
        amount: parseFloat(formData.amount),
        category: formData.category,
        url: finalImageUrl || null
      };

      if (mode === 'edit') {
        payload.price_id = price.id;
      }

      const response = mode === 'edit'
        ? await pricesApi.update(payload)
        : await pricesApi.create(payload);

      if (response.OK || response.success) {
        setServerSuccess(mode === 'edit' ? 'Тариф успешно обновлен!' : 'Тариф успешно создан!');
        setTimeout(() => {
          onSave();
          onClose();
        }, 1500);
      } else {
        setServerError(response.error || 'Ошибка при сохранении');
      }
    } catch (err) {
      setServerError(err.message || 'Ошибка сети');
    } finally {
      setLoading(false);
      setUploadingImage(false);
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
              {mode === 'edit' ? 'Редактировать тариф' : 'Добавить тариф'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView className="max-h-96">
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
              <Text className="mb-1 font-medium">Цена товара (тг) *</Text>
              <TextInput
                className="border border-gray-300 rounded px-3 py-2"
                value={formData.amount}
                onChangeText={(value) => handleChange('amount', value)}
                placeholder="100"
                keyboardType="numeric"
              />
            </View>

            <View className="mb-4">
              <Text className="mb-1 font-medium">Категория *</Text>
              <View className="border border-gray-300 rounded">
                <Picker
                  selectedValue={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                  style={{ height: 50 }}
                >
                  <Picker.Item label="Выберите категорию" value="" />
                  {categories.map((cat) => (
                    <Picker.Item key={cat.id} label={cat.name} value={cat.name} />
                  ))}
                </Picker>
              </View>
            </View>

            <View className="mb-4">
              <Text className="mb-1 font-medium">Фото товара</Text>
              {imageUrl ? (
                <View>
                  <Image
                    source={{ uri: imageUrl }}
                    className="w-full h-40 rounded mb-2"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={pickImage}
                    className="border border-blue-500 rounded px-4 py-2"
                  >
                    <Text className="text-center text-blue-500">Изменить фото</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={pickImage}
                  className="border border-dashed border-gray-300 rounded px-4 py-8"
                >
                  <View className="items-center mb-2">
                    <Ionicons name="image-outline" size={48} color="#999" />
                  </View>
                  <Text className="text-center text-gray-500">Выбрать фото (до 10 МБ)</Text>
                </TouchableOpacity>
              )}
            </View>

            {uploadingImage && (
              <View className="mb-4 p-3 bg-blue-50 rounded">
                <Text className="text-blue-600">Загрузка изображения...</Text>
              </View>
            )}

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

export default PriceModal;
