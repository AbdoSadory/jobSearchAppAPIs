import moment from 'moment'
import * as dbMethods from '../../../DB/dbMethods.js'
import User from '../../../DB/models/user.model.js'
import bcryptjs from 'bcryptjs'
import generateUserToken from '../../utils/generateUserToken.js'
import OTP from '../../../DB/models/OTP.model.js'
import generateUniqueString from '../../utils/generateUniqueString.js'
import cloudinaryConnection from '../../utils/mediaHostConnection.js'
export const signUp = async (req, res, next) => {
  /**
   * 1- Check Email if it is existed
   * 2- Check Mobil Number if it is existed
   * 3- Create username
   * 4- Hashing Password
   * 5- Create New User
   */
  const {
    firstName,
    lastName,
    email,
    recoveryEmail,
    password,
    DOB,
    mobileNumber,
    role,
  } = req.body

  const isEmailExisted = await dbMethods.findOneDocument(User, { email })
  if (isEmailExisted.success) {
    return next(new Error('this Email is already existed', { cause: 400 }))
  }
  const isMobileNumberExisted = await dbMethods.findOneDocument(User, {
    mobileNumber,
  })
  if (isMobileNumberExisted.success) {
    return next(
      new Error('this mobile number is already existed', { cause: 400 })
    )
  }

  const username = `${firstName.toLowerCase().trim()} ${lastName
    .toLowerCase()
    .trim()}`

  const hashedPassword = bcryptjs.hashSync(
    password.trim(),
    parseInt(process.env.SALT)
  )
  const newUser = await dbMethods.createDocument(User, {
    firstName,
    lastName,
    username,
    email,
    recoveryEmail,
    password: hashedPassword,
    DOB: moment(DOB).format('YYYY-MM-DD'),
    mobileNumber,
    role,
  })

  if (!newUser.success) {
    return next(new Error(newUser.message, { cause: newUser.status }))
  }

  res.status(newUser.status).json({
    message: 'User has been created successfully',
    user: newUser.result,
  })
}

export const signIn = async (req, res, next) => {
  /*
  1- Check on Incoming Data
  2- Find User with email  or mobile number
  3- Check if incoming password doesn't match the Database hashed password
  4- Create Token
  5- Send token and profile data in response
  */

  const { email, mobileNumber, password } = req.body
  let user
  if (email) {
    user = await dbMethods.findOneDocument(User, { email })
    if (!user.success) {
      return next(new Error('Invalid Credentials', { cause: 400 }))
    }
  }
  if (mobileNumber && !user) {
    user = await dbMethods.findOneDocument(User, { mobileNumber })
    if (!user.success) {
      return next(new Error('Invalid Credentials', { cause: 400 }))
    }
  }

  const isPasswordMatched = bcryptjs.compareSync(password, user.result.password)
  if (!isPasswordMatched) {
    return next(
      new Error('Invalid Credentials pw', {
        cause: 401,
      })
    )
  }
  user.result.status = 'online'
  await user.result.save()
  const token = generateUserToken({ id: user.result._id.toString() })
  res
    .status(user.status)
    .json({ message: user.message, user: user.result, token })
}

