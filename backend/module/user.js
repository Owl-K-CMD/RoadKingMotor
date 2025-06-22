const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true},
  name: {type: String, required: true },
  email: { type: String, required: false, unique: false },
  phoneNumber: { type: String, required: true },
  passwordHash: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('User', userSchema)