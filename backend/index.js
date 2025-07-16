const { server } = require('./app')
const logger = require('./utils/logger')
const config = require('./utils/config')

//app.listen(config.PORT, () => {
  server.listen(config.PORT, () => {
  logger.info(`Server running on PORT ${config.PORT}`)
})