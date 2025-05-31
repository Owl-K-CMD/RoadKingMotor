const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
  usename: { type: String, required: true, unique: true },
  name: {type: String, required: true },
  phonenumber: { type: String, required: true },

  password: { type: String, required: true },
})

module.exports = mongoose.model('User', userSchema)