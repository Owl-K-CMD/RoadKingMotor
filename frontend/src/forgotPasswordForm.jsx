import React, { useState} from 'react';
import userAxios from './userAxios';
import { Link } from 'react-router-dom';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
     setError('')
     setMessage('')


if (!email.trim()) {
  setError('Please enter your username');
  setLoading(false);
  return;
}

  try {
    const response = await userAxios.forgotPassword(email);
    setMessage(response.message || 'If an account with that username exists, a password reset link as been sent (check backend console).')
    setEmail('');
  } catch (error) {
    console.error('Forgot password error:', error);

    if (error.response && error.response.data && error.response.data.error) {
      setError(error.response.data.error);
    } else if (error.response && error.response.data && error.response.data.message) {
      setError(error.response.data.message)
    } else {
      setError('An error occured. Please try again.')
    }
  } finally {
    setLoading(false);
  }
}

return (
  <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px'}}>
    <h2>Forgot Password</h2>
    <form onSubmit={handleSubmit}>
      {message && <p style={{color: 'green'}}>{message}</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
      <div>
        <label htmlFor="forgot-email">Username:</label>
        <input
          type="text"
          id="forgot-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Enter your username'
          disabled={loading}
          style={{ width: '100%', padding: '5px', marginBottom: '10px', boxSizing: 'border-box'}}
        />      
      </div>
      <button type="submit" disabled={loading} style={{ padding: '10px 15px', width: '100%'}}>
        {loading ? 'Loading...': 'Send Reset Link'}
      </button>
    </form>
    <div style={{textAlign: 'center', marginTop: '10px'}}>
      <Link to="/login"> Back to Login</Link>
      </div>
  </div>
);
};
export default ForgotPasswordForm;