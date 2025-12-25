import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { invoicesApi, categoriesApi } from '../api';

const InvoiceProductModal = ({ visible, onClose, onSave, product, mode }) => {
  const [formData, setFormData] = useState({
    name_ru: '',
    name_kz: '',
    category: '',
    quantity: '',
    purchase_price: '',
    selling_price: '',
    image_url: '',
  });
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        name_ru: product.name_ru || '',
        name_kz: product.name_kz || '',
        category: product.category || '',
        quantity: String(product.quantity || 0),
        purchase_price: String(product.purchase_price || ''),
        selling_price: String(product.selling_price || ''),
        image_url: product.image_url || '',
      });
    } else {
      resetForm();
    }
  }, [product, mode, visible]);

  const loadCategories = async () => {
    try {
      const result = await categoriesApi.getList();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name_ru: '',
      name_kz: '',
      category: '',
      quantity: '',
      purchase_price: '',
      selling_price: '',
      image_url: '',
    });
    setErrors({});
  };

  const handleChange = (field, value) => {
    if (field === 'quantity' || field === 'purchase_price' || field === 'selling_price') {
      const numericValue = value.replace(/[^0-9.]/g, '');
      const parts = numericValue.split('.');
      const cleanValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
      
      setFormData(prev => ({ ...prev, [field]: cleanValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = async () => {
    // В веб-версии используем input type="file"
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      try {
        const result = await invoicesApi.uploadImage(file);
        if (result.success) {
          handleChange('image_url', result.url);
        } else {
          alert(result.error || 'Ошибка загрузки изображения');
        }
      } catch (err) {
        alert('Ошибка загрузки изображения');
      }
      setUploading(false);
    };
    input.click();
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name_ru.trim()) {
      newErrors.name_ru = 'Укажите название на русском';
    }
    if (!formData.name_kz.trim()) {
      newErrors.name_kz = 'Укажите название на казахском';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Выберите категорию';
    }
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Укажите корректное количество';
    }

    if (mode === 'create') {
      if (!formData.purchase_price || parseFloat(formData.purchase_price) <= 0) {
        newErrors.purchase_price = 'Укажите цену закупа';
      }
      if (!formData.selling_price || parseFloat(formData.selling_price) <= 0) {
        newErrors.selling_price = 'Укажите цену продажи';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSave({
      name_ru: formData.name_ru.trim(),
      name_kz: formData.name_kz.trim(),
      category: formData.category.trim(),
      quantity: parseInt(formData.quantity),
      purchase_price: parseFloat(formData.purchase_price),
      selling_price: parseFloat(formData.selling_price),
      image_url: formData.image_url.trim(),
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh]">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-xl font-bold">
              {mode === 'edit' ? 'Редактировать товар' : 'Добавить товар'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-4">
            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium mb-2">
                  Название (RU) <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={formData.name_ru}
                  onChangeText={(value) => handleChange('name_ru', value)}
                  placeholder="Капучино"
                  className={`border ${errors.name_ru ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2`}
                />
                {errors.name_ru && (
                  <Text className="text-red-500 text-xs mt-1">{errors.name_ru}</Text>
                )}
              </View>

              <View>
                <Text className="text-sm font-medium mb-2">
                  Название (KZ) <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={formData.name_kz}
                  onChangeText={(value) => handleChange('name_kz', value)}
                  placeholder="Капучино"
                  className={`border ${errors.name_kz ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2`}
                />
                {errors.name_kz && (
                  <Text className="text-red-500 text-xs mt-1">{errors.name_kz}</Text>
                )}
              </View>

              <View>
                <Text className="text-sm font-medium mb-2">
                  Категория <Text className="text-red-500">*</Text>
                </Text>
                <View className={`border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg`}>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </View>
                {errors.category && (
                  <Text className="text-red-500 text-xs mt-1">{errors.category}</Text>
                )}
              </View>

              <View>
                <Text className="text-sm font-medium mb-2">
                  Количество (шт) <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={formData.quantity}
                  onChangeText={(value) => handleChange('quantity', value)}
                  placeholder="100"
                  inputMode="numeric"
                  className={`border ${errors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2`}
                />
                {errors.quantity && (
                  <Text className="text-red-500 text-xs mt-1">{errors.quantity}</Text>
                )}
                {mode === 'edit' && product && !errors.quantity && (
                  <Text className="text-gray-500 text-xs mt-1">
                    Текущее количество: {product.quantity || 0} шт
                  </Text>
                )}
              </View>

              <View>
                <Text className="text-sm font-medium mb-2">
                  Цена закупа (₸) <Text className="text-red-500">*</Text>
                  {mode === 'edit' && (
                    <Text className="text-gray-500 text-xs ml-2">(нельзя изменить)</Text>
                  )}
                </Text>
                <TextInput
                  value={formData.purchase_price}
                  onChangeText={(value) => handleChange('purchase_price', value)}
                  placeholder="300.00"
                  inputMode="decimal"
                  editable={mode === 'create'}
                  className={`border ${errors.purchase_price ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 ${mode === 'edit' ? 'bg-gray-100' : ''}`}
                />
                {errors.purchase_price && (
                  <Text className="text-red-500 text-xs mt-1">{errors.purchase_price}</Text>
                )}
              </View>

              <View>
                <Text className="text-sm font-medium mb-2">
                  Цена продажи (₸) <Text className="text-red-500">*</Text>
                  {mode === 'edit' && (
                    <Text className="text-gray-500 text-xs ml-2">(нельзя изменить)</Text>
                  )}
                </Text>
                <TextInput
                  value={formData.selling_price}
                  onChangeText={(value) => handleChange('selling_price', value)}
                  placeholder="500.00"
                  inputMode="decimal"
                  editable={mode === 'create'}
                  className={`border ${errors.selling_price ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 ${mode === 'edit' ? 'bg-gray-100' : ''}`}
                />
                {errors.selling_price && (
                  <Text className="text-red-500 text-xs mt-1">{errors.selling_price}</Text>
                )}
              </View>

              <View>
                <Text className="text-sm font-medium mb-2">Фото товара</Text>
                {formData.image_url ? (
                  <View className="relative">
                    <Image
                      source={{ uri: formData.image_url }}
                      className="w-full h-48 rounded-lg"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={() => handleChange('image_url', '')}
                      className="absolute top-2 right-2 bg-red-500 p-2 rounded-full"
                    >
                      <Ionicons name="trash" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={handleImageUpload}
                    disabled={uploading}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 items-center"
                  >
                    {uploading ? (
                      <ActivityIndicator size="large" color="#FF6B35" />
                    ) : (
                      <>
                        <Ionicons name="cloud-upload-outline" size={48} color="#9ca3af" />
                        <Text className="text-gray-500 mt-2">Нажмите для загрузки</Text>
                        <Text className="text-gray-400 text-xs mt-1">JPG, PNG (макс. 5 МБ)</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>

          <View className="flex-row gap-3 p-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-gray-100 rounded-lg py-3 items-center"
            >
              <Text className="text-gray-700 font-semibold">Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className="flex-1 bg-orange-500 rounded-lg py-3 items-center"
            >
              <Text className="text-white font-semibold">
                {mode === 'edit' ? 'Сохранить' : 'Добавить'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default InvoiceProductModal;

