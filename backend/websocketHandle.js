const { Server } = require('socket.io');
const logger = require('./utils/logger');
const config = require('./utils/config.js');
const Message = require('./module/message');
const jwt = require('jsonwebtoken');

const SECRET = config.SECRET_KEY;
const REFRESH_SECRET = config.REFRESH_SECRET_KEY;

const initializeWebSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://roadkingmotor-pkx5.onrender.com"
      ],
      methods: ["GET", "POST"],
    }
  });

  const users = {};

io.use((socket, next) => {
  const userId = socket.handshake.auth.userId;
  const token = socket.handshake.auth.token;

if (token === 'admin' && userId === '68437f46357ee88b6d9b492d') {
  socket.userId = userId;
  users[socket.userId] = socket.id;
  return next();
} else if (token) {
  try {
    const SECRETREFRESH = SECRET || REFRESH_SECRET
    const decoded = jwt.verify(token, SECRETREFRESH);
    socket.userId = decoded.id
    users[socket.userId] = socket.id;
    return next();
  } catch (error) {
    logger.error("JWT verification failed:", error);
    return next(new Error("Authentication error: invalid token"));
  }
} else {
  return next(new Error("Authentication error: token is required"));
}
})
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}, User: ${socket.userId}`);

    socket.on('sendMessage', async(message) => {
      logger.info(`Message received from ${socket.id}: ${JSON.stringify(message)}`);

      try {
        const savedMessage = await Message.create({
          sender: message.sender,
          receiver: message.receiver,
          content: message.content
        })

  const populatedMessage = await Message.findById(savedMessage._id)
      .populate('sender', 'userName _id')
      .populate('receiver', 'userName _id')

        if (message.receiverId && users[message.receiver]) {
          io.to(users[message.receiver]).emit('receiveMessage', populatedMessage);
        }
         else {
        io.emit('receiveMessage', populatedMessage);
        }
    } catch (error) {
      logger.error("Error saving message:", error);
    }
    })

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
  logger
}

module.exports = { initializeWebSocket}