export const updateProfile = async (req, res, next) => {
  /**
   * check Email if it's existed for another user
   * check mobile Number if it's  existed for another user
   * Get the user by id
   * update values if they're sent
   * if Email is sent, check if it's not equal recovery email, to get account back
   * if Recovery Email is sent, check if it's not equal email, to get account back
   */
  const { firstName, lastName, email, DOB, mobileNumber, recoveryEmail } =
    req.body
  const { authUser } = req
  if (email) {
    const isUserExisted = await dbMethods.findOneDocument(User, { email })
    if (
      isUserExisted.success &&
      isUserExisted.result._id.toString() !== authUser._id.toString()
    ) {
      return next(
        new Error('This Email is used by another user, try another one', {
          cause: 400,
        })
      )
    }
  }
  if (mobileNumber) {
    const isMobileNumberExisted = await dbMethods.findOneDocument(User, {
      mobileNumber,
    })
    if (
      isMobileNumberExisted.success &&
      isMobileNumberExisted.result._id.toString() !== authUser._id.toString()
    ) {
      return next(
        new Error(
          'This mobile number is used by another user, try another one',
          {
            cause: 400,
          }
        )
      )
    }
  }

  const user = await dbMethods.findByIdDocument(User, authUser._id)
  firstName && (user.result.firstName = firstName.trim())
  lastName && (user.result.lastName = lastName.trim())
  user.result.username = `${user.result.firstName} ${user.result.lastName}`
  if (email) {
    if (email !== user.result.recoveryEmail) {
      user.result.email = email
    } else {
      return next(
        new Error(
          'email should not be equal recovery email to be able to get back your account',
          { cause: 400 }
        )
      )
    }
  }
  DOB && (user.result.DOB = DOB)

  mobileNumber && (user.result.mobileNumber = mobileNumber)

  if (recoveryEmail) {
    if (recoveryEmail !== user.result.email) {
      user.result.recoveryEmail = recoveryEmail
    } else {
      return next(
        new Error(
          'Recovery email should not be equal email to be able to get back your account',
          { cause: 400 }
        )
      )
    }
  }
  user.result.__v++

  await user.result.save()

  res.status(200).json({
    message: 'Profile data has been updated successfully',
    user: user.result,
  })
}

export const deleteProfile = async (req, res, next) => {
  const { authUser } = req
  const deleteUser = await dbMethods.findByIdAndDeleteDocument(
    User,
    authUser._id
  )

  if (!deleteUser.success) {
    return next(new Error('Error while deleting User'))
  }

  res.status(200).json({ message: 'User has been deleted successfully' })
}

export const getPrivateProfile = async (req, res, next) => {
  /**
   * Private profile for the owner of the account
   */
  const { authUser } = req
  const getUser = await dbMethods.findByIdDocument(User, authUser._id)

  if (!getUser.success) {
    return next(new Error(getUser.message, { cause: getUser.status }))
  }

  res.status(200).json({ message: 'User', user: getUser.result })
}

