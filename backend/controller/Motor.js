const motorsRouter = require('express').Router()
const Motor = require('../module/motor')
const multer = require('multer')
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")
const storage = multer.memoryStorage()
const upload = multer({ storage })
const config = require('../utils/config')
const { broadcast } = require('../websocketHandle')
const { postToFacebook } = require('../utils/facebook')


const s3Client = new S3Client({
  region: config.AWS_REGION,
  credentials: {
  accessKeyId: config.AWS_ACCESS_KEY,
  secretAccessKey: config.AWS_SECRET_KEY,
}
});


motorsRouter.get('/', async (request, response) => {
  try {
  const motors = await Motor.find({})
    response.json(motors)
  } catch (error) {
    console.error("Error fetching motors:", error);
    next(error);
}
})

motorsRouter.get('/:id', async (request, response, next) => {
  try{
  const motor= await Motor.findById(request.params.id)
      response.json(motor)
    } catch(error) {
      response.status(404).end()
      next(error)
    }
  })

motorsRouter.get('/model/:model', async (request, response, next) => {
  const model = request.params.model;

  Motor.find({ model: new RegExp(model, 'i')})
    .then(car => {
      response.json(car);
    })
    .catch(error => next(error));
});


motorsRouter.post('/',upload.array('images',10), async(request, response, next) => {
  const body =  request.body
  const files = request.files

try {
  
  console.log("Request body:", request.body);
  console.log("Request files:", request.files);
if (!files || files.length === 0) {
  return response.status(400).json({error: 'At least one images is required'})
}

  const params = {
    Bucket: config.AWS_BUCKET_NAME,
    Key: `${Date.now()}-${files.originalname}`,
    Body: files.buffer,
    ContentType: files.mimetype,
    //ACL: 'public-read',
  };

  const imageUrls = [];

  for (const file of files) {
    const params = {
      Bucket: config.AWS_BUCKET_NAME,
      Key: `${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      
    }
  

    const command = new PutObjectCommand(params);
    await s3Client.send(command);
 
    const imageUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`
    imageUrls.push(imageUrl);
  }

  const motor = new Motor ({
    images: imageUrls,
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
    condition: body.condition,
    createdAt: body.createdAt,
    otherDescription: body.otherDescription
 })

const savedMotor= await motor.save()
 await postToFacebook(savedMotor)
  response.status(201).json(savedMotor)

}
catch(error) {
  console.log("Error in POST /api/motors:", error);
  next(error)
}
})

motorsRouter.delete('/:id', async(request, response, next) => {
  try{
    const deletedMotor = await Motor.findByIdAndDelete(request.params.id)
    if (!deletedMotor) {
      return response.status(404).json({ error: 'Motor not found' })
    }
    /*
    broadcast({
      type: 'DELETE_MOTOR',
      payload: { id: request.params.id }
    })
      */
    response.status(204).end()
  } catch(error) {
    next(error)
  }
})

motorsRouter.put('/:id', async (request, response, next) => {
  const motorToUpdate = { images,
     brand, model,
     price, year,
     madeIn, mileage,
     fuelType, transmission,
     bodyType, color,
     seats, doors,
     engineSize, status, condition,
     createdAt,
     otherDescription }
 try {
  const updatedmotor = await Motor.findByIdAndUpdate(
    request.params.id,
    motorToUpdate,
    { new: true, runValidators: true, context: 'query' })

    if (!updatedmotor) {
      return response.status(404).json({ error: 'Motor not found' })
    }

    broadcast({
      type: 'UPDATE_MOTOR',
      payload: updatedMotor,
    });
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
    motor.condition = condition 
    motor.createdAt = createdAt
    motor.otherDescription = otherDescription

      response.json(updatedmotor)
    }
catch(error){
next(error)
}
})

module.exports = motorsRouter