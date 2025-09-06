const customMotorRouter = require('express').Router();
const CustomMotor = require('../module/customMotor');

customMotorRouter.get('/', async (request, response, next ) => {
  try {
    const customMotor = await customMotor.find({});
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
    otherDescription
    });

    const savedCustomMotor = await newCustomMotor.save();
    response.status(201).json(savedCustomMotor);
  } catch (error) {
    console.error("Error creating custom motor:", error);
    next(error);
  }
})

customMotorRouter.delete('/:id', async (request, response, next) => {
  try {
    await CustomMotor.findByIdAndRemove(request.params.id);
    response.status(204).end();
  } catch (error) {
    console.error("Error deleting custom motor:", error);
    next(error);
  }
})

module.exports = customMotorRouter;