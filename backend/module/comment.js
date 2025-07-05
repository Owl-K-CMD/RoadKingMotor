const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
car: { type: mongoose.Schema.Types.ObjectId, ref: 'motor', required: true},
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
rating: { type: Number, min: 1, max: 5, required: true},
comment: { type: String, required: true},
createdAt: { type: Date, default: Date.now}
})

commentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('comment', commentSchema)