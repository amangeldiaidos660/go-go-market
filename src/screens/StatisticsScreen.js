import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { invoicesApi } from '../api';

const StatisticsScreen = ({ userData }) => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);
  const [availableInvoices, setAvailableInvoices] = useState([]);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  useEffect(() => {
    loadInvoices();
    loadStatistics();
  }, []);

  const loadInvoices = async () => {
    try {
      const response = await invoicesApi.getList({ limit: 1000 });
      if (response.success) {
        const activeInvoices = (response.data?.rows || []).filter(
          inv => (inv.products_count || 0) > 0
        );
        setAvailableInvoices(activeInvoices);
      }
    } catch (error) {
    }
  };

  const loadStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (selectedInvoiceIds.length > 0) params.invoice_ids = selectedInvoiceIds;

      const response = await invoicesApi.getStatistics(params);
      if (response.success) {
        setStatistics(response.data);
      } else {
        setError(response.error || 'Ошибка загрузки статистики');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceToggle = (invoiceId) => {
    setSelectedInvoiceIds(prev => {
      if (prev.includes(invoiceId)) {
        return prev.filter(id => id !== invoiceId);
      } else {
        return [...prev, invoiceId];
      }
    });
  };

  useEffect(() => {
    loadStatistics();
  }, [dateFrom, dateTo, selectedInvoiceIds]);

  const renderBarChart = () => {
    if (!statistics || !statistics.invoices || statistics.invoices.length === 0) {
      return (
        <View className="h-64 justify-center items-center">
          <Text className="text-gray-400">Нет данных для отображения</Text>
        </View>
      );
    }

    const allProducts = [];
    statistics.invoices.forEach(invoice => {
      invoice.products.forEach(product => {
        allProducts.push({
          ...product,
          invoiceName: invoice.invoice_name,
        });
      });
    });

    const maxProfit = Math.max(...allProducts.map(p => p.profit || 0), 1);
    const chartHeight = 200;
    const barWidth = isMobile ? 30 : 40;
    const barSpacing = 8;
    const displayProducts = allProducts.slice(0, 15).sort((a, b) => (b.profit || 0) - (a.profit || 0));

    return (
      <View className="bg-white rounded-lg p-4 shadow-sm">
        <Text className="text-lg font-bold text-gray-800 mb-4">Чистая прибыль по товарам</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ minWidth: displayProducts.length * (barWidth + barSpacing) + 40 }}>
            <View style={{ height: chartHeight + 80, position: 'relative' }}>
              {displayProducts.map((product, index) => {
                const barHeight = maxProfit > 0 ? (product.profit / maxProfit) * chartHeight : 0;
                const left = index * (barWidth + barSpacing) + 20;
                const bottom = 60;
                const productName = product.name_ru.length > 12 
                  ? product.name_ru.substring(0, 12) + '...' 
                  : product.name_ru;

                return (
                  <View
                    key={product.product_id}
                    style={{
                      position: 'absolute',
                      left: left,
                      bottom: bottom,
                      width: barWidth,
                      alignItems: 'center',
                    }}
                  >
                    {barHeight > 0 && (
                      <>
                        <View
                          style={{
                            width: barWidth,
                            height: barHeight,
                            backgroundColor: '#FF6B35',
                            borderTopLeftRadius: 4,
                            borderTopRightRadius: 4,
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            paddingBottom: 4,
                          }}
                        >
                          {barHeight > 25 && (
                            <Text className="text-xs font-bold text-white" style={{ fontSize: 9 }}>
                              {product.profit.toFixed(0)}
                            </Text>
                          )}
                        </View>
                        <View style={{ marginTop: 4, width: barWidth * 1.5 }}>
                          <Text
                            className="text-xs text-gray-600"
                            style={{
                              fontSize: 9,
                              textAlign: 'center',
                              transform: [{ rotate: '-45deg' }],
                            }}
                            numberOfLines={1}
                          >
                            {productName}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderPieChart = () => {
    if (!statistics || !statistics.top_products || statistics.top_products.length === 0) {
      return (
        <View className="h-64 justify-center items-center">
          <Text className="text-gray-400">Нет данных для отображения</Text>
        </View>
      );
    }

    const topProducts = statistics.top_products.slice(0, 10);
    const totalProfit = topProducts.reduce((sum, p) => sum + (p.profit || 0), 0);
    
    if (totalProfit === 0) {
      return (
        <View className="h-64 justify-center items-center">
          <Text className="text-gray-400">Нет данных для отображения</Text>
        </View>
      );
    }

    const colors = [
      '#FF6B35', '#FF8C42', '#FFA07A', '#FFB347', '#FFD700',
      '#FF6347', '#FF7F50', '#FFA500', '#FF8C00', '#FF4500'
    ];

    return (
      <View className="bg-white rounded-lg p-4 shadow-sm">
        <Text className="text-lg font-bold text-gray-800 mb-4">Топ товары по прибыли</Text>
        <View className="flex-row flex-wrap">
          <View className="items-center justify-center mb-4" style={{ width: isMobile ? '100%' : 300 }}>
            <View
              style={{
                width: isMobile ? 200 : 250,
                height: isMobile ? 200 : 250,
                borderRadius: isMobile ? 100 : 125,
                borderWidth: 20,
                borderColor: '#FF6B35',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#FFF3EF',
              }}
            >
              <Text className="text-xs text-gray-500">Общая прибыль</Text>
              <Text className="text-xl font-bold text-primary mt-1">
                {totalProfit.toFixed(0)} ₸
              </Text>
            </View>
          </View>
          <View className="flex-1" style={{ minWidth: isMobile ? '100%' : 250 }}>
            {topProducts.map((product, index) => {
              const profit = product.profit || 0;
              const percentage = totalProfit > 0 ? ((profit / totalProfit) * 100).toFixed(1) : 0;
              const barWidth = `${percentage}%`;
              return (
                <View key={product.product_id} className="mb-4">
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center flex-1">
                      <View 
                        className="w-4 h-4 rounded mr-2"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <Text className="text-sm font-medium text-gray-800 flex-1" numberOfLines={1}>
                        {product.name_ru}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-600 ml-2">
                      {profit.toFixed(2)} ₸
                    </Text>
                  </View>
                  <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <View
                      style={{
                        width: barWidth,
                        height: '100%',
                        backgroundColor: colors[index % colors.length],
                      }}
                    />
                  </View>
                  <Text className="text-xs text-gray-500 mt-1">{percentage}%</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text className="mt-2 text-gray-600">Загрузка статистики...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text className="mt-4 text-red-600 text-lg font-semibold">Ошибка</Text>
        <Text className="mt-2 text-gray-600 text-center">{error}</Text>
        <TouchableOpacity
          onPress={loadStatistics}
          className="mt-4 bg-primary px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <View className="p-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">Статистика</Text>
        <Text className="text-sm text-gray-600 mt-1">Анализ продаж и прибыли</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-4">Фильтры</Text>
          
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Период</Text>
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Text className="text-xs text-gray-500 mb-1">От</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 8,
                      borderWidth: 1,
                      borderColor: '#d1d5db',
                      borderRadius: 8,
                      backgroundColor: '#fff',
                    }}
                  />
                ) : (
                  <TextInput
                    value={dateFrom}
                    onChangeText={setDateFrom}
                    placeholder="YYYY-MM-DD"
                    style={{
                      width: '100%',
                      padding: 8,
                      borderWidth: 1,
                      borderColor: '#d1d5db',
                      borderRadius: 8,
                      backgroundColor: '#fff',
                    }}
                  />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 mb-1">До</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 8,
                      borderWidth: 1,
                      borderColor: '#d1d5db',
                      borderRadius: 8,
                      backgroundColor: '#fff',
                    }}
                  />
                ) : (
                  <TextInput
                    value={dateTo}
                    onChangeText={setDateTo}
                    placeholder="YYYY-MM-DD"
                    style={{
                      width: '100%',
                      padding: 8,
                      borderWidth: 1,
                      borderColor: '#d1d5db',
                      borderRadius: 8,
                      backgroundColor: '#fff',
                    }}
                  />
                )}
              </View>
            </View>
          </View>

          {availableInvoices.length > 0 && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Накладные</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {availableInvoices.map(invoice => (
                  <TouchableOpacity
                    key={invoice.id}
                    onPress={() => handleInvoiceToggle(invoice.id)}
                    className={`px-3 py-2 rounded-lg mr-2 ${
                      selectedInvoiceIds.includes(invoice.id)
                        ? 'bg-primary'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selectedInvoiceIds.includes(invoice.id)
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}
                    >
                      {invoice.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {statistics && statistics.summary && (
          <View className="bg-white rounded-lg p-4 shadow-sm mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">Общая статистика</Text>
            <View className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <View className="bg-orange-50 p-4 rounded-lg">
                <Text className="text-xs text-gray-600 mb-1">Накладных</Text>
                <Text className="text-2xl font-bold text-primary">
                  {statistics.summary.total_invoices || 0}
                </Text>
              </View>
              <View className="bg-blue-50 p-4 rounded-lg">
                <Text className="text-xs text-gray-600 mb-1">Товаров</Text>
                <Text className="text-2xl font-bold text-blue-600">
                  {statistics.summary.total_products || 0}
                </Text>
              </View>
              <View className="bg-green-50 p-4 rounded-lg">
                <Text className="text-xs text-gray-600 mb-1">Продано</Text>
                <Text className="text-2xl font-bold text-green-600">
                  {statistics.summary.total_sold || 0}
                </Text>
              </View>
              <View className="bg-purple-50 p-4 rounded-lg">
                <Text className="text-xs text-gray-600 mb-1">Прибыль</Text>
                <Text className="text-2xl font-bold text-purple-600">
                  {statistics.summary.total_profit?.toFixed(2) || '0.00'} ₸
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="mb-4">
          {renderBarChart()}
        </View>

        <View className="mb-4">
          {renderPieChart()}
        </View>
      </ScrollView>
    </View>
  );
};

export default StatisticsScreen;

