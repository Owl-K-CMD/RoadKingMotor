const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
        //sender: { type:mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        sender: { type: String, required: true},

        content: { type: String, required: true},
        createdAt: { type: Date, default: Date.now },
      })

messageSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }

})

module.exports = mongoose.model('message', messageSchema)