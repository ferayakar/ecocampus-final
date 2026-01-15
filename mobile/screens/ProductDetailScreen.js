import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../config'; 

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  
  const [itemData, setItemData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [userAuthenticated, setUserAuthenticated] = useState(false);
  const [activeUserId, setActiveUserId] = useState(null);

  useEffect(() => {
    verifyAuthentication();
    retrieveProductDetails();
  }, []);

  const verifyAuthentication = async () => {
    const storedToken = await AsyncStorage.getItem('token');
    const storedUserId = await AsyncStorage.getItem('userId');
    setUserAuthenticated(!!storedToken);
    setActiveUserId(storedUserId);
  };

  const retrieveProductDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${productId}`);
      setItemData(response.data);
    } catch (err) {
      console.log("Veri çekme hatası:", err);
      
      if (err.response) {
        Alert.alert("Hata", err.response.data.message || "Ürün bilgileri yüklenemedi.");
      } else if (err.request) {
        Alert.alert("Bağlantı Hatası", "Sunucuya erişim sağlanamıyor.");
      } else {
        Alert.alert("Hata", "Bir sorun oluştu: " + err.message);
      }
      
      navigation.goBack();
    }
    setIsLoadingData(false);
  };

  const initiateEditProcess = async () => {
    const myUserId = await AsyncStorage.getItem('userId');
    const myToken = await AsyncStorage.getItem('token');

    if (!myToken || !myUserId) {
      Alert.alert("Oturum Gerekli", "Önce giriş yapmalısınız.");
      return;
    }

    if (!itemData.user_id) {
      Alert.alert("Veri Hatası", "Bu ürünün sahip bilgisi mevcut değil.");
      return;
    }

    if (myUserId.toString() !== itemData.user_id.toString()) {
      Alert.alert("Yetki Yok", "Bu ilan size ait olmadığı için düzenleyemezsiniz!");
      return;
    }

    navigation.navigate('AddProduct', { product: itemData });
  };

  const initiateDeletionProcess = async () => {
    const myUserId = await AsyncStorage.getItem('userId');
    const myToken = await AsyncStorage.getItem('token');

    if (!myToken || !myUserId) {
      Alert.alert("Oturum Gerekli", "Önce giriş yapmalısınız.");
      return;
    }

    if (!itemData.user_id) {
      Alert.alert("Veri Hatası", "Bu ürünün sahip bilgisi mevcut değil.");
      return;
    }

    if (myUserId.toString() !== itemData.user_id.toString()) {
      Alert.alert("Yetki Yok", "Bu ilan size ait olmadığı için silemezsiniz!");
      return;
    }

    Alert.alert(
      "Silme Onayı",
      "Bu ilanı kalıcı olarak silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Evet, Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/products/${productId}`, {
                headers: { Authorization: `Bearer ${myToken}` }
              });
              Alert.alert("Başarılı", "İlan silindi!");
              navigation.goBack();
            } catch (err) {
              console.log("Silme hatası:", err);
              if (err.response?.status === 403) {
                Alert.alert("Yetki Hatası", "Bu ilanı silme yetkiniz yok!");
              } else {
                Alert.alert("Hata", "Silme işlemi başarısız.");
              }
            }
          }
        }
      ]
    );
  };

  if (isLoadingData) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingLabel}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!itemData) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorLabel}>Ürün bulunamadı</Text>
        <TouchableOpacity 
          style={styles.returnButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.returnButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const userIsOwner = activeUserId && 
    itemData.user_id && 
    activeUserId.toString() === itemData.user_id.toString();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: itemData.image_url || 'https://via.placeholder.com/400' }} 
          style={styles.heroImage} 
        />
        {itemData.price == 0 && (
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>ÜCRETSİZ</Text>
          </View>
        )}
      </View>
      
      <View style={styles.contentWrapper}>
        <Text style={styles.productTitle}>{itemData.title}</Text>
        
        {itemData.price > 0 && (
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Fiyat</Text>
            <Text style={styles.priceAmount}>₺{itemData.price}</Text>
          </View>
        )}

        {itemData.description && (
          <View style={styles.infoBlock}>
            <Text style={styles.blockHeader}>Açıklama</Text>
            <Text style={styles.blockContent}>{itemData.description}</Text>
          </View>
        )}

        {itemData.username && (
          <View style={styles.infoBlock}>
            <Text style={styles.blockHeader}>Satıcı Bilgisi</Text>
            <View style={styles.sellerCard}>
              <View style={styles.sellerIcon}>
                <Text style={styles.sellerIconText}>👤</Text>
              </View>
              <Text style={styles.sellerName}>{itemData.username}</Text>
            </View>
          </View>
        )}

        {itemData.category && (
          <View style={styles.infoBlock}>
            <Text style={styles.blockHeader}>Kategori</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryLabel}>{itemData.category}</Text>
            </View>
          </View>
        )}

        {itemData.created_at && (
          <View style={styles.infoBlock}>
            <Text style={styles.dateInfo}>
              Yayın Tarihi: {new Date(itemData.created_at).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
        )}

        {userAuthenticated && userIsOwner && (
          <View style={styles.ownerActionBar}>
            <TouchableOpacity style={styles.editActionButton} onPress={initiateEditProcess}>
              <Text style={styles.actionButtonLabel}>Düzenle</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.deleteActionButton} onPress={initiateDeletionProcess}>
              <Text style={styles.actionButtonLabel}>Kaldır</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fd'
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fd',
    padding: 24
  },
  loadingLabel: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600'
  },
  errorLabel: {
    fontSize: 20,
    color: '#f76b8a',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '700'
  },
  returnButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3
  },
  returnButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3
  },
  imageContainer: {
    position: 'relative'
  },
  heroImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#e8ebf5'
  },
  freeBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  freeBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  contentWrapper: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20
  },
  productTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
    lineHeight: 32,
    letterSpacing: -0.5
  },
  priceBox: {
    backgroundColor: '#f8f9fd',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#e1e4f3'
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
    letterSpacing: 0.3
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#667eea'
  },
  infoBlock: {
    marginBottom: 24
  },
  blockHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 12,
    letterSpacing: 0.3
  },
  blockContent: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 24
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fd',
    padding: 16,
    borderRadius: 12
  },
  sellerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e1e4f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  sellerIconText: {
    fontSize: 20
  },
  sellerName: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '700'
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e1e4f3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  categoryLabel: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '700',
    letterSpacing: 0.3
  },
  dateInfo: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic'
  },
  ownerActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f2f8',
    gap: 12
  },
  editActionButton: {
    flex: 1,
    backgroundColor: '#fbbf24',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  deleteActionButton: {
    flex: 1,
    backgroundColor: '#f76b8a',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#f76b8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  actionButtonLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3
  }
});