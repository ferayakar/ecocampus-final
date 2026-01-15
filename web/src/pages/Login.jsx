import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import API_URL from "../config"; 

export default function Login() {
  const [userCredentials, setUserCredentials] = useState({
    email: "",
    password: ""
  });
  const [isProcessingLogin, setIsProcessingLogin] = useState(false);
  const navigateTo = useNavigate();

  const updateCredential = (fieldName, value) => {
    setUserCredentials(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const extractIdFromJWT = (token) => {
    try {
      const parts = token.split('.');
      const payloadEncoded = parts[1];
      const payloadDecoded = payloadEncoded.replace(/-/g, '+').replace(/_/g, '/');
      
      const jsonString = decodeURIComponent(
        atob(payloadDecoded)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonString);
      return payload.id || payload.userId || payload.user_id || null;
    } catch (err) {
      console.warn("Token çözümleme hatası:", err);
      return null;
    }
  };

  const processLoginRequest = async (e) => {
    e.preventDefault();
    
    if (!userCredentials.email || !userCredentials.password) {
      toast.error("Email ve şifre gerekli");
      return;
    }

    setIsProcessingLogin(true);
    
    try {
      const apiResponse = await axios.post(`${API_URL}/auth/login`, {
        email: userCredentials.email.trim(),
        password: userCredentials.password,
      });

      localStorage.setItem("token", apiResponse.data.token);
      
      let userId = apiResponse.data.userId || apiResponse.data.user_id;
      
      if (!userId) {
        userId = extractIdFromJWT(apiResponse.data.token);
      }
      
      if (userId) {
        localStorage.setItem("userId", String(userId));
      }

      toast.success("Hoş geldiniz!");
      navigateTo("/dashboard");
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.message || "Giriş başarısız!");
      } else if (err.request) {
        toast.error("Sunucuya erişilemiyor!");
      } else {
        toast.error("Bir hata oluştu!");
      }
    } finally {
      setIsProcessingLogin(false);
    }
  };

  const continueAsGuest = () => {
    toast.info("Misafir modunda devam ediyorsunuz");
    navigateTo("/dashboard");
  };

  return (
    <div className="login-container">
      <form onSubmit={processLoginRequest} className="login-form">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '40px',
            background: '#667eea',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}>
            <span style={{ fontSize: '36px', fontWeight: '900', color: 'white' }}>K</span>
          </div>
          <h2>KampüsKitap</h2>
          <p className="subtitle">Kitaplarınızı Paylaşın</p>
        </div>
        
        <input
          type="email"
          placeholder="E-posta adresiniz"
          value={userCredentials.email}
          onChange={(e) => updateCredential('email', e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Şifreniz"
          value={userCredentials.password}
          onChange={(e) => updateCredential('password', e.target.value)}
          required
        />
        
        <button type="submit" disabled={isProcessingLogin}>
          {isProcessingLogin ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          margin: '24px 0',
          gap: '16px'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e1e4f3' }}></div>
          <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>veya</span>
          <div style={{ flex: 1, height: '1px', background: '#e1e4f3' }}></div>
        </div>

        <div style={{ 
          background: '#f8f9fd',
          border: '2px solid #667eea',
          borderRadius: '10px',
          padding: '18px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          marginBottom: '16px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#667eea';
          e.currentTarget.querySelector('a').style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#f8f9fd';
          e.currentTarget.querySelector('a').style.color = '#667eea';
        }}>
          <Link to="/register" style={{ 
            color: '#667eea', 
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '16px',
            letterSpacing: '0.5px',
            display: 'block'
          }}>
            Hesap Oluştur
          </Link>
        </div>

        <button 
          type="button" 
          className="guest-btn" 
          onClick={continueAsGuest}
        >
          Misafir Olarak Devam Et →
        </button>
      </form>
    </div>
  );
}