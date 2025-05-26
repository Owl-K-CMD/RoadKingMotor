
const motorsRouter = require('express').Router()
const { default: cars } = require('../../frontend/src/cars')
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
  const name = request.query.name

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
    //image: s3Result.Location,
    image: imageUrl,
    name : body.name,
    price : body.price,
    currency : body.currency,
    dateOfRelease : body.dateOfRelease,
    description: body.description
  })

const savedMotor= await motor.save()
  response.status(201).json(savedMotor)

}
catch(error) {
  console.log("Error in POST /api/motors:", error);
  next(error)
}

})

motorsRouter.delete('/:id', (request, response, next) => {
  Motor.findByIdAndDelete(request.params.id)
  then(() => {
    response.status(204).end()
  })
  .catch(error => next(error))
})
motorsRouter.put('/:id', (request, response,next) => {
  const {image, name, price, currency, dateOfRelease, description} = request.body

  Motor.findById(request.params.id).then(motor => {
    if (!motor) {
      return response.status(404).end()
    }
    motor.image = image
    motor.name = name
    motor.price = price
    motor.currency = currency
    motor.dateOfRelease = dateOfRelease
    motor.description = description



    return motor.save().then(updatedmotor => {
      response.json(updatedmotor)
    })
})
.catch(error => next(error))
})


module.exports = motorsRouter