require('dotenv').config()

const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI

const AWS_ACCESS_KEY=  process.env.AWS_ACCESS_KEY
const AWS_SECRET_KEY=process.env.AWS_SECRET_KEY
const AWS_REGION=process.env.AWS_REGION
const AWS_BUCKET_NAME=process.env.AWS_BUCKET_NAME 

module.exports = { 
   PORT, 
   MONGODB_URI,
   AWS_BUCKET_NAME,
   AWS_ACCESS_KEY, 
   AWS_SECRET_KEY, 
   AWS_REGION
   }