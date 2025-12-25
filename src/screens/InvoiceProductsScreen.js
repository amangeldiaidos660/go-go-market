import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { invoicesApi } from '../api';
import InvoiceProductModal from '../components/InvoiceProductModal';
import ConfirmModal from '../components/ConfirmModal';

const InvoiceProductsScreen = ({ invoice, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    loadProducts();
  }, [invoice.id]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await invoicesApi.getProducts(invoice.id);
      if (result.success) {
        setProducts(result.data);
      }
    } catch (err) {
      console.error('Ошибка загрузки товаров:', err);
    }
    setLoading(false);
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleCloseModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (productData) => {
    try {
      let result;
      if (editingProduct) {
        result = await invoicesApi.updateProduct({
          id: editingProduct.id,
          invoice_id: editingProduct.invoice_id,
          name_ru: productData.name_ru,
          name_kz: productData.name_kz,
          category: productData.category,
          quantity: productData.quantity,
          purchase_price: parseFloat(editingProduct.purchase_price),
          selling_price: parseFloat(editingProduct.selling_price),
          image_url: productData.image_url,
        });
      } else {
        result = await invoicesApi.createProduct({
          invoice_id: invoice.id,
          name_ru: productData.name_ru,
          name_kz: productData.name_kz,
          category: productData.category,
          quantity: productData.quantity,
          purchase_price: productData.purchase_price,
          selling_price: productData.selling_price,
          image_url: productData.image_url,
        });
      }

      if (result.success) {
        await loadProducts();
        handleCloseModal();
      } else {
        alert(result.error || 'Ошибка сохранения товара');
      }
    } catch (err) {
      alert('Ошибка сохранения товара');
    }
  };

  const handleOpenDeleteConfirm = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const result = await invoicesApi.deleteProduct(productToDelete.id);
      if (result.success) {
        await loadProducts();
      } else {
        alert(result.error || 'Ошибка удаления товара');
      }
    } catch (err) {
      alert('Ошибка удаления товара');
    }
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  };

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-200 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={onBack}
            className="mr-3 p-2 hover:bg-gray-100 rounded"
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold">{invoice.name}</Text>
            {invoice.description && (
              <Text className="text-sm text-gray-600 mt-1">{invoice.description}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={handleOpenCreateModal}
          className="bg-orange-500 rounded-lg px-4 py-2 flex-row items-center"
        >
          <Ionicons name="add" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Добавить товар</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : products.length === 0 ? (
        <View className="flex-1 justify-center items-center p-8">
          <Ionicons name="cube-outline" size={64} color="#d1d5db" />
          <Text className="text-gray-500 text-lg mt-4 text-center">
            В накладной пока нет товаров
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center">
            Добавьте первый товар, чтобы активировать накладную
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          <View className="p-4">
            {products.map((product, index) => (
              <View
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg p-3 mb-2 flex-row items-center"
              >
                <View className="w-20 h-20 mr-6">
                  {product.image_url ? (
                    <Image
                      source={{ uri: product.image_url }}
                      className="w-20 h-20 rounded-lg"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-20 h-20 bg-gray-100 rounded-lg items-center justify-center">
                      <Ionicons name="image-outline" size={24} color="#9ca3af" />
                    </View>
                  )}
                </View>

                <View className="w-48 mr-6">
                  <Text className="text-base font-semibold text-gray-900">
                    {product.name_ru}
                  </Text>
                  {product.category && (
                    <Text className="text-xs text-gray-500 mt-1">{product.category}</Text>
                  )}
                </View>

                <View className="flex-row items-center gap-6 mr-6">
                  <View>
                    <Text className="text-xs text-gray-500">Закупка</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {product.purchase_price} ₸
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xs text-gray-500">Продажа</Text>
                    <Text className="text-sm font-semibold text-orange-600">
                      {product.selling_price} ₸
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xs text-gray-500">Кол-во</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {product.quantity} шт
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-2 ml-auto">
                  <TouchableOpacity
                    onPress={() => handleOpenEditModal(product)}
                    className="bg-orange-50 p-2 rounded"
                  >
                    <Ionicons name="pencil" size={18} color="#FF6B35" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleOpenDeleteConfirm(product)}
                    className="bg-red-50 p-2 rounded"
                  >
                    <Ionicons name="trash" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <InvoiceProductModal
        visible={showProductModal}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        product={editingProduct}
        mode={editingProduct ? 'edit' : 'create'}
      />

      <ConfirmModal
        visible={showDeleteConfirm}
        title="Удалить товар?"
        message={`Вы уверены, что хотите удалить товар "${productToDelete?.name_ru}"? Это действие нельзя отменить.`}
        onConfirm={handleDeleteProduct}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setProductToDelete(null);
        }}
      />
    </View>
  );
};

export default InvoiceProductsScreen;

