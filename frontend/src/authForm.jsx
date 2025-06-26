import React, { useState }from 'react'
import LoginForm from './loginForm'
import RegistrationForm from './RegistrationForm'
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
  {/*   
     {onClose && (
        <button onClick={onClose} style={{ marginTop: '10px' }}>
          Close
          </button>
     )}
*/}
    </div>
  );
  };
  
  export default AuthForm;
  

