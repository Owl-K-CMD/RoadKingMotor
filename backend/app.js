require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const motorsRouter = require('./controller/Motor');
const messageRouter = require('./controller/Message');
const usersRouter = require('./controller/User');
const cartRouter = require('./controller/cartRoute');
const commentRouter = require('./controller/Comment');
const { initializeWebSocket } = require('./websocketHandle');

const app = express();



logger.info('connecting to', config.MONGODB_URI);
mongoose.connect(config.MONGODB_URI)
  .then(() => logger.info('connected to MongoDB'))
  .catch((error) => logger.error('MongoDB connection error:', error.message));
const server = http.createServer(app);
initializeWebSocket(server);


const pingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
});

const allowedOrigins = [
  'https://roadkingmotor-pkx5.onrender.com',
    config.SOCKET_URL,
  'http://localhost:5173',
  'http://localhost:5174',
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(middleware.requestLogger);


app.use('/api/motors', motorsRouter);
app.use('/api/messages', messageRouter);
app.use('/api/user', usersRouter);
app.use('/api/cart', cartRouter);
app.use('/api/comments', commentRouter);

app.get('/api/ping', pingLimiter, (request, response) => {
  response.status(200).send('pong');
});

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = { app, server };
