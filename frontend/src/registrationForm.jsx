import React, { useState } from 'react';
import userAxios from './userAxios';

const RegistrationForm = ({ onRegistrationSuccess }) => {
  const [userName, setUserName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); 
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (!userName || !name || !phoneNumber || !password || !confirmPassword) {
      setError('Please fill in all required fields (Username, Full Name, Phone Number, Password, Confirm Password).');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

  
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
    }

    const newUser = {
      userName,
      name,
      email: email || undefined,
      phoneNumber,
      password,
    };

    try {
      const response = await userAxios.createUser(newUser);
      setSuccessMessage(response.message || 'Registration successful! You can now log in.');

      
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user))

     setUserName('');
      setName('');
      setEmail('');
      setPhoneNumber('');
      setPassword('');
      setConfirmPassword('');
      if (onRegistrationSuccess) {
        onRegistrationSuccess(response);

      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      <div>
        <label htmlFor="reg-username">Username:*</label>
        <input
          type="text"
          id="reg-username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="reg-name">Full Name:*</label>
        <input
          type="text"
          id="reg-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="reg-email">Email (Optional):</label>
        <input
          type="email"
          id="reg-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="reg-phone">Phone Number:*</label>
        <input
          type="tel"
          id="reg-phone"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="reg-password">Password:*</label>
        <input
          type="password"
          id="reg-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="reg-confirm-password">Confirm Password:*</label>
        <input
          type="password"
          id="reg-confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default RegistrationForm;


