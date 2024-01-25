import { Router } from 'express'
import { authHandler } from '../../middlewares/authHandler.js'
import authorizationHandler from '../../middlewares/authorizationHandler.js'
import { userRolesConstants } from '../../utils/generalSystemConstants.js'
import validationMiddleware from '../../middlewares/validationMiddleware.js'
import * as jobDataValidationSchemas from './job.dataValidationSchemas.js'
import * as jobControllers from './job.controllers.js'
import expressAsyncHandler from 'express-async-handler'
import uploadingFilesHandler from '../../middlewares/uploadingFilesHandler.js'
import allowedExtensions from '../../utils/allowedExtensions.js'

const jobRouter = Router()

jobRouter.post(
  '/addJob',
  authHandler(),
  authorizationHandler(userRolesConstants.HR),
  validationMiddleware(jobDataValidationSchemas.addJobSchema),
  expressAsyncHandler(jobControllers.addJob)
)

jobRouter.put(
  '/updateJob/:jobId',
  authHandler(),
  authorizationHandler(userRolesConstants.HR),
  validationMiddleware(jobDataValidationSchemas.updateJobSchema),
  expressAsyncHandler(jobControllers.updateJob)
)
jobRouter.delete(
  '/deleteJob/:jobId',
  authHandler(),
  authorizationHandler(userRolesConstants.HR),
  validationMiddleware(jobDataValidationSchemas.deleteJobSchema),
  expressAsyncHandler(jobControllers.deleteJob)
)
jobRouter.get(
  '/getJobsWithFullInfo',
  authHandler(),
  authorizationHandler(userRolesConstants.HR, userRolesConstants.USER),
  expressAsyncHandler(jobControllers.getJobsWithCompanies)
)
jobRouter.get(
  '/getJobsWithCompanyName',
  authHandler(),
  authorizationHandler(userRolesConstants.HR, userRolesConstants.USER),
  validationMiddleware(
    jobDataValidationSchemas.getJobsOfCompanyUsingNameSchema
  ),
  expressAsyncHandler(jobControllers.getJobsOfCompany)
)
jobRouter.get(
  '/getJobsWithFilter',
  authHandler(),
  authorizationHandler(userRolesConstants.HR, userRolesConstants.USER),
  validationMiddleware(jobDataValidationSchemas.getJobsWithFilterSchema),
  expressAsyncHandler(jobControllers.getJobsWithFilter)
)

jobRouter.post(
  '/applyJob/:jobId',
  authHandler(),
  authorizationHandler(userRolesConstants.USER),
  uploadingFilesHandler({ extensions: allowedExtensions.document }).single(
    'userResume'
  ),
  validationMiddleware(jobDataValidationSchemas.applyToJobSchema),
  expressAsyncHandler(jobControllers.applyToJob)
)

export default jobRouter
