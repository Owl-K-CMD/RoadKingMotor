const motorsRouter = require('express').Router()
const Motor = require('../module/motor')

motorsRouter.get('/', (request, response) => {
  Motor.find({}).then(motors => {
    response.json(motors)
  })
})

motorsRouter.get('/:id', (request, response, next) => {
  Motor.findById(request.params.id) 
  .then(motor =>{
    if (motor) {
      response.json(motor)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

motorsRouter.post('/', (request, response, next) => {
  const body =  request.body

  const motor = new Motor ({
    image: body.image,
    name : body.name,
    price : body.price,
    currency : body.currency,
    dateOfRelease : body.dateOfRelease,
    description: body.description
  })

motor.save().then(savedMotor => {
  response.json(savedMotor)
})
.catch(error => next(error))
})

motorsRouter.delete(':id', (request, response, next) => {
  Motor.findByIdAndDelete(request.params.id)
  then(() => {
    response.status(204).end()
  })
  .catch(error => next(error))
})
motorsRouter.put('/:id', (request, response,next) => {
  const {name, price, currency, dateOfRealese} = request.body

  Motor.findById(request.params.id).then(motor => {
    if (!motor) {
      return response.status(404).end()
    }
    motor.image = image
    motor.name = name
    motor.price = price
    motor.currency = currency
    motor.dateOfRealese = dateOfRealese


    return motor.save().then(updatedmotor => {
      response.json(updatedmotor)
    })
})
.catch(error => next(error))
})

module.exports = motorsRouter