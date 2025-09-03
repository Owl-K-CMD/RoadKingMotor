/*
import React, { useState }from 'react'
import LoginForm from './loginForm'
import RegistrationForm from './registrationForm.jsx'
import ForgotPasswordForm from './forgotPasswordForm'
import style from './module/authStyle.module.css'

const AuthForm = ({ onLoginSuccess}) => {
  const [activeTab, setActiveTab] = useState('login');

  const tabButtonStyle = {
    padding: '10px 15px',
    border: 'none',
    background: '#f0f0f0',
    cursor: 'pointer',
    marginRight: '5px',
    borderRadius: '5px 5px 0 0 ',
    outline: 'none',
    
  };
 
  const activeTabStyle = {
    ...tabButtonStyle,
    background: '#ddd',
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
onClick={() => setActiveTab('forgotPassword')}>
Forgot password
</button>
       </div>
       {activeTab === 'login' && (
        <LoginForm onLoginSuccess={onLoginSuccess} />
       )}
       {activeTab === 'register' && (
        <RegistrationForm onRegistrationSuccess={onLoginSuccess}/>
        )}
        {activeTab === 'forgotPassword' && (
        <ForgotPasswordForm />
        )}

    </div>
  );
  };
  
  export default AuthForm;
  */

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
    padding: '10px 15px',
    border: 'none',
    background: '#f0f0f0',
    cursor: 'pointer',
    marginRight: '5px',
    borderRadius: '5px 5px 0 0',
    outline: 'none',
  };

  const activeTabStyle = {
    ...tabButtonStyle,
    background: '#ddd',
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
