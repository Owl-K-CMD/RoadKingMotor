const mongoose = require('mongoose')

   const motorSchema =new mongoose.Schema({
      image: { type: String, required: true},
      name: {type: String, required: true},
      price: {type: Number, required: true},
      currency: {type: String, required: true},
      dateOfRelease: {type: String, required: true},
      description: {type: String, required: true},
    })

motorSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('motor', motorSchema)