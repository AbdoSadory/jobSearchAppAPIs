import { Router } from 'express'
import { authHandler } from '../../middlewares/authHandler.js'
import authorizationHandler from '../../middlewares/authorizationHandler.js'
import { userRolesConstants } from '../../utils/generalSystemConstants.js'
import validationMiddleware from '../../middlewares/validationMiddleware.js'
import * as companyDataValidationSchemas from './company.dataValidationSchemas.js'
import * as companyControllers from './company.controllers.js'
import expressAsyncHandler from 'express-async-handler'
import uploadingFilesHandler from '../../middlewares/uploadingFilesHandler.js'
import allowedExtensions from '../../utils/allowedExtensions.js'

const companyRouter = Router()

companyRouter.post(
  '/createCompany',
  authHandler(),
  authorizationHandler(userRolesConstants.HR),
  validationMiddleware(companyDataValidationSchemas.createCompanySchema),
  expressAsyncHandler(companyControllers.createCompany)
)
companyRouter.put(
  '/updateCompany',
  authHandler(),
  authorizationHandler(userRolesConstants.HR),
  validationMiddleware(companyDataValidationSchemas.updateCompanySchema),
  expressAsyncHandler(companyControllers.updateCompany)
)
companyRouter.delete(
  '/deleteCompany',
  authHandler(),
  authorizationHandler(userRolesConstants.HR),
  validationMiddleware(companyDataValidationSchemas.deleteCompanySchema),
  expressAsyncHandler(companyControllers.deleteCompany)
)
companyRouter.get(
  '/companyDetails/:companyId',
  authHandler(),
  authorizationHandler(userRolesConstants.HR),
  validationMiddleware(companyDataValidationSchemas.getCompanyUsingIdSchema),
  expressAsyncHandler(companyControllers.getCompany)
)
companyRouter.get(
  '/searchByName',
  authHandler(),
  authorizationHandler(userRolesConstants.HR, userRolesConstants.USER),
  validationMiddleware(
    companyDataValidationSchemas.searchCompanyUsingNameSchema
  ),
  expressAsyncHandler(companyControllers.searchCompanyUsingName)
)
companyRouter.get(
  '/companyJobsApplications/:companyId',
  authHandler(),
  authorizationHandler(userRolesConstants.HR),
  validationMiddleware(companyDataValidationSchemas.getCompanyUsingIdSchema),
  expressAsyncHandler(companyControllers.getCompanyJobsApplications)
)

companyRouter.put(
  '/updateProfileImage/:companyId',
  authHandler(),
  authorizationHandler(userRolesConstants.HR),
  uploadingFilesHandler({ extensions: allowedExtensions.image }).single(
    'profileImage'
  ),
  validationMiddleware(
    companyDataValidationSchemas.updateCompanyProfileImageUsingIdSchema
  ),
  expressAsyncHandler(companyControllers.updateProfileImage)
)

export default companyRouter
