const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../module/user')

usersRouter.get('/', async(request, response) => {
  const users = await User.find({})
  response.json(users)
})

usersRouter.get('/:id', async(request, response) => {
  const user = await User.findById(request.params.id)
  response.json(user)
})

usersRouter.post('/', async(request, response) => {
  const { username, name, phonenumber, password } = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    phonenumber,
    passwordHash
  })

  const savedUser = await user.save()
  response.json(savedUser)
})

module.exports = usersRouter