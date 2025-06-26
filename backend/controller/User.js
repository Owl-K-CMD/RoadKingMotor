const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../module/user')
const jwt = require('jsonwebtoken')
const config = require('../utils/config');
const crypto = require('crypto');
//const { error } = require('console');


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
  const { userName, name, email, phoneNumber, password } = request.body

  try{
    if (!userName) {
    return response.status(400).json({error: 'Username is required'})
  }

  if(!name) {
    return response.status(400).json({error: 'Name is required'})
  }

  if(!email) {
    return response.status(400).json({error: 'Email is required'})
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
    userName: userName.trim(),
    name,
    email,
    phoneNumber,
    passwordHash
  })

  const savedUser = await user.save()

  if (!config.SECRET_KEY) {
    console.error('REGISTRATION CRITICAL: SECRET_KEY is undefined or empty. Cannot sign JWT.');
    throw new Error('SECRET_KEY is not configured properly.')
  }

  if (!config.REFRESH_TOKEN_SECRET) {
    console.error('REGISTRATION CRITICAL: REFRESH_TOKEN_SECRET is undefined or empty. Cannot sign JWT.')
    throw new Error('REFRESH_TOKEN_SECRET is not configured properly.')
  }

  const userForToken = {
    id: savedUser._id,
    userName: savedUser.userName,
  };

  const token = jwt.sign(userForToken,
     config.SECRET_KEY,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      userForToken,
      config.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d'}
    );

  response.status(201).json({
    message: 'Registration successful, loggging you in...',
    token,
    refreshToken,
    user: {
      id: savedUser._id,
      userName: savedUser.userName,
      name: savedUser.name,
      email: savedUser.email,
      phoneNumber: savedUser.phoneNumber
    },
  });
  }
  catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.userName) {
      return response.status(409).json({ error: 'Username already exists. Please choose a different one.' });
    } else if(error.name === 'ValidationError'){
     return response.status(400).json({ error: error.message });
    }
    next(error)
  }
})

usersRouter.post('/login', async(request, response, next) => {
  const { userName, password } = request.body;
  console.log(`LOGIN ATTEMPT: User "${userName}"`)

  try{
    if (!userName){
      console.log('LOGIN FAIL: Username missing');
      return response.status(400).json({error: 'Username is required'})
    }

    if (!password) {
      console.log('LOGIN FAIL: password missing');
      return response.status(400).json({error: 'Password is required'})
    }
    const normalizedUserName = userName.trim().replace(/\s\s+/g, ' ');
    const user = await User.findOne({ userName: new RegExp('^' + normalizedUserName + '$', 'i') });
    console.log('LOGIN DEBUG: User fetched from DB:', user ? { id: user._id, userName: user.userName, hasPasswordHash: !!user.passwordHash } : null);

    if (!user) {
      console.log(`LOGIN FAIL: User "${normalizedUserName}" not found.`);
      return response.status(401).json({ error: 'Invalid username or password' });
    }

    if (!user.passwordHash) {
      console.error(`LOGIN CRiTICAL: User "${normalizedUserName}" (ID: ${user._id}) has no password hash.)`)
      return response.status(500).json({ error: 'Server error: User account is not configured correctly.'})
    }
    const passwordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!passwordCorrect) {
      console.log(`LOGIN FAIL: Password incorrect for user "${normalizedUserName}".`);
      return response.status(401).json({ error: 'Invalid username or password' });
    }
    
    const userForToken = {
      id: user._id,
      userName: user.userName
    }

    console.log('Debug: SECRET_KEY for JWT:', config.SECRET_KEY);
    console.log('Debug: Type of SECRET_KEY:', typeof config.SECRET_KEY);

    if (!config.SECRET_KEY) {
      console.error('LOGIN CRITICAL: SECRET_KEY is undefined or empty. Cannot sign JWT.');
      //throw new Error('SECRET_KEY is not configured properly.')
      return response.status(500).json({error: 'Server configuration error: JWT secret is missing.'});
    }

    if (!config.REFRESH_TOKEN_SECRET) {
      console.error('LOGIN CRITICAL: REFRESH_TOKEN_SECRET is undefined or empty. Cannot sign JWT.');
      //throw new Error('REFRESH_TOKEN_SECRET is not configured properly.')
      return response.status(500).json({error: 'Server configuration error: JWT secret is missing.'});
    }
    const token = jwt.sign(
      userForToken,
      config.SECRET_KEY,
      { expiresIn: '1h'}
    )
    
    const refreshToken = jwt.sign(
      userForToken,
      config.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d'}
    )

    response.status(200).json({
      message: 'Login successful.',
      token,
      refreshToken,
           user: {
        id: user._id,
        userName: user.userName,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber

      }
    })
  } catch (error) {
    console.error('DEBUG: Error in /login route catch block:', error)
    console.error('LOGIN ERROR: Error in /login route catch block:', error.message, error.stack)
    next(error)
  }
})

usersRouter.post('/forget-password', async (request, response,next) => {
  const { email } = request.body;

  try{
    const user = await User.findOne({ userName: email });

    if (!user) {
      console.log(`Forgot password attempt for non-existent user/email: ${email}`);
      return response.status(404).json({ message: 'If an account with that email exists, a password reset link has been sent .'})

    }   
    
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const resetURL = `http://localhost:5173/reset-password/${token}`
    console.log('---PASSWORD RESET ---');
    console.log(`User: ${user.userName}`);
    console.log(`Reset Token: ${resetURL}`);
    console.log('---Send this URL to the user via  email ---');

    response.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.'})

  } catch (error) {
      console.error('FORGOT PASSWORD ERROR:', error);
      next(error);
    }
})

usersRouter.post('/reset-password/:token', async (request, response, next) => {
  const { token } = request.params;
  const { password } = request.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
      return response.status(400).json({error: 'Password reset token is invalid or has expaired'})
    }

    if (!password || typeof password !== 'string' || password.length < 3) {
      return response.status(400).json({ error: 'Passwordmust be at least 3 characters long.'})
    }

    const saltRounds = 10;
    user.passwordHash = await bcrypt.hash(password, saltRounds);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    response.status(200).json({ message: 'Password has been successfully reset.'})
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