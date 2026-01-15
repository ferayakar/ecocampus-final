import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import API_URL from "../config"; 

export default function EditProduct() {
  const navigateTo = useNavigate();
  const { id: productId } = useParams();
  const location = useLocation();
  
  const [editFormData, setEditFormData] = useState({
    title: "",
    price: "",
    description: "",
    image_url: "",
    category_id: 1
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (location.state?.product) {
      const existingProduct = location.state.product;
      populateFormFields(existingProduct);
    } else {
      loadProductData();
    }
  }, [productId]);

  const populateFormFields = (productData) => {
    setEditFormData({
      title: productData.title || "",
      price: productData.price ? String(productData.price) : "",
      description: productData.description || "",
      image_url: productData.image_url || "",
      category_id: productData.category_id || 1
    });
  };

  const loadProductData = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/${productId}`);
      populateFormFields(response.data);
    } catch (err) {
      toast.error("Ürün bulunamadı");
      navigateTo("/dashboard");
    }
  };

  const updateFormField = (fieldName, fieldValue) => {
    setEditFormData(prev => ({
      ...prev,
      [fieldName]: fieldValue
    }));
  };

  const processUpdateRequest = async (e) => {
    e.preventDefault();
    
    if (!editFormData.title.trim()) {
      toast.error("Başlık alanı zorunludur!");
      return;
    }

    const sessionToken = localStorage.getItem("token");
    if (!sessionToken) {
      navigateTo("/");
      return;
    }

    setIsUpdating(true);
    
    try {
      await axios.put(`${API_URL}/products/${productId}`, editFormData, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      toast.success("İlan başarıyla güncellendi!");
      navigateTo("/dashboard");
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error("⛔ Bu ilanı güncelleme yetkiniz yok!");
      } else {
        toast.error("Güncelleme işlemi başarısız.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <button onClick={() => navigateTo("/dashboard")} className="back-btn">
          ← Geri
        </button>

        <h2 className="form-title">İlanı Güncelle</h2>

        <form onSubmit={processUpdateRequest} className="product-form">
          <div className="form-group">
            <label>Başlık *</label>
            <input
              type="text"
              placeholder="Ürün başlığı"
              value={editFormData.title}
              onChange={(e) => updateFormField('title', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Fiyat (0 = Bağış)</label>
            <input
              type="number"
              placeholder="0"
              value={editFormData.price}
              onChange={(e) => updateFormField('price', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Açıklama</label>
            <textarea
              placeholder="Ürün açıklaması"
              value={editFormData.description}
              onChange={(e) => updateFormField('description', e.target.value)}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Resim URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={editFormData.image_url}
              onChange={(e) => updateFormField('image_url', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Kategori</label>
            <select
              value={editFormData.category_id}
              onChange={(e) => updateFormField('category_id', e.target.value)}
            >
              <option value="1">Ders Kitapları</option>
              <option value="2">Elektronik</option>
              <option value="3">Mobilya</option>
              <option value="4">Kırtasiye</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn-submit"
            disabled={isUpdating}
          >
            {isUpdating ? "Güncelleniyor..." : "Değişiklikleri Kaydet"}
          </button>
        </form>
      </div>
    </div>
  );
}