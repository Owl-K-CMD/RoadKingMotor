const messagesRouter = require('express').Router()
const mongoose = require('mongoose')
const Message = require('../module/message')
const User = require('../module/user');
const { getIO } = require('../websocketHandle');


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


messagesRouter.post('/', async (req, res, next) => {
  const { sender, senderModel, receiver, receiverModel, content } = req.body;

  try {

    if (!['User', 'AdminUser'].includes(senderModel) || !['User', 'AdminUser'].includes(receiverModel)) {
      return res.status(400).json({ error: 'Invalid senderModel or receiverModel' });
    }

    const senderId = typeof sender === 'object' && sender !== null ? sender._id : sender;
    const receiverId = typeof receiver === 'object' && receiver !== null ? receiver._id : receiver;

    if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ error: 'Invalid ObjectId format' });
    }

    const SenderModel = senderModel === 'AdminUser' ? require('../module/adminUser') : User;
    const ReceiverModel = receiverModel === 'AdminUser' ? require('../module/adminUser') : User;

    const senderUser = await SenderModel.findById(senderId);
    const receiverUser = await ReceiverModel.findById(receiverId);

    if (!senderUser || !receiverUser) {
      return res.status(404).json({ error: 'Sender or receiver not found' });
    }

    let message = new Message({
      sender,
      senderModel,
      receiver,
      receiverModel,
      content,
    });

    message = await message.save();
    message = await Message.findById(message._id)
      .populate('sender', 'userName _id')
      .populate('receiver', 'userName _id');

    
    if (getIO()) {
      getIO().emit('receiveMessage', { type: 'newMessage', message });
    }
    

    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    next(error);
  }
});

module.exports = messagesRouter;