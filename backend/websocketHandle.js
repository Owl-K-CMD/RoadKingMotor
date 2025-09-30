const { Server } = require('socket.io');
const logger = require('./utils/logger');
const config = require('./utils/config.js');
const Message = require('./module/message');
const CustomMotor= require('./module/customMotor');
const jwt = require('jsonwebtoken');
const User = require('./module/user');
const AdminUser = require('./module/adminUser');
const Notification = require('./module/notification');

const SECRET = config.SECRET_KEY;
const REFRESH_SECRET = config.REFRESH_SECRET_KEY;


let io;

const initializeWebSocket = (server) => {
  logger.info('Initializing WebSocket...');

  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://roadkingmotor-pkx5.onrender.com"
      ],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    }
  });

  const users = {};

  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    const token = socket.handshake.auth.token;
    const adminUserId = config.ADMIN_USER_ID
    logger.info(`Authenticating socket with userId: ${userId}, token: ${token}`);
    if (token === 'admin' && userId === "68437f46357ee88b6d9b492d") {
      socket.userId = userId;
      users[socket.userId] = socket.id;
      return next();
    } else if (token) {
      try {
        const SECRETREFRESH = SECRET || REFRESH_SECRET;
        const decoded = jwt.verify(token, SECRETREFRESH);
        socket.userId = decoded.id;
        users[socket.userId] = socket.id;
        logger.info(`JWT verification successfully, userId: ${socket.userId}`);
        logger.info(`JWT verification successfully, userId: ${socket.userId}`);
        return next();
      } catch (error) {
        logger.error("JWT verification failed:", error);
        return next(new Error("Authentication error: invalid token"));
      }
    } else {
      return next(new Error("Authentication error: token is required"));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}, User: ${socket.userId}`); // Correctly log userId

    socket.on('sendMessage', async (message) => {
      logger.info(`Message received from ${socket.id}: ${JSON.stringify(message)}`);

      try {
        const savedMessage = await Message.create({
          sender: message.sender,
          senderModel: message.senderModel,
          receiver: message.receiver,
          receiverModel: message.receiverModel,
          content: message.content
        });

        const populatedMessage = await Message.findById(savedMessage._id)
          .populate('sender', 'userName name _id')
          .populate('receiver', 'userName name _id');

        if (message.receiver && users[message.receiver]) {
          // Emit the fully populated message
          io.to(users[message.receiver]).emit('receiveMessage', { type: 'newMessage', message: populatedMessage });
          // Also send the message back to the sender so their UI updates
          socket.emit('receiveMessage', { type: 'newMessage', message: populatedMessage });
        } else {
          logger.info(`User ${message.receiver} not found or not connected. Message not sent in real-time.`);
          // Still send back to sender so their UI updates
          socket.emit('receiveMessage', { type: 'newMessage', message: populatedMessage });
        }
      } catch (error) {
        logger.error("Error saving or sending message:", error);
      }
    });

    // ✅ Comment event
    socket.on('newComment', async (comment) => {
      logger.info(`New comment received from ${socket.id}: ${JSON.stringify(comment)}`);
      io.emit('newComment', { comment: comment });
    });

    socket.on('newCustomCar', async (customCar) => {
      logger.info(`New custom car request from ${socket.id}: ${JSON.stringify(customCar)}`);

      try {
        const savedCustomCar = await CustomMotor.create({
          user: customCar.user,
          brand: customCar.brand,
          model: customCar.model,
          price: customCar.price,
          year: customCar.year,
          madeIn: customCar.madeIn,
          mileage: customCar.mileage,
          fuelType: customCar.fuelType,
          transmission: customCar.transmission,
          bodyType: customCar.bodyType,
          color: customCar.color,
          seats: customCar.seats,
          doors: customCar.doors,
          engineSize: customCar.engineSize,
          status: customCar.status,
          condition: customCar.condition,
          createdAt: customCar.createdAt,
          tracks: customCar.tracks,
          otherDescription: customCar.otherDescription
        });

        const populatedCustomCar = await CustomMotor.findById(savedCustomCar._id) //CustomMotor
          .populate('user', 'userName _id')
          io.emit('newCustomCar', populatedCustomCar);

      } catch (error) {
        logger.error("Error saving custom car request:", error);
      }
    });

    socket.on('updateCustomCar', async (updatedCustomCar) => {
      logger.info(`Updated custom car request from ${socket.id}: ${JSON.stringify(updatedCustomCar)}`);

      try {
        const customCar = await CustomMotor.findById(updatedCustomCar._id);
        if (customCar) {
          customCar.tracks = updatedCustomCar.tracks;
          await customCar.save();
          io.emit('updateCustomCar', {id: customCar.id, tracks: customCar.tracks});
        }
      } catch (error) {
        logger.error("Error updating custom car request:", error);
      }
    })
    
    // ✅ Notification event
    socket.on('sendNotification', async (notification) => {
      logger.info(`Notification from ${socket.userId}: ${JSON.stringify(notification)}`);

      try {
        const savedNotification = await Notification.create({
          sender: socket.userId,
          receiver: notification.receiver,
          type: notification.type,
          message: notification.message,
         });

        if (notification.receiver && users[notification.receiver]) {
          io.to(users[notification.receiver]).emit('receiveNotification', {
        
            type: notification.type,
            message: notification.message,
            sender: socket.userId,
            timestamp: new Date(),
          });
        } else {
          logger.info(`User ${notification.receiver} not found or not connected. Not broadcasting notification.`);
          }
      } catch (error) {
        logger.error("Error sending notification:", error);
      }
        
    });

    logger.info('senderMessage event is successfully');

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      // cleanup user
      for (let [userId, socketId] of Object.entries(users)) {
        if (socketId === socket.id) {
          delete users[userId];
        }
      }
    });

  });
}
module.exports = { initializeWebSocket, getIO: () => io };