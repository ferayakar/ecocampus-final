import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import API_URL from "../config"; 

export default function Register() {
  const [registrationData, setRegistrationData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const navigateTo = useNavigate();

  const updateRegistrationField = (fieldName, value) => {
    setRegistrationData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const processRegistration = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(`${API_URL}/auth/register`, {
        username: registrationData.username,
        email: registrationData.email,
        password: registrationData.password,
      });

      toast.success("Kayıt Başarılı! Artık giriş yapabilirsiniz.");
      navigateTo("/");
    } catch (err) {
      toast.error("Kayıt başarısız. Bilgilerinizi kontrol edin.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={processRegistration} className="login-form">
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
          <h2>Hesap Oluştur</h2>
          <p className="subtitle">Topluluğa katılın</p>
        </div>
        
        <input
          type="text"
          placeholder="Kullanıcı adınız"
          value={registrationData.username}
          onChange={(e) => updateRegistrationField('username', e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="E-posta adresiniz"
          value={registrationData.email}
          onChange={(e) => updateRegistrationField('email', e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Şifreniz"
          value={registrationData.password}
          onChange={(e) => updateRegistrationField('password', e.target.value)}
          required
        />
        
        <button type="submit">
          Hesap Oluştur
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
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#667eea';
          e.currentTarget.querySelector('a').style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#f8f9fd';
          e.currentTarget.querySelector('a').style.color = '#667eea';
        }}>
          <Link to="/" style={{ 
            color: '#667eea', 
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '16px',
            letterSpacing: '0.5px',
            display: 'block'
          }}>
            Zaten hesabım var
          </Link>
        </div>
      </form>
    </div>
  );
}