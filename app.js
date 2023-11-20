import { telegramInit } from './src/bots/telegram/index.js'
import { whatsappInit } from './src/bots/whatsapp/index.js'
import connectDB from './src/config/db.js'
import Log from './src/utils/logger.js'

import './src/tasks/verifyPackages.js'

( async () => {
    Log.process('System initializing...')

    Log.process('Initializing database...')
    await connectDB()

    Log.process('Initializing bots...')

    await telegramInit()
    await whatsappInit()
})()