const bcrypt = require('bcrypt')
const adminUserRouter = require('express').Router()
const AdminUser = require('../module/adminUser')
const jwt = require('jsonwebtoken')
const config = require('../utils/config');

const adminAuth = require('../utils/adminAuth');
/*
adminUserRouter.get('/', adminAuth, async (request, response, next) => {
  try {
    const name  = request.query.name;
    let adminUser;

    if (name) {
      adminUser = await AdminUser.findOne({ name: new RegExp('^' + name.trim().replace(/\s\s+/g, ' ') + '$', 'i') });
    } else {
      // If no name is provided, you might want to return all admins or the first one.
      // For security, let's stick to finding the first one for now.
      adminUser = await AdminUser.findOne();
    }

    if (!adminUser) {
      return response.status(404).json({ error: 'Admin user not found' });
    }
    response.json(adminUser);
  } catch (error) {
    next(error);
  }
});
*/


adminUserRouter.get('/', async(request, response, next) => {
  let name = request.query.name;

  if (!name) {
    return response.status(400).json({error: 'name query parameter is required'})
  }
  try {
      const normalizedname = name.trim().replace(/\s\s+/g, ' ');
  const adminUser = await AdminUser.findOne({ name:  new RegExp('^' + normalizedname + '$', 'i')})

  if (!adminUser) {
    return response.status(404).json({error: 'User not found'})
  }
  response.json(adminUser)
  
  } 
  catch (error) {
    next(error)
  }
})

adminUserRouter.get('/support-user', async (request, response, next) => {
  const supportUser = await AdminUser.findOne({ name: 'Road King Motor Support' });
  if (!supportUser) return response.status(404).json({ error: 'Support user not found' });
  response.json({ id: supportUser.id, userName: supportUser.name });
});

adminUserRouter.post('/login', async (request, response, next) => {
 const { name, password } = request.body;
 try {
    if (!name || typeof name !== 'string') {
      return response.status(400).json({ error: 'Username is required' });
    }

    if (!password || typeof password !== 'string') {
      return response.status(400).json({ error: 'Password is required' });
    }

    const adminUser = await AdminUser.findOne({ name: name });
    if (!adminUser) {
      return response.status(401).json({ error: 'Invalid username or password' });
    }
    const passwordCorrect = await bcrypt.compare(password, adminUser.passwordHash);
    if (!passwordCorrect) {
      return response.status(401).json({ error: 'Invalid username or password' });
    }
    if (!config.SECRET_KEY) {
      console.error('LOGIN CRITICAL: SECRET_KEY is undefined or empty. Cannot sign JWT.');
      return response.status(500).json({error: 'Server configuration error: JWT secret is missing.'});
    }
    const token = jwt.sign(
      { 
        id: adminUser._id,
        name: adminUser.name,
        isAdmin: true //include admin role
      },
      config.SECRET_KEY,
      { expiresIn: '24h' }
    )


        const refreshToken = jwt.sign(
          { id: adminUser._id,
            name: adminUser.name,
            isAdmin: true
          },
          config.REFRESH_TOKEN_SECRET,
          { expiresIn: '7d'}
        );

    response.status(200).json({  
      token,
      refreshToken,
      user: {
        id: adminUser._id,
        name: adminUser.name,

      }
    })
  } catch (error) {
    next(error);
  }
})

module.exports = adminUserRouter;