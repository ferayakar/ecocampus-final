import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API_URL from "../config"; 

export default function Dashboard() {
  const [itemsList, setItemsList] = useState([]);
  const [activeUserId, setActiveUserId] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const navigateTo = useNavigate();

  useEffect(() => {
    verifyUserSession();
    loadProductList();
  }, []);

  const verifyUserSession = () => {
    const sessionToken = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    
    setUserLoggedIn(!!sessionToken);
    setActiveUserId(userId);
  };

  const loadProductList = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setItemsList(response.data);
    } catch (err) {
      toast.error("Ürün listesi yüklenemedi");
    }
  };

  const removeProduct = async (productId, productOwnerId) => {
    if (!userLoggedIn) {
      toast.error("İlan silmek için giriş yapmanız gerekiyor!");
      return;
    }

    if (activeUserId !== String(productOwnerId)) {
      toast.error("Bu ilan size ait değil, silemezsiniz!");
      return;
    }

    if (!window.confirm("Bu ilanı kalıcı olarak silmek istediğinizden emin misiniz?")) {
      return;
    }

    const sessionToken = localStorage.getItem("token");

    try {
      await axios.delete(`${API_URL}/products/${productId}`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      toast.success("İlan başarıyla silindi!");
      loadProductList();
    } catch (err) {
      toast.error("Silme işlemi başarısız oldu.");
    }
  };

  const modifyProduct = (productData) => {
    if (!userLoggedIn) {
      toast.error("İlan düzenlemek için giriş yapmanız gerekiyor!");
      return;
    }

    if (activeUserId !== String(productData.user_id)) {
      toast.error("Bu ilan size ait değil, düzenleyemezsiniz!");
      return;
    }
    
    navigateTo(`/edit/${productData.id}`, { state: { product: productData } });
  };

  const navigateToAddProduct = () => {
    if (!userLoggedIn) {
      toast.error("İlan eklemek için giriş yapmanız gerekiyor!");
      navigateTo("/");
      return;
    }
    navigateTo("/add");
  };

  const performLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    toast.info("Oturumunuz kapatıldı");
    navigateTo("/");
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>KampüsKitap</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>
            İkinci el kitap pazarı
          </p>
        </div>
        <div className="header-actions">
          {userLoggedIn ? (
            <>
              <button onClick={navigateToAddProduct} className="add-btn">
                + Yeni İlan Oluştur
              </button>
              <button onClick={performLogout} className="logout-btn">
                Çıkış Yap
              </button>
            </>
          ) : (
            <button onClick={() => navigateTo("/")} className="login-btn">
              Giriş Yapın
            </button>
          )}
        </div>
      </header>

      {!userLoggedIn && (
        <div className="guest-banner">
          ℹ️ Misafir modundasınız - İlan eklemek, düzenlemek veya silmek için giriş yapın
        </div>
      )}

      <div className="products-grid">
        {itemsList.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📚</div>
            <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              Henüz ilan bulunmuyor
            </p>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>
              İlk ilanı siz verin!
            </p>
          </div>
        ) : (
          itemsList.map((item) => {
            const userIsOwner = userLoggedIn && 
              activeUserId && 
              String(activeUserId) === String(item.user_id);
            
            return (
              <div 
                key={`product_${item.id}`} 
                className="product-card"
                onClick={() => navigateTo(`/product/${item.id}`)}
              >
                <div className="product-image" style={{ position: 'relative' }}>
                  <img 
                    src={item.image_url || "https://via.placeholder.com/300"} 
                    alt={item.title} 
                  />
                  {item.price == 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: '#10b981',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '800',
                      letterSpacing: '0.5px'
                    }}>
                      ÜCRETSİZ
                    </div>
                  )}
                </div>
                
                <div className="product-content">
                  <h3 className="product-title">{item.title}</h3>
                  {item.price > 0 && (
                    <p className="product-price">₺{item.price}</p>
                  )}
                  
                  {item.username && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginTop: '12px',
                      padding: '8px 12px',
                      background: '#f8f9fd',
                      borderRadius: '8px'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '12px',
                        background: '#e1e4f3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '8px',
                        fontSize: '12px'
                      }}>
                        👤
                      </div>
                      <span className="product-seller" style={{ 
                        background: 'transparent',
                        padding: '0',
                        margin: '0'
                      }}>
                        {item.username}
                      </span>
                    </div>
                  )}
                  
                  {item.category && (
                    <span className="product-category">{item.category}</span>
                  )}
                  
                  {userIsOwner && (
                    <div className="product-actions" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => modifyProduct(item)}
                        className="btn-edit"
                      >
                        Düzenle
                      </button>
                      <button 
                        onClick={() => removeProduct(item.id, item.user_id)}
                        className="btn-delete"
                      >
                        Kaldır
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}