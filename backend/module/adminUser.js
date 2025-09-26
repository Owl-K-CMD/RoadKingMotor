const mongoose = require('mongoose')

const adminUserSchema = new mongoose.Schema({
  name: {type: String, required: true, },
  passwordHash: { type: String, required: true, },
  isAdmin: { type: Boolean, default: true}
})

adminUserSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('AdminUser', adminUserSchema)