export const getPublicProfile = async (req, res, next) => {
  /**
   * public profile is used to share account across other users
   */
  const { userId } = req.params
  const getUser = await dbMethods.findByIdDocument(User, userId)

  if (!getUser.success) {
    return next(new Error(getUser.message, { cause: getUser.status }))
  }

  res.status(200).json({ message: 'User', user: getUser.result })
}
export const updatePassword = async (req, res, next) => {
  /**
   * check if user is still existed in DB
   * check if oldPassword equals the user password which came from DB
   * hashing the new password
   * update it 🔥
   */

  const { authUser } = req
  const { oldPassword, newPassword } = req.body
  const isUserExisted = await dbMethods.findByIdDocument(User, authUser._id)

  if (!isUserExisted.success) {
    return next(
      new Error(isUserExisted.message, { cause: isUserExisted.status })
    )
  }

  const isOldPasswordMatchUserPassword = bcryptjs.compareSync(
    oldPassword,
    isUserExisted.result.password
  )
  if (!isOldPasswordMatchUserPassword) {
    return next(
      new Error("Old password isn't match the user password", { cause: 401 })
    )
  }

  const hashingNewPassword = bcryptjs.hashSync(
    newPassword,
    parseInt(process.env.SALT)
  )

  isUserExisted.result.password = hashingNewPassword
  await isUserExisted.result.save()

  res
    .status(200)
    .json({ message: 'User has been updated', user: isUserExisted.result })
}
export const forgetPassword = async (req, res, next) => {
  /**
   * Check if user in DB using email
   * create unique random otp (length=6)
   * Hashing the otp
   * check if user gets otp doc in db, if TRUE, update it with new hashed OTP
   * in case it's first time to forget password , create OTP document with email and hashed OTP code
   * send it back to user and wait him to send it back through api "users/verifyOTPAndUpdatePassword"
   */
  const { email } = req.body
  const isUserExisted = await dbMethods.findOneDocument(User, { email })

  if (!isUserExisted.success) {
    return next(
      new Error(isUserExisted.message, { cause: isUserExisted.status })
    )
  }
  const otp = generateUniqueString(6)
  const hashedOTP = bcryptjs.hashSync(otp, parseInt(process.env.SALT))

  const isOTPDocExisted = await dbMethods.findOneDocument(OTP, { email })

  if (isOTPDocExisted.success) {
    isOTPDocExisted.result.otp = hashedOTP
    await isOTPDocExisted.result.save()
    return res.status(isOTPDocExisted.status).json({
      message: "Please send OTP to 'users/verifyOTPAndUpdatePassword'",
      OTP: otp,
    })
  }
  const newOTP = await dbMethods.createDocument(OTP, { email, otp: hashedOTP })
  if (!newOTP.success) {
    return next(new Error('Error while creating OTP, please try again'))
  }
  res.status(newOTP.status).json({
    message: "Please send OTP to 'users/verifyOTPAndUpdatePassword'",
    OTP: otp,
  })
}
export const getOTPandNewPassword = async (req, res, next) => {
  /**
   * Verify the Email user if it's existed in OTP collection
   * check the OTP if it's not used before
   * compare OTP for authentication case
   * hashing the new password
   * Get the user and update password with the new one
   * send back the user data
   */
  const { otp, email, newPassword } = req.body
  const isEmailExistedOTP = await dbMethods.findOneDocument(OTP, { email })
  if (!isEmailExistedOTP.success) {
    return next(new Error('Invalid Email, Please try again', { cause: 401 }))
  }
  if (isEmailExistedOTP.result.isUsed) {
    return next(
      new Error('This OTP has been used before, Please try again', {
        cause: 401,
      })
    )
  }

  const isOTPRight = bcryptjs.compareSync(otp, isEmailExistedOTP.result.otp)
  if (!isOTPRight)
    return next(
      new Error('Invalid OTP, Please try again', {
        cause: 401,
      })
    )
  const hashingNewPassword = bcryptjs.hashSync(
    newPassword,
    parseInt(process.env.SALT)
  )
  const getUser = await dbMethods.findOneDocument(User, {
    email,
  })
  if (!getUser.success) return next(new Error('No User with this Email'))

  getUser.result.password = hashingNewPassword
  await getUser.result.save()
  isEmailExistedOTP.result.isUsed = true
  await isEmailExistedOTP.result.save()

  res
    .status(200)
    .json({ message: 'Updated password successfully', user: getUser.result })
}

export const getAllAccountsWithRecoveryEmail = async (req, res, next) => {
  /**
   * get the recovery mail from body and find all doc
   */
  const { recoveryEmail } = req.body
  const users = await dbMethods.findDocuments(User, { recoveryEmail })

  if (!users.success) {
    return next(new Error(users.message, { cause: users.status }))
  }

  res.status(200).json({
    message: 'User',
    user: users.result ? users.result : 'No Users with this recovery email',
  })
}

export const updateProfileImage = async (req, res, next) => {
  const { authUser } = req
  const user = await dbMethods.findByIdDocument(User, authUser._id)
  if (!user.success)
    return next(new Error('No User with this id', { cause: 400 }))

  const uploadedProfileImage = await cloudinaryConnection().uploader.upload(
    req.file.path,
    {
      folder: `jobSearchApp/users/${user.result._id}`,
      public_id: 'profileImage',
    }
  )
  if (!uploadedProfileImage)
    return next(
      new Error('Error while uploading the profile Image, please try again')
    )

  user.result.profileImage.secure_url = uploadedProfileImage.secure_url
  user.result.profileImage.public_id = uploadedProfileImage.public_id
  await user.result.save()

  res
    .status(200)
    .json({ message: 'Profile has been updated', user: user.result })
}
