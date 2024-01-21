import { Router } from 'express'
import validationMiddleware from '../../middlewares/validationMiddleware.js'
import * as userDataValidationSchemas from './user.dataValidationSchemas.js'
import * as userControllers from './user.controllers.js'
import expressAsyncHandler from 'express-async-handler'
import { authHandler } from '../../middlewares/authHandler.js'
import uploadingFilesHandler from '../../middlewares/uploadingFilesHandler.js'
import allowedExtensions from '../../utils/allowedExtensions.js'

const userRouter = Router()

userRouter.post(
  '/signUp',
  validationMiddleware(userDataValidationSchemas.signUpSchema),
  expressAsyncHandler(userControllers.signUp)
)

userRouter.post(
  '/signIn',
  validationMiddleware(userDataValidationSchemas.signInSchema),
  expressAsyncHandler(userControllers.signIn)
)

userRouter.put(
  '/updateProfile',
  authHandler(),
  validationMiddleware(userDataValidationSchemas.updateUserDataSchema),
  expressAsyncHandler(userControllers.updateProfile)
)

userRouter.delete(
  '/deleteProfile',
  authHandler(),
  expressAsyncHandler(userControllers.deleteProfile)
)
userRouter.get(
  '/myProfile',
  authHandler(),
  expressAsyncHandler(userControllers.getPrivateProfile)
)
userRouter.get(
  '/userProfile/:userId',
  authHandler(),
  validationMiddleware(userDataValidationSchemas.getUserProfile),
  expressAsyncHandler(userControllers.getPublicProfile)
)

userRouter.put(
  '/updatePassword',
  authHandler(),
  validationMiddleware(userDataValidationSchemas.updatePasswordSchema),
  expressAsyncHandler(userControllers.updatePassword)
)

userRouter.post(
  '/forgetPassword',
  validationMiddleware(userDataValidationSchemas.forgetPasswordSchema),
  expressAsyncHandler(userControllers.forgetPassword)
)
userRouter.post(
  '/verifyOTPAndUpdatePassword',
  validationMiddleware(
    userDataValidationSchemas.verifyOTPandUpdatePasswordSchema
  ),
  expressAsyncHandler(userControllers.getOTPandNewPassword)
)
userRouter.get(
  '/allAccountsWithRecoveryEmail',
  validationMiddleware(
    userDataValidationSchemas.allAccountsWithRecoveryEmailSchema
  ),
  expressAsyncHandler(userControllers.getAllAccountsWithRecoveryEmail)
)

userRouter.put(
  '/updateProfileImage',
  authHandler(),
  uploadingFilesHandler({ extensions: allowedExtensions.image }).single(
    'profileImage'
  ),
  expressAsyncHandler(userControllers.updateProfileImage)
)
export default userRouter
