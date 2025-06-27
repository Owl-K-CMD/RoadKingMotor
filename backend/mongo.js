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
  images: {type: String, required: true},
  brand: [{type: String, required: true}],
  model: {type: String, required: true},
  price: {type: Number, required: true},
  year: {type: Number, required: true},
  madeIn: {type: String, required: true},
  mileage: {type: Number, required: true},
  fuelType: {type: String, required: true},
  transmission: {type: String, required: true},
  bodyType: {type: String, required: true},
  color: {type: String, required: true},
  seats: {type: Number, required: true},
  doors: {type: Number, required: true},
  engineSize: {type: String, required: true},
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  otherDescription: {type: String, required: false},
  })

  const messageSchema = new mongoose.Schema({
    sender: { type:mongoose.Schema.Types.ObjectId, ref: 'User',  required: true},
    content: { type: String, required: true},
    createdAt: { type: Date, default: Date.now },
  })

  const userSchema = new mongoose.Schema({
    userName: { type: String, required: true, unique: true },
    name: {type: String, required: true },
    phonenumber: { type: String, required: true },
    password: { type: String, required: true },
  })

  const Motor = mongoose.model('Motor', motorSchema)
  const Message = mongoose.model('Message', messageSchema)


  Motor.find({}).then(result => {
    result.forEach(motor => {
      console.log(motor)
    })

    Message.find({}).then(result => {
      result.forEach(message => {
        console.log(message)
      })
    })
    
    mongoose.connection.close()
  })