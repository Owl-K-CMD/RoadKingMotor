const messagesRouter = require('express').Router()
const mongoose = require('mongoose')
const Message = require('../module/message')
const User = require ('../module/user');
const { broadcast } = require('../websocketHandle');

messagesRouter.get('/:chatId', async(request, response) => {
  const messages = await Message.find({ chatId: request.params.chatId }).sort({ createdAt: 1 });
  response.json(messages);
})

messagesRouter.get('/', async(request, response, next) => {

  try {
  const messages = await Message.find({})
  .populate('sender', 'userName _id')
  .populate('receiver', 'userName _id')
  .sort({ createdAt: 1 })
  response.json(messages);
  }
  catch (error) {
    next(error)
  }
})

messagesRouter.post('/', async(request, response, next) => {
const {sender, receiver, content, createdAt } = request.body;

try {
  
 if (!sender) {
    return response.status(400).json({error: 'Sender objectId is required'})
  }
  if (!content) {
    return response.status(400).json({error: 'Content is required'})
  }
  if (!receiver) {
    return response.status(400).json({error: 'Receiver objectId is required'})
  }

  if (!mongoose.Types.ObjectId.isValid(sender)) {
    return response.status(400).json({ error: 'Invalid Sender ObjectId format' });
  }


    if (!mongoose.Types.ObjectId.isValid(receiver)) {
    return response.status(400).json({ error: 'Invalid Receiver ObjectId format' });
  }

const normalizedsender = sender.trim().replace(/\s\s+/g, ' ');
  const normalizedreceiver = receiver.trim().replace(/\s\s+/g, ' ');

const senderUser = await User.findById(normalizedsender);
const receiverUser = await User.findById(normalizedreceiver);


  if (!senderUser) {
    return response.status(404).json({ error: `Sender with username '${sender}' not found.` });
  }

  if (!receiverUser) {
    return response.status(404).json({ error: `Receiver with username '${receiver}' not found.` });
  }

const message = new Message({
 sender: sender._id,
 receiver: receiver._id,
 content,
 createdAt
  });

let savedMessage = await message.save();

savedMessage = await Message.findById(savedMessage._id)
  .populate('sender', 'userName _id')
  .populate('receiver', 'userName _id');
  
  broadcast({
    //type: 'NEW_MESSAGE',
    type: 'receiveMessage',
    payload: savedMessage,
  },
    receiverUser._id.toString()
);
response.status(201).json(savedMessage);
}
catch (error) {
  next(error);
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
}
console.error('Error creating message:', error)
}
})

module.exports = messagesRouter;