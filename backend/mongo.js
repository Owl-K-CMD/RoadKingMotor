const mongoose = require('mongoose');

if (!process.argv.length ) {
  console.log('give password as argument');
  process.exit(1);
}

const password = process.argv[2]
const url = `mongodb+srv://kumutimam:${password}@cluster0.eckuzim.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((err) => {
    console.log('error connecting to MongoDB:', err.message)
  })

  const motorSchema =new mongoose.Schema({
    image: { type: String, required: true},
    name: {type: String, required: true},
    price: {type: Number, required: true},
    currency: {type: String, required: true},
    dateOfRelease: {type: String, required: true},
    description: {type: String, required: true},
  })

  const Motor = mongoose.model('Motor', motorSchema)

  Motor.find({}).then(result => {
    result.forEach(motor => {
      console.log(motor)
    })
    mongoose.connection.close()
  })