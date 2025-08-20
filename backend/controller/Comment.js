const commentRouter = require('express').Router()
const Comment = require('../module/comment')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
//const { broadcast } = require('../websocketHandle')
const { io } = require('../websocketHandle')

const authMiddleware = (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.status(401).json({ error: 'Authorization token is required' })
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = jwt.verify(token, config.SECRET_KEY);
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'Token is invalid or has expired' })
    }
    request.user = decodedToken;
    next()
  } catch (error) {
    return response.status(401).json({ error: 'Token invalid'})
  }
  
}

commentRouter.post('/', authMiddleware, async (request, response ) => {
  try {
    const { car, rating, comment } = request.body;
    const userId = request.user.id;

    if (!car || !rating || !comment) {
      return response.status(400).json({ error: 'Missing required fields: car, rating, comment'})
      }
const parentComment = request.body.parentComment || null;

 const newComment = new Comment({ 
      car,
      user: userId,
      parentComment: parentComment,
      rating,
      comment,
  })
    const savedComment = await newComment.save()

    const populatedComment = await savedComment.populate('user', 'userName');
  
    if (io) {
  io.emit(`car_${car}`, {
    type: 'newComment',
    comment: populatedComment,
  })
} else {
  console.error("Socket.io is not initialized. Cannot emit new comment.");
}

    response.status(201).json(populatedComment);
  } catch (error) {
    console.error('Error posting comment:', error)
    response.status(500).json({ error: 'Failed to post comment' })
  }
})

commentRouter.get('/car/:carId', async (request, response, next) => {
  try {
    const comments = await Comment.find({ car: request.params.carId })
      .populate('user', 'userName')
      .sort({ createdAt: -1 })
    response.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    response.status(500).json({ error: 'Failed to fetch comments' })
    next(error)
  }
});

module.exports = commentRouter