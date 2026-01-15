import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import API_URL from "../config"; 

export default function ProductDetail() {
  const { id: productIdentifier } = useParams();
  const navigateTo = useNavigate();
  
  const [itemDetails, setItemDetails] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [activeUserId, setActiveUserId] = useState(null);
  const [userAuthenticated, setUserAuthenticated] = useState(false);

  useEffect(() => {
    const sessionToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    
    setUserAuthenticated(!!sessionToken);
    setActiveUserId(storedUserId);
    
    retrieveProductData();
  }, [productIdentifier]);

  const retrieveProductData = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${productIdentifier}`);
      setItemDetails(response.data);
    } catch (err) {
      toast.error("Ürün bilgisi bulunamadı");
      navigateTo("/dashboard");
    }
    setIsLoadingData(false);
  };

  const initiateRemoval = async () => {
    if (!userAuthenticated) {
      toast.error("❌ İlan silmek için giriş yapmanız gerekiyor!");
      return;
    }

    if (!window.confirm("Bu ilanı kalıcı olarak silmek istediğinize emin misiniz?")) {
      return;
    }

    const sessionToken = localStorage.getItem("token");

    try {
      await axios.delete(`${API_URL}/products/${productIdentifier}`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      toast.success("İlan silindi!");
      navigateTo("/dashboard");
    } catch (err) {
      toast.error("Silme işlemi başarısız.");
    }
  };

  const initiateEdit = () => {
    if (!userAuthenticated) {
      toast.error("❌ İlan düzenlemek için giriş yapmanız gerekiyor!");
      return;
    }

    navigateTo(`/edit/${productIdentifier}`, { state: { product: itemDetails } });
  };

  if (isLoadingData) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!itemDetails) {
    return (
      <div className="error-container">
        <p>Ürün bulunamadı</p>
        <button onClick={() => navigateTo("/dashboard")}>Geri Dön</button>
      </div>
    );
  }

  const userIsOwner = userAuthenticated && 
    activeUserId && 
    String(activeUserId) === String(itemDetails.user_id);

  return (
    <div className="detail-container">
      <button onClick={() => navigateTo("/dashboard")} className="back-btn">
        ← Geri
      </button>

      <div className="detail-content">
        <div className="detail-image">
          <img 
            src={itemDetails.image_url || "https://via.placeholder.com/600"} 
            alt={itemDetails.title} 
          />
        </div>

        <div className="detail-info">
          <h1 className="detail-title">{itemDetails.title}</h1>
          
          <div className="detail-price">
            {itemDetails.price == 0 ? "BAĞIŞ" : `₺${itemDetails.price}`}
          </div>

          {itemDetails.description && (
            <div className="detail-section">
              <h3>Açıklama</h3>
              <p>{itemDetails.description}</p>
            </div>
          )}

          {itemDetails.username && (
            <div className="detail-section">
              <h3>Satıcı</h3>
              <p className="seller-name">@{itemDetails.username}</p>
            </div>
          )}

          {itemDetails.category && (
            <div className="detail-section">
              <h3>Kategori</h3>
              <p className="category-badge">{itemDetails.category}</p>
            </div>
          )}

          {itemDetails.created_at && (
            <div className="detail-section">
              <p className="detail-date">
                İlan Tarihi: {new Date(itemDetails.created_at).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}

          {userIsOwner && (
            <div className="detail-actions">
              <button onClick={initiateEdit} className="btn-edit-large">
                ✏️ Düzenle
              </button>
              <button onClick={initiateRemoval} className="btn-delete-large">
                🗑️ Sil
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}