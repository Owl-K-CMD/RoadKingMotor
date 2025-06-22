import React, { useState }from 'react'
import LoginForm from './loginForm'
import RegistrationForm from './RegistrationForm'
import ForgotPasswordForm from './forgotPasswordForm'

const AuthForm = ({ onLoginSuccess, onClose }) => {
  const [activeTab, setActiveTab] = useState('login');

  const tabButtonStyle = {
    padding: '10px 15px',
    border: 'none',
    background: '#f0f0f0',
    cursor: 'pointer',
    marginRight: '5px',
    borderRadius: '5px 5px 0 0 ',
    outline: 'none'
  };
 
  const activeTabStyle = {
    ...tabButtonStyle,
    background: '#ddd'
  };

    const containerStyle = {
    maxWidth: '400px',
    margin: '20px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    backgroundColor: 'white',
  };

  const handleRegistrationSuccess = () => {
    setActiveTab('login')
  }

  return (
    <div style={containerStyle}>
       <div style={{ display: 'flex'}}>
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

        <button onClick={onClose} style={{ marginTop: '10px' }}>
          Close
          </button>
    </div>
  );
  };
  
  export default AuthForm;
  

