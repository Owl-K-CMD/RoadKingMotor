import React, { useState }from 'react'
import LoginForm from './loginForm'
import RegistrationForm from './registrationForm.jsx'
import ForgotPasswordForm from './forgotPasswordForm'
import style from './module/authStyle.module.css'

const AuthForm = ({ onLoginSuccess}) => {
  return (
    <div className={style.containerStyle}>
      <div className={style.tabContainer}>
        <button>Login</button>
      </div>
        <LoginForm onLoginSuccess={onLoginSuccess} />
    </div>
  );
  };
  
  export default AuthForm;
  

