const mongoose = require('mongoose')

const customMotorSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    brand: { type: String },
    model: { type: String },
    price: { type: Number },
    year: { type: Number },
    madeIn: { type: String },
    mileage: { type: Number },
    fuelType: { type: String },
    transmission: { type: String },
    bodyType: { type: String },
    color: { type: String },
    seats: { type: Number },
    doors: { type: Number },
    engineSize: { type: String },
    status: { type: String, default: 'pending' },
    condition: { type: String },
    createdAt: { type: Date, default: Date.now },
    otherDescription: { type: String },
    tracks: {
    type: String,
    enum: [
      'Submitted',
      'Received',
      'Proceeding',
      'Rejected',
      'Accepted',
      'Done'
    ],
    default: 'Submitted'
  }
  })

customMotorSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
module.exports = mongoose.model('customMotor', customMotorSchema )