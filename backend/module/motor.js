const mongoose = require('mongoose')

   const motorSchema =new mongoose.Schema({
  images: {type: [String], required: true},
  brand: {type: String, required: true},
  model: {type: String, required: true},
  price: {type: Number, required: true},
  year: {type: Number, required: true},
  madeIn: {type: String, required: true},
  mileage: {type: Number, required: true},
  fuelType: {type: String, required: true},
  transmission: {type: String, required: true},
  bodyType: {type: String, required: true},
  color: {type: String, required: true},
  seats: {type: Number, required: true},
  doors: {type: Number, required: true},
  engineSize: {type: String, required: true},
  status: { type: String, default: 'pending' },
  condition: { type: String, required: true},
  createdAt: { type: Date, default: Date.now },
  otherDescription: {type: String, required: true},
    })


    

motorSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('motor', motorSchema )