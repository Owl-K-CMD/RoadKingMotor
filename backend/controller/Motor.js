
const motorsRouter = require('express').Router()
//const { default: cars } = require('../../frontend/src/cars')
const motor = require('../module/motor')
const Motor = require('../module/motor')
const multer = require('multer')
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")
const storage = multer.memoryStorage()
const upload = multer({ storage })
const config = require('../utils/config')


const s3Client = new S3Client({
  region: config.AWS_REGION,
  credentials: {
  accessKeyId: config.AWS_ACCESS_KEY,
  secretAccessKey: config.AWS_SECRET_KEY,
}
});


motorsRouter.get('/', (request, response) => {
  const motors = request.query.motors

  Motor.find({}).then(motors => {
    response.json(motors)
  })
})

motorsRouter.get('/:id', (request, response, next) => {
  Motor.findById(request.params.id) 
  .then(motor =>{
    if (motor) {
      response.json(motor)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

 motorsRouter.get('/:name', (request, response, next) => {
  const name = request.params.name;

  Motor.find({ name: name })
    .then(car => {
      response.json(car);
    })
    .catch(error => next(error));
});


motorsRouter.post('/', upload.single('image'), async(request, response, next) => {
  const body =  request.body
const file = request.file

try {
if (!file) {
  return response.status(400).json({error: 'Image file is required'})
}

   const params = {
    Bucket: config.AWS_BUCKET_NAME,
    Key: `${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    //ACL: 'public-read',
  };


    const command = new PutObjectCommand(params);
    await s3Client.send(command);
 
    //const s3Result = await s3Client.send(command);
    const imageUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`


  const motor = new Motor ({
    images: imageUrl,
    brand : body.brand,
    model : body.model,
    price : body.price,
    year: body.year,
    madeIn: body.madeIn,
    mileage : body.mileage,
    fuelType : body.fuelType,
    transmission : body.transmission,
    bodyType : body.bodyType,
    color : body.color,
    seats : body.seats,
    doors : body.doors,
    engineSize: body.engineSize,
    status: body.status,
    createdAt: body.createdAt,
    otherDescription: body.otherDescription
 })

const savedMotor= await motor.save()
  response.status(201).json(savedMotor)

}
catch(error) {
  console.log("Error in POST /api/motors:", error);
  next(error)
}

})

motorsRouter.delete('/:id', async(request, response) => {
  await Motor.findByIdAndDelete(request.params.id)
    response.status(204).end()
})
motorsRouter.put('/:id', (request, response,next) => {
  const { images,
     brand, model,
     price, year,
     madeIn, mileage,
     fuelType, transmission,
     bodyType, color,
     seats, doors,
     engineSize,
     status,
     createdAt,
     otherDescription } = request.body

  Motor.findById(request.params.id).then(motor => {
    if (!motor) {
      return response.status(404).end()
    }
    motor.images = images
    motor.brand = brand
    motor.model = model
    motor.price = price
    motor.year = year
    motor.madeIn = madeIn
    motor.mileage = mileage
    motor.fuelType = fuelType
    motor.transmission = transmission
    motor.bodyType = bodyType
    motor.color = color
    motor.seats = seats
    motor.doors = doors
    motor.engineSize = engineSize
    motor.status = status
    motor.createdAt = createdAt
    motor.otherDescription = otherDescription
    



    return motor.save().then(updatedmotor => {
      response.json(updatedmotor)
    })
})
.catch(error => next(error))
})


module.exports = motorsRouter