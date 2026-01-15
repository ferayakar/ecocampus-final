import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../config'; 

export default function LoginScreen({ navigation }) {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const updateCredentialField = (fieldName, value) => {
    setCredentials(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const extractUserIdFromToken = (jwtToken) => {
    try {
      const tokenParts = jwtToken.split('.');
      const payloadBase64 = tokenParts[1];
      const payloadBase64Clean = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      
      const decodedPayload = decodeURIComponent(
        atob(payloadBase64Clean)
          .split('')
          .map(char => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payloadObject = JSON.parse(decodedPayload);
      return payloadObject.id || payloadObject.userId || payloadObject.user_id || null;
    } catch (error) {
      console.warn("Token decode hatası:", error);
      return null;
    }
  };

  const processLogin = async () => {
    if (!credentials.email || !credentials.password) {
      Alert.alert("Eksik Bilgi", "Lütfen email ve şifre alanlarını doldurun.");
      return;
    }

    setIsProcessing(true);
    
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: credentials.email.trim(),
        password: credentials.password
      });

      await AsyncStorage.setItem('token', loginResponse.data.token);

      let userId = loginResponse.data.userId || loginResponse.data.user_id;
      
      if (!userId) {
        userId = extractUserIdFromToken(loginResponse.data.token);
      }
      
      if (userId) {
        await AsyncStorage.setItem('userId', String(userId));
      }

      Alert.alert("Başarılı!", "Giriş yapıldı");
      navigation.replace('Home');

    } catch (error) {
      if (error.response) {
        Alert.alert("Giriş Başarısız", error.response.data.message || "Bilgilerinizi kontrol edin.");
      } else if (error.request) {
        Alert.alert("Bağlantı Sorunu", `Sunucuya ulaşılamıyor. API: ${API_URL}`);
      } else {
        Alert.alert("Hata", error.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <View style={styles.brandingSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>K</Text>
          </View>
          <Text style={styles.appName}>KampüsKitap</Text>
          <Text style={styles.tagline}>Kitaplarınızı Paylaşın</Text>
        </View>
        
        <View style={styles.formSection}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>E-posta</Text>
            <TextInput
              style={styles.inputField}
              placeholder="ornek@email.com"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              keyboardType="email-address"
              value={credentials.email}
              onChangeText={(val) => updateCredentialField('email', val)}
            />
          </View>
          
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Şifre</Text>
            <TextInput
              style={styles.inputField}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={credentials.password}
              onChangeText={(val) => updateCredentialField('password', val)}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.primaryButton, isProcessing && styles.buttonDisabled]} 
            onPress={processLogin}
            disabled={isProcessing}
          >
            <Text style={styles.primaryButtonText}>
              {isProcessing ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Register')} 
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Hesap Oluştur</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('Home')} 
            style={styles.guestButton}
          >
            <Text style={styles.guestButtonText}>Misafir Olarak Devam Et →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fd' 
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24
  },
  brandingSection: {
    marginBottom: 48,
    alignItems: 'center'
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff'
  },
  appName: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: -0.5
  },
  tagline: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500'
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f2f8'
  },
  inputWrapper: {
    marginBottom: 20
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    letterSpacing: 0.3
  },
  inputField: { 
    backgroundColor: '#f8f9fd', 
    padding: 16, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: '#e1e4f3',
    fontSize: 15,
    color: '#1e293b'
  },
  primaryButton: { 
    backgroundColor: '#667eea', 
    padding: 18, 
    borderRadius: 10, 
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0
  },
  primaryButtonText: { 
    color: '#ffffff', 
    fontWeight: '700', 
    fontSize: 16,
    letterSpacing: 0.5
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e4f3'
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600'
  },
  secondaryButton: {
    backgroundColor: '#f8f9fd',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#667eea'
  },
  secondaryButtonText: {
    color: '#667eea',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5
  },
  guestButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 12
  },
  guestButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3
  }
});