import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import API_URL from '../config'; 

export default function HomeScreen({ navigation }) {
  const [itemsList, setItemsList] = useState([]);
  const [isRefreshingData, setIsRefreshingData] = useState(false);
  const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  useEffect(() => {
    validateUserAuthentication();
    loadAllItems();
  }, []);

  useEffect(() => {
    const screenFocusListener = navigation.addListener('focus', () => {
      loadAllItems();
    });
    return screenFocusListener;
  }, [navigation]);

  const validateUserAuthentication = async () => {
    const storedToken = await AsyncStorage.getItem('token');
    const storedUserId = await AsyncStorage.getItem('userId');
    setUserIsAuthenticated(!!storedToken);
    setLoggedInUserId(storedUserId);
  };

  const loadAllItems = async () => {
    setIsRefreshingData(true);
    try {
      const apiResponse = await axios.get(`${API_URL}/products`);
      setItemsList(apiResponse.data);
    } catch (err) {
      console.log("Veri yükleme hatası:", err);
    }
    setIsRefreshingData(false);
  };

  const performLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userId');
    navigation.replace('Login');
  };

  const initiateItemEdit = async (selectedItem) => {
    const myUserId = await AsyncStorage.getItem('userId');
    const myToken = await AsyncStorage.getItem('token');

    if (!myToken || !myUserId) {
      Alert.alert("Oturum Gerekli", "Önce giriş yapmanız gerekiyor.");
      return;
    }

    if (!selectedItem.user_id) {
      Alert.alert("Veri Hatası", "Ürün sahiplik bilgisi eksik.");
      return;
    }

    if (myUserId.toString() !== selectedItem.user_id.toString()) {
      Alert.alert("Yetki Yok", "Bu ilan size ait değil, düzenleyemezsiniz!");
      return;
    }

    navigation.navigate('AddProduct', { product: selectedItem });
  };

  const initiateItemDeletion = async (itemIdentifier) => {
    Alert.alert(
      "Silme Onayı",
      "Bu ilanı kalıcı olarak silmek istediğinizden emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Evet, Sil",
          style: "destructive",
          onPress: async () => {
            const myToken = await AsyncStorage.getItem('token');
            if (!myToken) {
              Alert.alert("Oturum Hatası", "Önce giriş yapmanız gerekiyor.");
              return;
            }

            try {
              await axios.delete(`${API_URL}/products/${itemIdentifier}`, {
                headers: { Authorization: `Bearer ${myToken}` }
              });
              Alert.alert("Tamamlandı", "İlan başarıyla silindi!");
              loadAllItems();
            } catch (err) {
              console.log("Silme hatası:", err);
              if (err.response?.status === 403) {
                Alert.alert("Yetki Hatası", "Bu ilanı silme yetkiniz yok!");
              } else {
                Alert.alert("Hata", "Silme işlemi başarısız oldu.");
              }
            }
          }
        }
      ]
    );
  };

  const renderSingleItem = useCallback(({ item }) => {
    const itemBelongsToUser = userIsAuthenticated && 
      loggedInUserId && 
      item.user_id && 
      loggedInUserId.toString() === item.user_id.toString();

    return (
      <TouchableOpacity 
        style={styles.itemCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        activeOpacity={0.9}
      >
        <View style={styles.cardImageWrapper}>
          <Image 
            source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} 
            style={styles.itemImage} 
          />
          {item.price == 0 && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>ÜCRETSİZ</Text>
            </View>
          )}
        </View>
        
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
          
          {item.price > 0 && (
            <Text style={styles.itemPrice}>₺{item.price}</Text>
          )}
          
          {item.username && (
            <View style={styles.sellerContainer}>
              <View style={styles.sellerIcon}>
                <Text style={styles.sellerIconText}>👤</Text>
              </View>
              <Text style={styles.sellerLabel}>{item.username}</Text>
            </View>
          )}
          
          {itemBelongsToUser && (
            <View style={styles.ownerActions}>
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  initiateItemEdit(item);
                }} 
                style={styles.editButton}>
                <Text style={styles.editButtonText}>Düzenle</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  initiateItemDeletion(item.id);
                }}
                style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Kaldır</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [userIsAuthenticated, loggedInUserId]);

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.appTitle}>KampüsKitap</Text>
          <Text style={styles.appSubtitle}>İkinci el kitap pazarı</Text>
        </View>
        {userIsAuthenticated && (
          <TouchableOpacity onPress={performLogout} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={itemsList}
        keyExtractor={(item) => `item_${item.id}`}
        renderItem={renderSingleItem}
        refreshControl={
          <RefreshControl refreshing={isRefreshingData} onRefresh={loadAllItems} colors={['#667eea']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateIcon}>📚</Text>
            <Text style={styles.emptyStateText}>Henüz ilan bulunmuyor</Text>
            <Text style={styles.emptyStateSubtext}>İlk ilanı siz verin!</Text>
          </View>
        }
        contentContainerStyle={itemsList.length === 0 && styles.emptyList}
      />

      {userIsAuthenticated && (
        <TouchableOpacity 
          style={styles.floatingAddButton} 
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Text style={styles.floatingAddButtonText}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { 
    flex: 1, 
    backgroundColor: '#f8f9fd' 
  },
  topBar: { 
    padding: 20, 
    paddingTop: 12,
    backgroundColor: '#ffffff', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4f3',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2
  },
  appTitle: { 
    fontSize: 22, 
    fontWeight: '900',
    color: '#667eea',
    letterSpacing: -0.5
  },
  appSubtitle: {
    fontSize: 12,
    color: '#8c95ab',
    marginTop: 2,
    fontWeight: '500'
  },
  logoutButton: { 
    backgroundColor: '#f76b8a', 
    paddingHorizontal: 20,
    paddingVertical: 10, 
    borderRadius: 25,
    shadowColor: '#f76b8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  logoutButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3
  },
  itemCard: { 
    backgroundColor: '#ffffff', 
    marginHorizontal: 16, 
    marginVertical: 10,
    borderRadius: 12, 
    overflow: 'hidden', 
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f2f8'
  },
  cardImageWrapper: {
    position: 'relative'
  },
  itemImage: { 
    width: '100%', 
    height: 180,
    backgroundColor: '#e8ebf5'
  },
  freeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  freeBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  itemDetails: { 
    padding: 16 
  },
  itemTitle: { 
    fontSize: 17, 
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 22
  },
  itemPrice: { 
    fontSize: 22, 
    color: '#667eea', 
    fontWeight: '900',
    marginTop: 4
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#f8f9fd',
    padding: 8,
    borderRadius: 8
  },
  sellerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e1e4f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  sellerIconText: {
    fontSize: 12
  },
  sellerLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600'
  },
  ownerActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f2f8',
    paddingTop: 12
  },
  editButton: { 
    flex: 1,
    backgroundColor: '#fbbf24', 
    padding: 12, 
    borderRadius: 8,
    alignItems: 'center'
  },
  editButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#f76b8a',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  deleteButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3
  },
  floatingAddButton: { 
    position: 'absolute', 
    right: 20, 
    bottom: 20, 
    backgroundColor: '#667eea', 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8
  },
  floatingAddButtonText: { 
    color: '#ffffff', 
    fontSize: 32,
    fontWeight: '300',
    marginTop: -2
  },
  emptyStateContainer: {
    padding: 60,
    alignItems: 'center'
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyStateText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 8
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '400'
  },
  emptyList: {
    flexGrow: 1
  }
});