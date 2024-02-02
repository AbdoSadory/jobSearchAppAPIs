import { config } from 'dotenv'
import express from 'express'
import db_connection from './DB/connection.js'
import globalErrorHandler from './src/middlewares/globalErrorHandler.js'
import cloudinaryConnection from './src/utils/mediaHostConnection.js'
import userRouter from './src/modules/user/user.routes.js'
import companyRouter from './src/modules/company/company.routes.js'
import jobRouter from './src/modules/job/job.routes.js'

config()
const app = express()
app.use(express.json())
db_connection()
cloudinaryConnection()

app.get('/', (req, res, next) => {
  res.status(200).json({ message: 'Welcome To Job Search App' })
})
app.use('/users', userRouter)
app.use('/company', companyRouter)
app.use('/jobs', jobRouter)

app.use('*', (req, res, next) => {
  next(new Error('Invalid URL'))
})
app.use(globalErrorHandler)
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT} 🔥🔥🔥`)
})
