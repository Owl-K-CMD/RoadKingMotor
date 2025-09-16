const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true},
  name: {type: String, required: true },
  email: { type: String, required: false, unique: false, sparse: true },
  phoneNumber: { type: String, required: function() { return !this.isGuest;} },
  passwordHash: { type: String, required: function() { return !this.isGuest;} },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  isAdmin: { type: Boolean, default: false },
  isGuest: { type: Boolean, default: false },
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('User', userSchema)