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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import pricesApi from '../api/prices';

const DeviceProductsModal = ({ visible, onClose, onSave, deviceId }) => {
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible && deviceId) {
      loadAvailableProducts();
      setProductQuantities({});
      setError('');
    }
  }, [visible, deviceId]);

  const loadAvailableProducts = async () => {
    setLoading(true);
    try {
      const response = await pricesApi.getAvailableProducts(deviceId);
      if (response.success) {
        setAvailableProducts(response.data || []);
        const initialQuantities = {};
        (response.data || []).forEach((product) => {
          const productId = product.invoice_product_id || product.id;
          initialQuantities[productId] = product.assigned_quantity || product.quantity || 0;
        });
        setProductQuantities(initialQuantities);
      } else {
        setError(response.error || 'Не удалось загрузить доступные товары');
      }
    } catch (err) {
      setError(err.message || 'Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    const quantity = numericValue === '' ? 0 : parseInt(numericValue);
    
    const product = availableProducts.find((p) => (p.invoice_product_id || p.id) === productId);
    // available_quantity теперь это остаток на складе после всех распределений
    // assigned_quantity - уже назначено на это устройство
    // Максимум можно назначить: available_quantity + assigned_quantity (если увеличиваем)
    // Или можно уменьшить до 0 (товар вернется на склад)
    const currentAssigned = product.assigned_quantity || 0;
    const maxAvailable = product.available_quantity + currentAssigned;
    
    if (product && quantity > maxAvailable) {
      Alert.alert(
        'Ошибка',
        `Недостаточно товара на складе! Доступно: ${maxAvailable} шт (остаток на складе: ${product.available_quantity} шт + уже назначено на это устройство: ${currentAssigned} шт)`
      );
      return;
    }

    setProductQuantities((prev) => ({
      ...prev,
      [productId]: quantity,
    }));
  };

  const validateQuantities = () => {
    for (const product of availableProducts) {
      const productId = product.invoice_product_id || product.id;
      const quantity = productQuantities[productId] || 0;
      const currentAssigned = product.assigned_quantity || 0;
      // available_quantity - остаток на складе после всех распределений
      // Максимум можно назначить: available_quantity + currentAssigned
      const maxAvailable = product.available_quantity + currentAssigned;
      
      if (quantity < 0) {
        Alert.alert('Ошибка', `Количество не может быть отрицательным для товара "${product.name_ru}"`);
        return false;
      }
      
      if (quantity > maxAvailable) {
        Alert.alert(
          'Ошибка',
          `Недостаточно товара на складе "${product.name_ru}"! Доступно: ${maxAvailable} шт (остаток на складе: ${product.available_quantity} шт)`
        );
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateQuantities()) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      const products = availableProducts
        .map((product) => {
          const productId = product.invoice_product_id || product.id;
          return {
            invoice_product_id: productId,
            quantity: productQuantities[productId] || 0,
          };
        })
        .filter((p) => p.quantity > 0);

      const response = await pricesApi.assignProducts(deviceId, products);

      if (response.success) {
        await loadAvailableProducts();
        Alert.alert('Успех', 'Товары успешно распределены на устройство', [
          {
            text: 'OK',
            onPress: () => {
              onSave();
            },
          },
        ]);
      } else {
        setError(response.error || 'Ошибка при распределении товаров');
      }
    } catch (err) {
      setError(err.message || 'Ошибка сети');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh]">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-xl font-bold">Распределить товары на устройство</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="p-8 items-center">
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text className="mt-4 text-gray-600">Загрузка доступных товаров...</Text>
            </View>
          ) : error && !availableProducts.length ? (
            <View className="p-8 items-center">
              <Ionicons name="alert-circle" size={48} color="#ef4444" />
              <Text className="mt-4 text-red-600 text-center">{error}</Text>
              <TouchableOpacity
                onPress={loadAvailableProducts}
                className="mt-4 bg-orange-500 rounded-lg px-6 py-3"
              >
                <Text className="text-white font-semibold">Повторить</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ScrollView className="p-4">
                {availableProducts.length === 0 ? (
                  <View className="p-8 items-center">
                    <Ionicons name="inventory-outline" size={48} color="#9ca3af" />
                    <Text className="mt-4 text-gray-600 text-center">
                      Нет доступных товаров из накладных
                    </Text>
                    <Text className="mt-2 text-gray-500 text-sm text-center">
                      Создайте накладную и добавьте в неё товары
                    </Text>
                  </View>
                ) : (
                  <View className="gap-3">
                    {availableProducts.map((product) => {
                      const productId = product.invoice_product_id || product.id;
                      const quantity = productQuantities[productId] || 0;
                      const currentAssigned = product.assigned_quantity || 0;
                      // available_quantity - остаток на складе после всех распределений
                      const maxAvailable = product.available_quantity + currentAssigned;
                      const isOverLimit = quantity > maxAvailable;

                      return (
                          <View
                          key={productId}
                          className={`border rounded-lg p-4 ${
                            isOverLimit ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <View className="flex-row gap-4">
                            {product.image_url && (
                              <Image
                                source={{ uri: product.image_url }}
                                className="w-20 h-20 rounded-lg"
                                resizeMode="cover"
                              />
                            )}
                            <View className="flex-1">
                              <Text className="text-lg font-semibold text-gray-900">
                                {product.name_ru}
                              </Text>
                              {product.name_kz && product.name_kz !== product.name_ru && (
                                <Text className="text-sm text-gray-600 mt-1">
                                  {product.name_kz}
                                </Text>
                              )}
                              {product.category && (
                                <Text className="text-xs text-gray-500 mt-1">
                                  {product.category}
                                </Text>
                              )}
                              <View className="flex-row gap-4 mt-2">
                                <View>
                                  <Text className="text-xs text-gray-500">Остаток на накладной</Text>
                                  <Text className="text-sm font-semibold text-orange-600">
                                    {product.available_quantity} шт
                                  </Text>
                                </View>
                                <View>
                                  <Text className="text-xs text-gray-500">Уже назначено</Text>
                                  <Text className="text-sm font-semibold text-gray-700">
                                    {product.assigned_quantity || 0} шт
                                  </Text>
                                </View>
                                <View>
                                  <Text className="text-xs text-gray-500">Остаток на устройстве</Text>
                                  <Text className="text-sm font-semibold text-blue-600">
                                    {product.remaining_quantity !== undefined ? product.remaining_quantity : (product.assigned_quantity || 0)} шт
                                  </Text>
                                </View>
                              </View>
                            </View>
                            <View className="w-40">
                              <Text className="text-xs text-gray-500 mb-2 font-medium">
                                Количество для устройства
                              </Text>
                              <View className="flex-row items-center gap-2">
                                <TouchableOpacity
                                  onPress={() => {
                                    const newQuantity = Math.max(0, quantity - 1);
                                    handleQuantityChange(productId, newQuantity.toString());
                                  }}
                                  disabled={quantity === 0}
                                  className={`w-10 h-10 rounded-lg items-center justify-center border-2 ${
                                    quantity === 0
                                      ? 'bg-gray-100 border-gray-200'
                                      : 'bg-orange-50 border-orange-300 active:bg-orange-100'
                                  }`}
                                  style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 2,
                                    elevation: 2,
                                  }}
                                >
                                  <Ionicons 
                                    name="remove" 
                                    size={20} 
                                    color={quantity === 0 ? "#9ca3af" : "#FF6B35"} 
                                  />
                                </TouchableOpacity>
                                <TextInput
                                  value={quantity.toString()}
                                  onChangeText={(value) => handleQuantityChange(productId, value)}
                                  placeholder="0"
                                  keyboardType="numeric"
                                  className={`w-20 border-2 rounded-lg px-3 py-2.5 text-center font-semibold text-base ${
                                    isOverLimit
                                      ? 'border-red-500 bg-red-50 text-red-700'
                                      : 'border-orange-300 bg-white text-gray-900'
                                  }`}
                                  style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 2,
                                    elevation: 1,
                                  }}
                                />
                                <TouchableOpacity
                                  onPress={() => {
                                    const newQuantity = Math.min(maxAvailable, quantity + 1);
                                    handleQuantityChange(productId, newQuantity.toString());
                                  }}
                                  disabled={quantity >= maxAvailable}
                                  className={`w-10 h-10 rounded-lg items-center justify-center border-2 ${
                                    quantity >= maxAvailable
                                      ? 'bg-gray-100 border-gray-200'
                                      : 'bg-orange-50 border-orange-300 active:bg-orange-100'
                                  }`}
                                  style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 2,
                                    elevation: 2,
                                  }}
                                >
                                  <Ionicons 
                                    name="add" 
                                    size={20} 
                                    color={quantity >= maxAvailable ? "#9ca3af" : "#FF6B35"} 
                                  />
                                </TouchableOpacity>
                              </View>
                              {isOverLimit && (
                                <Text className="text-xs text-red-600 mt-1.5 text-center font-medium">
                                  Макс: {maxAvailable}
                                </Text>
                              )}
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </ScrollView>

              {error && (
                <View className="mx-4 mt-2 p-3 bg-red-50 rounded-lg">
                  <Text className="text-red-600 text-sm">{error}</Text>
                </View>
              )}

              <View className="flex-row gap-3 p-4 border-t border-gray-200">
                <TouchableOpacity
                  onPress={onClose}
                  disabled={saving}
                  className="flex-1 bg-gray-100 rounded-lg py-3 items-center"
                >
                  <Text className="text-gray-700 font-semibold">Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={saving || availableProducts.length === 0}
                  className="flex-1 bg-orange-500 rounded-lg py-3 items-center"
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-semibold">Сохранить</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default DeviceProductsModal;

