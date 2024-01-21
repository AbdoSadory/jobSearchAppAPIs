import { config } from 'dotenv'
import express from 'express'
import db_connection from './DB/connection.js'
import globalErrorHandler from './src/middlewares/globalErrorHandler.js'
import cloudinaryConnection from './src/utils/mediaHostConnection.js'
import userRouter from './src/modules/user/user.routes.js'

config()
const app = express()
app.use(express.json())
db_connection()
cloudinaryConnection()

app.use('/users', userRouter)

app.use('*', (req, res, next) => {
  next(new Error('Invalid URL'))
})
app.use(globalErrorHandler)
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT} 🔥🔥🔥`)
})
