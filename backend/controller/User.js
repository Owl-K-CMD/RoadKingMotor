const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../module/user')

usersRouter.get('/', async(request, response, next) => {
  try {
  const users = await User.find({})
  response.json(users)
  }
  catch (error) {
    next(error)
  }
})

usersRouter.get('/:id', async(request, response, next) => {
  
  try {
  const user = await User.findById(request.params.id)
  if (user) {
    response.json(user)
    return;
  } else {
    response.status(404).json({error: 'User not found'})
    return;
  }
  response.json(user)
  }
  catch (error) {
    next(error)
  }
})

usersRouter.post('/', async(request, response) => {
  const { userName, name, phoneNumber, password } = request.body

  //try{
    if (!userName || !name || !phoneNumber) {
    return response.status(400).json({error: 'Username is required'})
  }

  if (!password || typeof password !== 'string') {
    return response.status(400).json({error: 'Password is required'})
  }



  const saltRounds = 10

  const passwordHash = await bcrypt.hash(password, saltRounds)

  
  const user = new User({
    userName,
    name,
    phoneNumber,
    passwordHash
  })

  const savedUser = await user.save()
  response.status(201).json(savedUser)
  //}
  //catch (error) {
    //next(error)
  //}
})

usersRouter.delete('/:id', async(request, response, next) => {
  await User.findByIdAndDelete(request.params.id)
  .then(() => {
    response.status(204).end()
  })
  .catch(error => next(error))
  })

module.exports = usersRouter