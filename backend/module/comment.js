const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'motor' },
name: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true},
userName: { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
rating: { type: Number, min: 1, max: 5, required: true},
comment: { type: String, required: true}
})

commentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('comment', commentSchema)