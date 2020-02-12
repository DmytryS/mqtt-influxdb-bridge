import Bridge from './bridge.js'
import { logger } from './lib/index.js'

const bridge = new Bridge()

bridge.connect()

process.on('uncaughtException', (err) => {
  logger.error('Unhandled exception', err)
})
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection', err)
})
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, going to shutdown bridge.')
  await bridge.disconnect()
  logger.info('Exited... Buy :)')
})
