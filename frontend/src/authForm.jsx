import React, { useState } from 'react'
import LoginForm from './loginForm'
import RegistrationForm from './registrationForm.jsx'
import ForgotPasswordForm from './forgotPasswordForm'
import userAxios from './userAxios'
import style from './module/authStyle.module.css'

const AuthForm = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const tabButtonStyle = {
    padding: '5px 5px',
    //border: 'none',
    background: 'rgba(240, 240, 240, 1)',
    cursor: 'pointer',
    marginRight: '5px',
    borderRadius: '5px 5px 0 0',
    //outline: 'none',
    fontSize: '0.6rem',
    fontWeight: 'bold',
  };

  const activeTabStyle = {
    ...tabButtonStyle,
    background: 'rgba(201, 201, 201, 1)',
  };

  const handleGuestLogin = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await userAxios.loginGuest();
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      if (onLoginSuccess) {
        onLoginSuccess(response.user);
      }
    } catch (err) {
      console.error("Guest login failed", err);
      setError("Guest login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.containerStyle}>
      <div className={style.tabContainer}>
        <button
          style={activeTab === 'login' ? activeTabStyle : tabButtonStyle}
          onClick={() => setActiveTab('login')}
        >
          Login
        </button>
        <button
          style={activeTab === 'register' ? activeTabStyle : tabButtonStyle}
          onClick={() => setActiveTab('register')}
        >
          Register
        </button>
        <button
          style={activeTab === 'forgotPassword' ? activeTabStyle : tabButtonStyle}
          onClick={() => setActiveTab('forgotPassword')}
        >
          Forgot password
        </button>
        <button
          style={activeTab === 'guest' ? activeTabStyle : tabButtonStyle}
          onClick={() => setActiveTab('guest')}
        >
          Guest
        </button>
      </div>

      {activeTab === 'login' && (
        <LoginForm onLoginSuccess={onLoginSuccess} />
      )}
      {activeTab === 'register' && (
        <RegistrationForm onRegistrationSuccess={onLoginSuccess} />
      )}
      {activeTab === 'forgotPassword' && (
        <ForgotPasswordForm />
      )}
      {activeTab === 'guest' && (
        <div className={style.loginForm}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button
            className={style.loginRegisterButton}
            onClick={handleGuestLogin}
            disabled={loading}
          >
            {loading ? "Logging in as Guest..." : "Continue as Guest"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthForm;
