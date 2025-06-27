require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); 

const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');

const motorsRouter = require('./controller/Motor');
const messageRouter = require('./controller/Message');
const usersRouter = require('./controller/User');
const cartRouter = require('./controller/cartRoute');

const app = express();

logger.info('connecting to', config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message);
  });

app.use(express.json());
app.use(middleware.requestLogger);


app.use('/api/motors', motorsRouter);
app.use('/api/messages', messageRouter);
app.use('/api/user', usersRouter);
app.use('/api/cart', cartRouter);

const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));


if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));



  app.get('/files{/*path}', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app
