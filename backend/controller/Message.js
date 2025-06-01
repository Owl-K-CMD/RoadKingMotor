const messagesRouter = require('express').Router()
const Message = require('../module/message')

messagesRouter.get('/:chatId', async(request, response) => {
  const messages = await Message.find({ chatId: request.params.chatId }).sort({ createdAt: 1 });
  response.json(messages);
})

messagesRouter.get('/', async(request, response) => {
  //const messages = await Message.aggregate([
     //{ $group: { _id: '$chatId', lastMessage: { $last: '$$ROOT' } } },
    //{ $sort: { 'lastMessage.createdAt': -1 } }
  //])

  const messages = await Message.find({})
  response.json(messages);
})

messagesRouter.post('/', async(request, response, next) => {
const { sender, content, createdAt } = request.body;

try {
  
 if (!sender) {
    return response.status(400).json({error: 'Sender is required'})
  }
  if (!content) {
    return response.status(400).json({error: 'Content is required'})
  }

const message = new Message({ sender, content, createdAt });
const savedMessage = await message.save();
response.status(201).json(savedMessage);
}
catch (error) {
  next(error);
}
})

module.exports = messagesRouter;