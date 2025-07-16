import React, { useState } from 'react';
import userAxios from './userAxios';
import style from './module/authStyle.module.css'



    const LoginForm = ({ onLoginSuccess }) => {
      const [userName, setUserName] = useState('')
      const [password, setPassword] = useState('')
      const [error, setError] = useState('')
      const [loading, setLoading] = useState(false)
    

 const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

   if (!userName) {
      setError('Username is required.')
      setLoading(false)
      return;
    }

    if (!password) {
      setError('Password is required.')
      setLoading(false)
      return;
    }


    try {
      const loginData = { userName, password };
      const response = await userAxios.loginUser(loginData);
      console.log('Login successful:', response);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('currentUser', JSON.stringify(response.user));

     if (onLoginSuccess) {
      onLoginSuccess(response.user);
    }
    
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={style.loginForm} onSubmit={handleSubmit}>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label htmlFor="login-username">Username:</label>
        <input
        placeholder=" Enter your Username"
          type="text"
          id="login-username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          disabled={loading}
        />
      </div>
      <div >
        <label htmlFor="login-password">Password:</label>
        <input
        placeholder=" Enter your Password"
          type="password"
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>
      <button className={style.loginRegisterButton} type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;

