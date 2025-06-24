const CartRouter = require('express').Router()
const { request } = require('express')
const Cart = require('../module/cart')
const config = require('../utils/config')
const jwt = require('jsonwebtoken')


const SECRET_KEY = config.SECRET_KEY
const REFRESH_TOKEN_SECRET = config.REFRESH_TOKEN_SECRET


  const authMiddleware = (request, response, next) => {
  const token = request.headers.authorization?.split(' ')[1];
  const authHeader = request.headers.authorization;
  console.log('Authorization  Header Received:', authHeader)


  if (!token) {
    return response.status(401).json({ message: 'No token, authorization denied '})
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Backend: No or invalid Authorization header')
    return response.status(401).json({ message: 'Invalid token format.' })
  } 


  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    //request.user = decoded.user;
    console.log('Backend: Token decoded successfully:', decoded)
    request.user = decoded;

    if (request.params.userId && request.params.userId !== decoded.id) {
      console.log('Backend: User ID mismatch. Token ID:', decoded.id, 'URL ID:', request.params.userId);
      return response.status(403).json({ message: 'Unauthorized to access the resource'})
    }
    next()
  } catch (tokenError) {
    console.error('Token verfication error:', tokenError);
    return response.status(401).json({ message: 'Invalid token or token expired'})
  
  }
}

CartRouter.get('/:userId', authMiddleware, async(request, response) => {
   try {
    const { userId } = request.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Error fetching cart: Invalid user ID format.')
      return response.status(400).json({ message: 'Invalid user ID format'})
    }

    if (request.user.id !== userId) {
      console.log('Backend: User ID mismatch. Token ID:', request.user.id, 'URL ID:', userId);
      return response.status(403).json({ message: 'Access denied: User ID mismatch'})
    }

    const cart = await Cart.findOne({ userId })
    if (!cart) {
      return response.status(200).json([])
    }
    response.json(cart.items);
   } catch (error) {
    console.error('Error fetching cart:', error)
    response.status(500).json({ message: 'Server error fetching cart'})
   }
});

CartRouter.post('/:userId', authMiddleware, async(request, response) => {
  try {
    const { userId } = request.params;
    const newCartItems = request.body;
    const { items } = request.body;


    if (request.user.id !== userId) {
      return response.status(403).json({ message: 'Access denied: User ID mismatch.'}) 
    }
    let cart = await Cart.findOneAndUpdate(
      { userId },
      { items: items },
      { new: true, upsert: true, setDefaultsOnInsert: true}
    );
     
    if (!cart) {
      console.error('Cart.findOneAndUpdate return null or undefined for userId:', userId);
      return response.status(500).json({ message: 'Failed to update or create cart. Nocart document returned .'})
    }
    response.json(cart.items);
  } catch (error) {
    console.error('Error updating cart:', error);
    response.status(500).json({ message: 'Server error updating cart.'})
  }
})

CartRouter.post('/refresh_token', async (request, response) => {
  const refreshToken = request.body.refreshToken;
  
  if (!refreshToken) {
    return response.status(401).json({ message: 'Refresh token is required'})
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    const newAccessToken = jwt.sign(
      { id: decoded.id, userName: decoded.userName },
      SECRET_KEY,
      { expiresIn: '15m'}
    );
    

    const newRefreshToken = jwt.sign(
      { id: decoded.id, userName: decoded.userName },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d'}
    )
    response.json({ token: newAccessToken, refreshToken: newRefreshToken})
  } catch (error) {
    console.error('Error refreshing token:', error);
   return response.status(403).json({ message: 'Invalid refresh token'})
  }
})

module.exports = CartRouter;