const commentRouter = require('express').Router()
const Comment = require('../module/comment')

commentRouter.post('/', async (request, response) => {
  try {
    const comment = new Comment(request.body)
    const saved = await comment.save()
    response.status(201).json(saved)
  } catch (err) {
    response.status(500).json({ error: 'Failed to post comment' })
  }
})

commentRouter.get('/car/:carId', async (request, response) => {
  try {
    const comments = await Comment.find({ car: request.params.carId }).sort({ createdAt: -1 })
    response.json(comments)
  } catch (err) {
    response.status(500).json({ error: 'Failed to fetch comments' })
  }
})

module.exports = commentRouter