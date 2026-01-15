import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import API_URL from "../config"; 

export default function AddProduct() {
  const navigateTo = useNavigate();
  const [productInfo, setProductInfo] = useState({
    title: "",
    price: "",
    description: "",
    image_url: "",
    category_id: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateProductField = (fieldName, fieldValue) => {
    setProductInfo(prev => ({
      ...prev,
      [fieldName]: fieldValue
    }));
  };

  const processFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!productInfo.title.trim()) {
      toast.error("Başlık alanı zorunludur!");
      return;
    }

    const sessionToken = localStorage.getItem("token");
    if (!sessionToken) {
      navigateTo("/");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await axios.post(`${API_URL}/products`, productInfo, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      toast.success("İlan başarıyla eklendi!");
      navigateTo("/dashboard");
    } catch (err) {
      toast.error("İlan eklenirken hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <button onClick={() => navigateTo("/dashboard")} className="back-btn">
          ← Geri
        </button>

        <h2 className="form-title">Yeni İlan Oluştur</h2>

        <form onSubmit={processFormSubmit} className="product-form">
          <div className="form-group">
            <label>Başlık *</label>
            <input
              type="text"
              placeholder="Ürün başlığı"
              value={productInfo.title}
              onChange={(e) => updateProductField('title', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Fiyat (0 = Bağış)</label>
            <input
              type="number"
              placeholder="0"
              value={productInfo.price}
              onChange={(e) => updateProductField('price', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Açıklama</label>
            <textarea
              placeholder="Ürün açıklaması"
              value={productInfo.description}
              onChange={(e) => updateProductField('description', e.target.value)}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Resim URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={productInfo.image_url}
              onChange={(e) => updateProductField('image_url', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Kategori</label>
            <select
              value={productInfo.category_id}
              onChange={(e) => updateProductField('category_id', e.target.value)}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "Yayınlanıyor..." : "İlanı Yayınla"}
          </button>
        </form>
      </div>
    </div>
  );
}