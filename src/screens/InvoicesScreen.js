import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { invoicesApi } from '../api';
import InvoiceModal from '../components/InvoiceModal';
import ConfirmModal from '../components/ConfirmModal';
import InvoiceProductsScreen from './InvoiceProductsScreen';

const InvoicesScreen = ({ userData }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const response = await invoicesApi.getList({ limit: 1000 });
      if (response.success) {
        setInvoices(response.data?.rows || []);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingInvoice(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (invoice) => {
    setModalMode('edit');
    setEditingInvoice(invoice);
    setModalVisible(true);
  };

  const handleSaveInvoice = async (invoiceData) => {
    setModalLoading(true);
    try {
      let response;
      if (modalMode === 'create') {
        response = await invoicesApi.create(invoiceData);
      } else {
        response = await invoicesApi.update(invoiceData);
      }
      
      setModalLoading(false);
      
      if (response.success) {
        loadInvoices();
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      setModalLoading(false);
      return { success: false, error: 'Ошибка соединения с сервером' };
    }
  };

  const handleOpenDeleteModal = (invoice) => {
    setDeletingInvoice(invoice);
    setConfirmVisible(true);
  };

  const handleDeleteInvoice = async () => {
    if (!deletingInvoice) return;

    setDeleteLoading(true);
    try {
      const response = await invoicesApi.delete(deletingInvoice.id);
      setDeleteLoading(false);
      
      if (response.success) {
        setConfirmVisible(false);
        setDeletingInvoice(null);
        loadInvoices();
      } else {
        alert(response.error || 'Ошибка удаления накладной');
      }
    } catch (err) {
      setDeleteLoading(false);
      alert('Ошибка соединения с сервером');
    }
  };

  const handleOpenProducts = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleBackFromProducts = async () => {
    setSelectedInvoice(null);
    await loadInvoices();
  };

  if (selectedInvoice) {
    return (
      <InvoiceProductsScreen
        invoice={selectedInvoice}
        onBack={handleBackFromProducts}
      />
    );
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text className="mt-2 text-gray-600">Загрузка накладных...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <View className="p-4 bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-800">Накладные</Text>
            <Text className="text-sm text-gray-600 mt-1">Управление складом и товарами</Text>
          </View>
          <TouchableOpacity 
            onPress={handleOpenCreateModal}
            className="bg-primary px-4 py-2 rounded-lg flex-row items-center gap-2"
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text className="text-white font-semibold">Создать накладную</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {invoices.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text className="mt-4 text-gray-400 text-lg">Нет накладных</Text>
            <Text className="text-gray-400 text-sm mt-2">Создайте первую накладную для добавления товаров</Text>
          </View>
        ) : (
          <View className="bg-white rounded-lg shadow-sm">
            {invoices.map((invoice, idx) => (
              <TouchableOpacity
                key={invoice.id}
                onPress={() => handleOpenProducts(invoice)}
                className="p-4 border-b border-gray-200"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800">{invoice.name}</Text>
                    {invoice.description && (
                      <Text className="text-sm text-gray-600 mt-1">{invoice.description}</Text>
                    )}
                    <View className="flex-row items-center mt-2 gap-4">
                      <View className="flex-row items-center">
                        <Ionicons name="cube-outline" size={16} color="#666" />
                        <Text className="text-xs text-gray-500 ml-1">{invoice.products_count || 0} товаров</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="calendar-outline" size={16} color="#666" />
                        <Text className="text-xs text-gray-500 ml-1">{invoice.created_at}</Text>
                      </View>
                    </View>
                  </View>
                  <View className="flex-row gap-2 ml-2">
                    <View className={`px-2 py-1 rounded ${(invoice.products_count || 0) > 0 ? 'bg-orange-100' : 'bg-gray-100'}`}>
                      <Text className={`text-xs font-medium ${(invoice.products_count || 0) > 0 ? 'text-orange-700' : 'text-gray-600'}`}>
                        {(invoice.products_count || 0) > 0 ? 'Активная' : 'Архив'}
                      </Text>
                    </View>
                    {(invoice.products_count || 0) === 0 && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleOpenProducts(invoice);
                        }}
                        className="bg-blue-50 px-3 py-1 rounded flex-row items-center gap-1"
                      >
                        <Ionicons name="add" size={16} color="#3b82f6" />
                        <Text className="text-xs font-medium text-blue-600">Добавить товар</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(invoice);
                      }}
                      className="bg-orange-50 p-2 rounded"
                    >
                      <Ionicons name="pencil" size={18} color="#FF6B35" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleOpenDeleteModal(invoice);
                      }}
                      className="bg-red-50 p-2 rounded"
                    >
                      <Ionicons name="trash" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <InvoiceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveInvoice}
        loading={modalLoading}
        mode={modalMode}
        editData={editingInvoice}
      />

      <ConfirmModal
        visible={confirmVisible}
        onClose={() => setConfirmVisible(false)}
        onConfirm={handleDeleteInvoice}
        loading={deleteLoading}
        title="Удалить накладную?"
        message={`Вы действительно хотите удалить накладную "${deletingInvoice?.name}"? Все товары из этой накладной также будут удалены.`}
      />
    </View>
  );
};

export default InvoicesScreen;

