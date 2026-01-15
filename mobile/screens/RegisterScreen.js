import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import API_URL from '../config';

export default function RegisterScreen({ navigation }) {
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const updateUserField = (fieldName, value) => {
    setNewUserData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const processRegistration = async () => {
    if (!newUserData.username || !newUserData.email || !newUserData.password) {
      Alert.alert("Eksik Bilgi", "Lütfen tüm alanları doldurun!");
      return;
    }

    try {
      await axios.post(`${API_URL}/auth/register`, {
        username: newUserData.username,
        email: newUserData.email,
        password: newUserData.password
      });

      Alert.alert("Kayıt Tamamlandı", "Hesabınız oluşturuldu! Şimdi giriş yapabilirsiniz.");
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert("Kayıt Hatası", "Kayıt başarısız. Farklı bir email deneyin veya bilgileri kontrol edin.");
      console.log(err);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>K</Text>
          </View>
          <Text style={styles.pageTitle}>Hesap Oluştur</Text>
          <Text style={styles.pageSubtitle}>Topluluğa katılın</Text>
        </View>
        
        <View style={styles.formWrapper}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Kullanıcı Adı</Text>
            <TextInput
              style={styles.inputBox}
              placeholder="kullaniciadi"
              placeholderTextColor="#94a3b8"
              value={newUserData.username}
              onChangeText={(val) => updateUserField('username', val)}
            />
          </View>
          
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>E-posta</Text>
            <TextInput
              style={styles.inputBox}
              placeholder="ornek@email.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={newUserData.email}
              onChangeText={(val) => updateUserField('email', val.trim())}
            />
          </View>
          
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Şifre</Text>
            <TextInput
              style={styles.inputBox}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={newUserData.password}
              onChangeText={(val) => updateUserField('password', val)}
            />
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={processRegistration}>
            <Text style={styles.registerButtonText}>Hesap Oluştur</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Zaten hesabım var</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fd' 
  },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 24 
  },
  headerSection: {
    marginBottom: 40,
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
  pageTitle: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: -0.5
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500'
  },
  formWrapper: {
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
  inputBox: { 
    backgroundColor: '#f8f9fd', 
    padding: 16, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: '#e1e4f3',
    fontSize: 15,
    color: '#1e293b'
  },
  registerButton: { 
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
  registerButtonText: { 
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
  backButton: {
    backgroundColor: '#f8f9fd',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#667eea'
  },
  backButtonText: { 
    color: '#667eea', 
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5
  }
});