const CartRouter = require('express').Router()
const { request } = require('express')
const Cart = require('../module/cart')

const authMiddleware = (request, response, next) => {
  const token = request.headers.authorization?.split(' ')[1];

  if (!token) {
    return response.status(401).json({ message: 'No token, authorization denied '})
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    request.user = decoded.user;
    next()
  } catch (error) {
    response.status(401).json({ message: 'Invalid token'})
  
  }
}

CartRouter.get('/:userId', authMiddleware, async(request, response) => {
   try {
    const { userId } = request.params;

    if (request.user.id !== userId) {
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

    if (request.user.id !== userId) {
      return response.status(403).json({ message: 'Access denied: User ID mismatch.'}) 
    }
    let cart = await Cart.findOneAndUpdate(
      { userId },
      { items: newCartItems },
      { new: true, upset: true, setDefaultsOneInsert: true}
    );

    response.json(cart.items);
  } catch (error) {
    console.error('Error updating cart:', error);
    response.status(500).json({ message: 'Server error updating cart.'})
  }
})

module.exports = CartRouter;