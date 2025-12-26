import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '../api';
import { useTheme } from '../context/ThemeContext';

const LoginForm = ({ onLoginSuccess }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    login: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.login.trim()) {
      newErrors.login = 'Введите логин';
    }

    if (!formData.password) {
      newErrors.password = 'Введите пароль';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await authApi.login(formData.login, formData.password);
      
      if (response.success && response.authenticated) {
        onLoginSuccess(response.user);
      } else {
        setErrors({ general: response.error || 'Ошибка входа' });
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Ошибка входа. Попробуйте снова.';
      
      if (error.status === 422) {
        errorMessage = 'Неверный логин или пароль';
      } else if (error.code === 'TIMEOUT') {
        errorMessage = 'Превышено время ожидания. Проверьте интернет-соединение.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = error.error;
      } else if (error.error) {
        errorMessage = typeof error.error === 'string' ? error.error : 'Ошибка сервера';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.innerContainer}>
          <View style={styles.headerContainer}>
            <Image 
              source={require('../../assets/images/orange.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.subtitle}>Войдите в свой аккаунт</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.card}>
              {errors.general && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{errors.general}</Text>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Логин</Text>
                <TextInput
                  style={[styles.input, errors.login && styles.inputError]}
                  placeholder="Введите ваш логин"
                  placeholderTextColor="#9e9e9e"
                  value={formData.login}
                  onChangeText={(value) => handleInputChange('login', value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                {errors.login && (
                  <Text style={styles.errorText}>{errors.login}</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Пароль</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, errors.password && styles.inputError, styles.passwordInput]}
                    placeholder="Введите пароль"
                    placeholderTextColor="#9e9e9e"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    disabled={loading}
                  >
                    <Ionicons 
                      name={showPassword ? 'eye-off' : 'eye'} 
                      size={22} 
                      color="#757575" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <View style={styles.forgotPasswordContainer}>
                <TouchableOpacity disabled={loading}>
                  <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>Забыли пароль?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary, shadowColor: theme.primary }, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={styles.buttonContent}>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={styles.buttonText}>Вход...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Войти</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  logoImage: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: -50,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorBanner: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fee',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorBannerText: {
    color: '#c33',
    fontSize: 14,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: '#ffffff',
    fontSize: 16,
    color: '#212121',
  },
  inputError: {
    borderColor: '#f44336',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 4,
  },
  forgotPasswordContainer: {
    marginBottom: 24,
    alignItems: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 24,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#757575',
    fontSize: 14,
  },
  registerLink: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '500',
  },
  footerContainer: {
    marginTop: 32,
  },
  footerText: {
    color: '#9e9e9e',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default LoginForm;
