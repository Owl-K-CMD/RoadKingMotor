
import React, { useEffect, useState } from 'react';
import userAct from './userAxios.js'
import style from './module/styleCartContent.module.css'

const processUserResponse = (userData) => {
  if (userData && typeof userData === 'object' && typeof userData.id !== 'undefined' && typeof userData._id === 'undefined') {
    return { ...userData, _id: userData.id }
  }
  return userData;

}

const Addtocart = ({ cartItems = [], onClose }) => {

 
  const [isFlutterwaveReady, setFlutterwaveReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');

 
  const [loginUsername, setLoginUsername] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhoneNumber, setRegPhoneNumber] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState(''); 


  

  const grandTotal = cartItems.reduce((total, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return total + price * quantity;
  }, 0);

  useEffect(() => {
    if (window.FlutterwaveCheckout) {
      setFlutterwaveReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
script.async = true;
script.onload = () => setFlutterwaveReady(true);
script.onerror = () => {
  console.error('Failed to load Flutterwave script.');
  setFlutterwaveReady(false);
};
document.body.appendChild(script);
return () => {
  document.body.removeChild(script);
};
}, []);


const handleProceedToPayment = () => {
  if (isFlutterwaveReady) {
    setAuthError("Payment system is not ready. Please wait or refresh.")
    return;
  
  }
  if (currentUser && currentUser._id) {
    initiateFlutterwavePayment(currentUser)
  }
  else {
    setShowAuthForm(true)
    setIsRegistering(false)
    setAuthError('')
  }
}

const handleLogin = async (e) => {
  if (e) e.preventDefault();
  if (!loginUsername.trim()) {
    setAuthError('Please enter your username.');
    return;
  }
  setAuthError('')
  try {
    const rawUser = await userAct.getUserByUserName(loginUsername);
    const user = processUserResponse(rawUser);
    if (user && user._id) {
      setCurrentUser(user);
      setShowAuthForm(false);
      setLoginUsername('');
      initiateFlutterwavePayment(user);
    } else {
            setAuthError('User not found or data incomplete. Please register.');
        setIsRegistering(true);
        setRegUsername(loginUsername);
    }
} catch (error) {
    if (error.response && error.response?.status === 404) {
        setAuthError('User not found. Please register or try a different username')
        setIsRegistering(true);
        setRegUsername(loginUsername);
    } else {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'An unexpected error occurred. Please try again.';
      setAuthError(message);
    }
}
}

const handleRegister = async (e) => {
  if (e) e.preventDefault();
  if (!regUsername.trim() || !regName.trim() || !regPhoneNumber.trim() || !regPassword.trim()) {
    setAuthError('All fields are required.');
    return;
  }

  setAuthError('')
  const newUser = {
    userName: regUsername,
    name: regName,
    phoneNumber: regPhoneNumber,
    password: regPassword,
    email: regEmail
  };

  try {
    const rawRegisteredUser = await userAct.createUser(newUser);
    const registeredUser = processUserResponse(rawRegisteredUser);

    if (registeredUser && registeredUser._id) {
      setCurrentUser(registeredUser);
      setShowAuthForm(false);
      setRegUsername('');
      setRegName('');
      setRegPhoneNumber('');
      setRegPassword('');
      setRegEmail('')
      initiateFlutterwavePayment(registeredUser);
    } else {
      setAuthError('Registration completed, but user data is incomplete. Please try logging in or contact support.');
    }
  } catch (error) {
    console.error('Registration error', error);
    const message = error.response?.data?.message || error.response?.data?.error || 'Registration failed. Please try again.';
    setAuthError(message)
  }
}

function makePayment() {

      if (!isFlutterwaveReady || !window.FlutterwaveCheckout) {
      setAuthError('Payment gateway is not available. Please try again.');
      setShowAuthForm(false);
      return;
    }
    if (!userForPayment || !userForPayment._id) {
        setAuthError('User details are missing. Cannot proceed to payment.');
        setShowAuthForm(true);
        return;
    }

	window.FlutterwaveCheckout({
		public_key: 'FLWPUBK_TEST-1a28ef8253dafb6d29bcc0e192158bf9-X',
		tx_ref: `RMK-PAY-${Date.now()}`,
		amount: grandTotal,
		currency: 'USD',
		payment_options: 'card, mobilemoneyrwanda, ussd',
		redirect_url: 'https://glaciers.titanic.com/handle-flutterwave-payment',
		meta: {
			cart_items: cartItems.length,
			consumer_mac: '92a3-912ba-1192a-1',
			consumer_id: userForPayment._id,
		},
		customer: {
			email:  userForPayment.email,
      phone_number: userForPayment.phoneNumber,
			name: userForPayment.name,
		},
		customizations: {
			title: 'Road King Motor',
			description: `Payment for ${cartItems.length} item(s) from Road King Motor}`,
			logo: 'https://roadkingmoor.s3.eu-north-1.amazonaws.com/RKM.png',
		},

    callback: function (response) {
      console.log('Flutterwave payment response:', response);

      if (response.status === "successful") {
        alert("Payment successful! Thank you for your purchase.")
        if (onClose) onClose()
      } else {
    alert("Payment was not successful or was cancelled. Please try again")
        }
      }
    ,
   onclose: function() {
    console.log('Flutterwave modal closed by user.')
   }
	});
}

const renderAuthForm = () => {
  if (!showAuthForm) return null;
}
  return (
    <div className={style.cartContent}>

      <div className={style.cartHeader}
      >
        <h2>My Cart</h2>
              {onClose && (
        <button
            onClick={onClose}
            className={style.closeButton}
            aria-label="Close cart"
          >
           close
          </button>
        )}
        
      </div>

      {cartItems.length > 0 ? (
        <ul className={style.cartList}>
          {cartItems.map((item, index) => (
            <li
              key={item._id || index}
              style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #f0f0f0' }}
            >
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Model: {item.model}</p>
              <p style={{ margin: 0 }}>Price: {item.price} rwf</p>
              <p style={{ margin: 0 }}>Quantity: {item.quantity}</p>
              <p style={{ margin: 0 }}>
                Total: {(Number(item.price) * Number(item.quantity)).toLocaleString()} rwf
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p
          style={{
            textAlign: 'center',
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Your cart is empty.
        </p>
      )}
       <div className={style.cartFooter}>
      {cartItems.length > 0 && (
        <div className={style.grandTotal}>
          <h3 style={{ margin: 0, fontSize: '1.2em' }}>Grand Total: {grandTotal.toLocaleString()} $</h3>
        </div>
      )}

      <button type='button' onClick={makePayment} 
      disabled={cartItems.length === 0}>
        Buy Now
      </button>
      </div>
    </div>
  );
};

export default Addtocart;
