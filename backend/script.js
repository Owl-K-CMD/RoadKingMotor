const mongoose = require ('mongoose')
const bcrypt = require ('bcrypt')
const config = require('./utils/config.js')
const AdminUser = require("./module/adminUser.js")


const createAdmin = async () => {
  try {
    // Check for required environment variables
    if (!config.MONGODB_URI) {
      console.error("❌ MONGODB_URI environment variable is not defined.")
      process.exit(1)
    }
    if (!config.ADMIN_LOGIN_NAME) {
      console.error("❌ ADMIN_LOGIN_NAME environment variable is not defined.")
      process.exit(1)
    }
    if (!config.ADMIN_LOGIN_PASSWORD) {
      console.error("❌ ADMIN_LOGIN_PASSWORD environment variable is not defined.")
      process.exit(1)
    }

    await mongoose.connect(config.MONGODB_URI, {


    })

    const name = config.ADMIN_LOGIN_NAME
    const password = config.ADMIN_LOGIN_PASSWORD

    const existing = await AdminUser.findOne({ name })
    if (existing) {
      console.log("⚠️ Admin user already exists")
        process.exit(0)
    }


    if (!password) {
      throw new Error("Admin password is not defined in the environment.");
    }

    if (typeof password !== 'string' || password.trim() === '') {
        throw new Error("Admin password cannot be empty or only whitespace.");
    }

    const passwordHash = await bcrypt.hash(password, 10);


    const admin = new AdminUser({ name, passwordHash })
    await admin.save()

    console.log("✅ Admin user created successfully.");
    console.log(`👉 Username: ${name}`);

  } catch (error) {
    console.error("❌ Error creating admin:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0)

  }
}

createAdmin()
