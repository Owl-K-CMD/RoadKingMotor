const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../module/user')
const jwt = require('jsonwebtoken')
const config = require('../utils/config');
const crypto = require('crypto');
const adminAuth = require('../utils/adminAuth');



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
  const isAdmin = request.body.isAdmin || false;
  
  const user = new User({
    userName: userName.trim(),
    name,
    email,
    phoneNumber,
    passwordHash,
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
      phoneNumber: savedUser.phoneNumber,
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

usersRouter.post('/admin', adminAuth, async (request, response, next) => {
    const { userName, name, email, phoneNumber, password } = request.body;

    try {
        // Basic validations (you can add more)
        if (!userName || !name || !email || !phoneNumber || !password) {
            return response.status(400).json({ error: 'All fields are required' });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const adminUser = new User({
            userName: userName.trim(),
            name,
            email,
            phoneNumber,
            passwordHash,
            isAdmin: true // <--- IMPORTANT:  Always set to true for this route
        });

        const savedAdmin = await adminUser.save();

        response.status(201).json({
            message: 'Admin user created successfully',
            user: savedAdmin
        });

    } catch (error) {
        next(error);
    }
});

usersRouter.post('/guest', async (request, response, next) => {
  try {
    // Generate a unique guest username
    const guestUserName = "Guest_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

    // Create user document (minimal fields)
    const guestUser = new User({
      userName: guestUserName,
      name: "Guest User",
      isGuest: true,   // <-- new field in schema (boolean)
    });

    const savedGuest = await guestUser.save();

    const userForToken = {
      id: savedGuest._id,
      userName: savedGuest.userName,
      guest: true
    };

    const token = jwt.sign(userForToken, config.SECRET_KEY, { expiresIn: '1h' });
    const refreshToken = jwt.sign(userForToken, config.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    response.status(201).json({
      message: 'Guest login successful',
      token,
      refreshToken,
      user: {
        id: savedGuest._id,
        userName: savedGuest.userName,
        name: savedGuest.name,
        isGuest: true
      }
    });
  } catch (error) {
    next(error);
  }
});


usersRouter.post('/login', async(request, response, next) => {
  const { userName, password } = request.body;
  console.log(`LOGIN ATTEMPT: User "${userName}"`)

  try{
    if (!userName || typeof userName !== 'string'){
      console.log('LOGIN FAIL: Username missing');
      return response.status(400).json({error: 'Username is required'})
    }

    if (!password || typeof password !== 'string') {
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

        const isAdminPanelLogin = request.body.isAdminPanel === true;

            if (isAdminPanelLogin && !user.isAdmin) {
                return response.status(403).json({ error: 'Unauthorized: Admin access required' });
            }
    
    const userForToken = {
      id: user._id,
      userName: user.userName
    }

    console.log('Debug: SECRET_KEY for JWT:', config.SECRET_KEY);
    console.log('Debug: Type of SECRET_KEY:', typeof config.SECRET_KEY);

    if (typeof config.SECRET_KEY !== 'string' || !config.SECRET_KEY) {
      console.error('LOGIN CRITICAL: SECRET_KEY is undefined or empty. Cannot sign JWT.');
      return response.status(500).json({error: 'Server configuration error: JWT secret is missing.'});
    }

    if (typeof config.REFRESH_TOKEN_SECRET !== 'string' || !config.REFRESH_TOKEN_SECRET) {
      console.error('LOGIN CRITICAL: REFRESH_TOKEN_SECRET is undefined or empty. Cannot sign JWT.');

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
        phoneNumber: user.phoneNumber,
        isAdmin: user.isAdmin

      }
    })
  } catch (error) {
    console.error('DEBUG: Error in /login route catch block:', error)
    console.error('LOGIN ERROR: Error in /login route catch block:', error.message, error.stack)
    next(error)
  }
})


usersRouter.post('/refreshToken', async (request, response) => {
  const refreshToken = request.body.refreshToken;
  
  if (!refreshToken) {
    return response.status(401).json({ message: 'Refresh token is required'})
  }

  try {
    const decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);

    const newAccessToken = jwt.sign(
      { id: decoded.id, userName: decoded.userName },
      config.SECRET_KEY,
      { expiresIn: '15m'}
    );
    

    const newRefreshToken = jwt.sign(
      { id: decoded.id, userName: decoded.userName },
      config.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d'}
    )
    response.json({ token: newAccessToken, refreshToken: newRefreshToken})
  } catch (error) {
    console.error('Error refreshing token:', error);
   return response.status(403).json({ message: 'Invalid refresh token'})
  }
})

usersRouter.post('/forgotPassword', async (request, response,next) => {
  const { identifier } = request.body;

  try{
    if (!identifier || typeof identifier !== 'string' || identifier.trim() ==='') {
      console.log('Forgot password attempt for identifier');
      return response.status(400).json({ message: 'Username or email is required.'})

    }

    const trimmedIdentifier = identifier.trim();

    const user = await User.findOne({
      $or: [
        { userName: new RegExp('^' + trimmedIdentifier + '$', 'i')},
        { email: new RegExp('^' + trimmedIdentifier + '$', 'i')}
      ]
    })

    if (!user) {
      console.log(`Forgot password attemp for non-existent identifier: ${identifier}`)
      return response.status(404).json({ message: 'If an account with  that email exists, a password reset link has been sent.'})
    }
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173'

    if (!process.env.FRONTEND_URL) {
      console.log('WARN: FRONTEND_URL environment variable not set. Using default http://localhost:5173');
    }

    const resetURL = `${frontendURL}/reset-password/${token}`
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

usersRouter.post('/resetPassword/:token', async (request, response, next) => {
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