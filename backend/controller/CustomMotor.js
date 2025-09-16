const customMotorRouter = require('express').Router();
const CustomMotor = require('../module/customMotor');
const { getIO } = require('../websocketHandle')

customMotorRouter.get('/', async (request, response, next ) => {
  try {
    const customMotor = await CustomMotor.find({});
    response.json(customMotor);
  } catch (error) {
    console.error("Error fetching custom motors:", error);
    next(error);
  }
})

customMotorRouter.get('/user/:userId', async (request, response, next) => {
  try {
    const userId = request.params.userId;
    const customMotor = await CustomMotor.find({ user: userId });
    response.json(customMotor);
  } catch (error) {
    console.error("Error fetching custom motors by user ID:", error);
    next(error);
  }
})

customMotorRouter.post('/', async (request, response, next) => {
try {

      if (!request.body) {
      return response.status(400).json({ error: 'Request body is missing' });
    }

  const { 
      user, 
      brand, 
      model,
      price, 
      year,
      madeIn,
      mileage,
      fuelType, 
      transmission, 
      bodyType,
      color, 
      seats, 
      doors, 
      engineSize, 
      status,
      condition,
      createdAt,
      tracks,
      otherDescription } = request.body;
  const newCustomMotor = new CustomMotor({
    user,
    brand,
    model,
    price,
    year,
    madeIn,
    mileage,
    fuelType,
    transmission,
    bodyType,
    color,
    seats,
    doors,
    engineSize,
    status,
    condition,
    createdAt,
    tracks,
    otherDescription
    });

    const savedCustomMotor = await newCustomMotor.save();

     if (getIO()) {
      getIO().emit('newCustomCar', {
        type: 'newCustomCar',
        message: savedCustomMotor,
      })
      console.info('Custom Car socket received:', savedCustomMotor)    
    } else {
      console.error("Socket.io is not initialized. Cannot emit new message.");
    }
    
    response.status(201).json(savedCustomMotor);
  } catch (error) {
    console.error("Error creating custom motor:", error);
    next(error);
  }
})

customMotorRouter.put('/:id/tracks', async (request, response, next) => {
  try {
    const { tracks } = request.body
    const validStatuses = ['Received','Proceeding','Rejected','Accepted','Done']
    if (!validStatuses.includes(tracks)) {
      return response.status(400).json({ error: 'Invalid status' })
    }

    const updatedCar = await CustomMotor.findByIdAndUpdate(
      request.params.id,
      { tracks },
      { new: true }
    )

        if (getIO()) {
      getIO().emit('updateCustomCar', updatedCar)
    }
    response.json(updatedCar)
  } catch(error) {
    response.status(500).json({ error: error.message })
  }
})

customMotorRouter.delete('/:id', async (request, response, next) => {
  try {
    await CustomMotor.findByIdAndRemove(request.params.id);
    response.status(204).end();
  } catch(error) {
    console.error("Error deleting custom motor:", error);
    next(error);
  }
})

module.exports = customMotorRouter;