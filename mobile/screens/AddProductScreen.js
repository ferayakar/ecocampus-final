import React, { useState, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, View } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../config'; 

export default function AddProductScreen({ navigation, route }) {
  const editingProduct = route.params?.product;
  const isEditMode = !!editingProduct;
  
  const [productData, setProductData] = useState({ 
    title: '', 
    price: '', 
    description: '', 
    image_url: '', 
    category_id: '1' 
  });

  useEffect(() => {
    if (isEditMode) {
      populateFormWithProductData();
      navigation.setOptions({ title: 'İlanı Düzenle' });
    }
  }, [editingProduct]);

  const populateFormWithProductData = () => {
    setProductData({
      title: editingProduct.title || '',
      price: editingProduct.price ? editingProduct.price.toString() : '',
      description: editingProduct.description || '',
      image_url: editingProduct.image_url || '',
      category_id: editingProduct.category_id ? editingProduct.category_id.toString() : '1'
    });
  };

  const updateField = (fieldName, fieldValue) => {
    setProductData(prev => ({
      ...prev,
      [fieldName]: fieldValue
    }));
  };

  const processFormSubmission = async () => {
    const authToken = await AsyncStorage.getItem('token');
    
    if (!authToken) {
        Alert.alert("Oturum Hatası", "Lütfen tekrar giriş yapın.");
        navigation.replace('Login');
        return;
    }

    try {
      const apiEndpoint = isEditMode 
        ? `${API_URL}/products/${editingProduct.id}`
        : `${API_URL}/products`;
      
      const httpMethod = isEditMode ? 'put' : 'post';
      
      await axios[httpMethod](apiEndpoint, productData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      const successMsg = isEditMode 
        ? "İlan başarıyla güncellendi!" 
        : "İlan başarıyla eklendi!";
      
      Alert.alert("İşlem Başarılı", successMsg);
      navigation.goBack();

    } catch (err) {
      console.log("İşlem Hatası:", err);

      if (err.response?.status === 404 || err.response?.status === 403) {
          Alert.alert("Yetki Hatası", "Bu işlemi yapmaya yetkiniz yok!");
      } else {
          Alert.alert("Hata", "İşlem tamamlanamadı. Lütfen tekrar deneyin.");
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.wrapper}>
      <View style={styles.headerContainer}>
        <Text style={styles.pageTitle}>
          {isEditMode ? "İlanı Düzenle" : "Yeni İlan"}
        </Text>
        <Text style={styles.pageSubtitle}>
          {isEditMode ? "Bilgileri güncelleyin" : "İlan bilgilerini girin"}
        </Text>
      </View>
      
      <View style={styles.formContainer}>
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>Başlık</Text>
          <TextInput 
            placeholder="Örn: Matematik 1 Kitabı" 
            placeholderTextColor="#94a3b8"
            value={productData.title} 
            style={styles.textField} 
            onChangeText={(val) => updateField('title', val)} 
          />
        </View>
        
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>Fiyat (TL)</Text>
          <TextInput 
            placeholder="0" 
            placeholderTextColor="#94a3b8"
            value={productData.price} 
            keyboardType="numeric" 
            style={styles.textField} 
            onChangeText={(val) => updateField('price', val)} 
          />
          <Text style={styles.fieldHint}>0 girerseniz ücretsiz olarak görünür</Text>
        </View>
        
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>Açıklama (opsiyonel)</Text>
          <TextInput 
            placeholder="Kitap hakkında detaylar..." 
            placeholderTextColor="#94a3b8"
            value={productData.description} 
            style={[styles.textField, styles.multilineField]} 
            multiline
            numberOfLines={4}
            onChangeText={(val) => updateField('description', val)} 
          />
        </View>
        
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>Görsel URL'si</Text>
          <TextInput 
            placeholder="https://..." 
            placeholderTextColor="#94a3b8"
            value={productData.image_url} 
            style={styles.textField} 
            onChangeText={(val) => updateField('image_url', val)} 
          />
        </View>
        
        <TouchableOpacity style={styles.submitButton} onPress={processFormSubmission}>
          <Text style={styles.submitButtonLabel}>
            {isEditMode ? "Değişiklikleri Kaydet" : "İlanı Yayınla"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { 
    padding: 20, 
    flexGrow: 1, 
    backgroundColor: '#f8f9fd', 
    paddingTop: 24 
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center'
  },
  pageTitle: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#1e293b',
    letterSpacing: -0.5,
    marginBottom: 8
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500'
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f2f8'
  },
  fieldWrapper: {
    marginBottom: 24
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    letterSpacing: 0.3
  },
  textField: { 
    borderWidth: 2, 
    borderColor: '#e1e4f3', 
    padding: 16, 
    borderRadius: 10, 
    backgroundColor: '#f8f9fd',
    fontSize: 15,
    color: '#1e293b'
  },
  fieldHint: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6,
    fontStyle: 'italic'
  },
  multilineField: {
    minHeight: 120,
    textAlignVertical: 'top'
  },
  submitButton: { 
    backgroundColor: '#667eea', 
    padding: 18, 
    borderRadius: 10, 
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  submitButtonLabel: { 
    color: 'white', 
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5
  }
});