const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../module/user')
const jwt = require('jsonwebtoken')
const config = require('../utils/config');

usersRouter.get('/', async(request, response, next) => {
  let userName = request.query.userName;

  if (!userName) {
    return response.status(400).json({error: 'UserName query parameter is required'})
  }
  try {
      const normalizedUserName = userName.trim().replace(/\s\s+/g, ' ');
  const user = await User.findOne({ userName:  new RegExp('^' + normalizedUserName + '$', 'i')})

  if (!user) {
    return response.status(404).json({error: 'User not found'})
  }
  response.json(user)
  
  } 
  catch (error) {
    next(error)
  }
})

usersRouter.post('/', async(request, response, next) => {
  const { userName, name, phoneNumber, password } = request.body

  try{
    if (!userName) {
    return response.status(400).json({error: 'Username is required'})
  }

  if(!name) {
    return response.status(400).json({error: 'Name is required'})
  }

if(!phoneNumber) {
    return response.status(400).json({error: 'Phone number is required'})
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
  }
  catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.userName) {
      return response.status(409).json({ error: 'Username already exists. Please choose a different one.' });
    }
    next(error)
  }
})

usersRouter.post('/login', async(request, response, next) => {
  const { userName, password } = request.body;

  try{
    if (!userName){
      return response.status(400).json({error: 'Username is required'})
    }

    if (!password) {
      return response.status(400).json({error: 'Password is required'})
    }
    const normalizedUserName = userName.trim().replace(/\s\s+/g, ' ');
    const user = await User.findOne({ userName: new RegExp('^' + normalizedUserName + '$', 'i') });

    if (!user) {
      return response.status(401).json({ error: 'Invalid username or password' });
    }
    const passwordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!passwordCorrect) {
      return response.status(401).json({ error: 'Invalid username or password' });
    }
    
    const userForToken = {
      id: user._id,
      userName: user.userName
    }

    const token = jwt.sign(
      userForToken,
      config.SECRET_KEY,
      { expiresIn: '1h'}
    )
    
    response.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        userName: user.userName,
        name: user.name,
        phoneNumber: user.phoneNumber
      }
    })
  } catch (error) {
    next(error)
  }
})

usersRouter.delete('/:id', async(request, response, next) => {
  await User.findByIdAndDelete(request.params.id)
  .then(() => {
    response.status(204).end()
  })
  .catch(error => next(error))
  })

module.exports = usersRouter