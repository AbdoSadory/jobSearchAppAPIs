import moment from 'moment'
import * as dbMethods from '../../../DB/dbMethods.js'
import User from '../../../DB/models/user.model.js'
import bcryptjs from 'bcryptjs'
import generateUserToken from '../../utils/generateUserToken.js'
import OTP from '../../../DB/models/OTP.model.js'
import generateUniqueString from '../../utils/generateUniqueString.js'
import cloudinaryConnection from '../../utils/mediaHostConnection.js'
import jwt from 'jsonwebtoken'
/**
 * 1- Check Email if it is existed
 * 2- Check Mobil Number if it is existed
 * 3- Create username
 * 4- Hashing Password
 * 5- Create New User
 */
export const signUp = async (req, res, next) => {
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
  // 1- Check Email if it is existed
  const isEmailExisted = await dbMethods.findOneDocument(User, { email })
  if (isEmailExisted.success) {
    return next(new Error('this Email is already existed', { cause: 400 }))
  }
  // 2- Check Mobil Number if it is existed
  const isMobileNumberExisted = await dbMethods.findOneDocument(User, {
    mobileNumber,
  })
  if (isMobileNumberExisted.success) {
    return next(
      new Error('this mobile number is already existed', { cause: 400 })
    )
  }
  // 3- Create username
  const username = `${firstName.toLowerCase().trim()} ${lastName
    .toLowerCase()
    .trim()}`

  // 4- Hashing Password
  const hashedPassword = bcryptjs.hashSync(
    password.trim(),
    parseInt(process.env.SALT)
  )
  //  5- Create New User
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

/*
1- Check on Incoming Data
2- Find User with email  or mobile number
3- Check if incoming password doesn't match the Database hashed password
4- Create Token
5- Send token and profile data in response
*/
export const signIn = async (req, res, next) => {
  const { email, mobileNumber, password } = req.body

  // 1- check Email or mobile number if they are existed for another user
  let checkIfExisted = []
  email && checkIfExisted.push({ email })
  mobileNumber && checkIfExisted.push({ mobileNumber })
  const isUserExisted = await dbMethods.findOneDocument(User, {
    $or: checkIfExisted,
  })
  if (!isUserExisted.success) {
    return next(
      new Error('Invalid Credentials', {
        cause: 409,
      })
    )
  }
  // 2- Check if incoming password doesn't match the Database hashed password
  const isPasswordMatched = bcryptjs.compareSync(
    password,
    isUserExisted.result.password
  )
  if (!isPasswordMatched) {
    return next(
      new Error('Invalid Credentials pw', {
        cause: 401,
      })
    )
  }
  isUserExisted.result.status = 'online'
  await isUserExisted.result.save()

  //3- Create Token
  const token = generateUserToken({ id: isUserExisted.result._id.toString() })
  // 4- Send token and profile data in response
  res
    .status(isUserExisted.status)
    .json({ message: isUserExisted.message, user: isUserExisted.result, token })
}

/**
 * check Email if it's existed for another user
 * check mobile Number if it's  existed for another user
 * Get the user by id
 * update values if they're sent
 * if Email is sent, check if it's not equal recovery email, to get account back
 * if Recovery Email is sent, check if it's not equal email, to get account back
 */
export const updateProfile = async (req, res, next) => {
  const { firstName, lastName, email, DOB, mobileNumber, recoveryEmail } =
    req.body
  const { authUser } = req

  // //  check Email or mobile number if they are existed for another user
  // let checkIfExisted = []
  // email && checkIfExisted.push({ email })
  // mobileNumber && checkIfExisted.push({ mobileNumber })
  // const isUserExisted = await dbMethods.findOneDocument(User, {
  //   $or: checkIfExisted,
  // })
  // if (
  //   isUserExisted.success &&
  //   isUserExisted.result._id.toString() !== authUser._id.toString()
  // ) {
  //   return next(
  //     new Error(
  //       'This Email or mobile number is used by another user, try another one',
  //       {
  //         cause: 409,
  //       }
  //     )
  //   )
  // }

  //  Get the user by id
  const user = await dbMethods.findByIdDocument(User, authUser._id)
  // update values if they're sent
  firstName && (user.result.firstName = firstName.trim())
  lastName && (user.result.lastName = lastName.trim())
  user.result.username = `${user.result.firstName} ${user.result.lastName}`

  // if Email is sent
  // 1- check if it's used by another user
  // 2- and not equal recovery email, to get account back
  if (email) {
    const isEmailExistedForAnotherUser = await dbMethods.findOneDocument(User, {
      email,
    })
    if (
      isEmailExistedForAnotherUser.success &&
      isEmailExistedForAnotherUser.result._id.toString() !==
        authUser._id.toString()
    ) {
      return next(
        new Error('This Email is used by another user, try another one', {
          cause: 409,
        })
      )
    }

    if (email === user.result.recoveryEmail) {
      return next(
        new Error(
          'email should not be equal recovery email to be able to get back your account',
          { cause: 409 }
        )
      )
    }

    user.result.email = email
  }

  DOB && (user.result.DOB = DOB)

  // if mobile number is sent, check if it's used by another user
  if (mobileNumber) {
    const isMobileNumberExistedForAnotherUser = await dbMethods.findOneDocument(
      User,
      { mobileNumber }
    )
    if (
      isMobileNumberExistedForAnotherUser.success &&
      isMobileNumberExistedForAnotherUser.result._id.toString() !==
        authUser._id.toString()
    ) {
      return next(
        new Error(
          'This mobile number is used by another user, try another one',
          {
            cause: 409,
          }
        )
      )
    }

    user.result.mobileNumber = mobileNumber
  }
  // if Recovery Email is sent, check if it's not equal email, to get account back
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
/**
 * Find User and Delete using Id
 *  delete Assets
 */
export const deleteProfile = async (req, res, next) => {
  const { authUser } = req
  // Find User and Delete using Id
  const deleteUser = await dbMethods.findByIdAndDeleteDocument(
    User,
    authUser._id
  )

  if (!deleteUser.success) {
    return next(new Error('Error while deleting User'))
  }
  // delete Assets
  try {
    const sub_folders = await cloudinaryConnection().api.sub_folders(
      'jobSearchApp/users'
    )
    let isFolderExisted = false
    sub_folders.folders.map((subFolder) => {
      if (subFolder.name === `${authUser._id}`) {
        isFolderExisted = true
      }
    })
    if (isFolderExisted) {
      await cloudinaryConnection().api.delete_resources_by_prefix(
        `jobSearchApp/users/${authUser._id}`
      )
      await cloudinaryConnection().api.delete_folder(
        `jobSearchApp/users/${authUser._id}`
      )
    }
  } catch (error) {
    return next(new Error(`Error While deleting media ${error}`))
  }
  res.status(200).json({ message: 'User has been deleted successfully' })
}

/**
 * Private profile for the owner of the account
 */
export const getPrivateProfile = async (req, res, next) => {
  const { authUser } = req
  const getUser = await dbMethods.findByIdDocument(User, authUser._id)

  if (!getUser.success) {
    return next(new Error(getUser.message, { cause: getUser.status }))
  }

  res.status(200).json({ message: 'User', user: getUser.result })
}

/**
 * public profile is used to share account across other users
 */
export const getPublicProfile = async (req, res, next) => {
  const { userId } = req.params
  const getUser = await dbMethods.findByIdDocument(User, userId)

  if (!getUser.success) {
    return next(new Error(getUser.message, { cause: getUser.status }))
  }

  res.status(200).json({ message: 'User', user: getUser.result })
}

/**
 * check if user is still existed in DB
 * check if oldPassword equals the user password which came from DB
 * hashing the new password
 * update it 🔥
 */
export const updatePassword = async (req, res, next) => {
  const { authUser } = req
  const { oldPassword, newPassword } = req.body
  // check if user is still existed in DB
  const isUserExisted = await dbMethods.findByIdDocument(User, authUser._id)

  if (!isUserExisted.success) {
    return next(
      new Error(isUserExisted.message, { cause: isUserExisted.status })
    )
  }
  // check if oldPassword equals the user password which came from DB
  const isOldPasswordMatchUserPassword = bcryptjs.compareSync(
    oldPassword,
    isUserExisted.result.password
  )
  if (!isOldPasswordMatchUserPassword) {
    return next(
      new Error("Old password isn't match the user password", { cause: 401 })
    )
  }
  // hashing the new password
  const hashingNewPassword = bcryptjs.hashSync(
    newPassword,
    parseInt(process.env.SALT)
  )
  // update it 🔥
  isUserExisted.result.password = hashingNewPassword
  await isUserExisted.result.save()

  res
    .status(200)
    .json({ message: 'User has been updated', user: isUserExisted.result })
}

/**
 * Check if user in DB using email
 * create unique random otp (length=6)
 * Hashing the otp
 * check if user gets otp doc in db, if TRUE, update it with new hashed OTP
 * in case it's first time to forget password , create OTP document with email and hashed OTP code
 * send it back to user and wait him to send it back through api "users/verifyOTPAndUpdatePassword"
 */
export const forgetPassword = async (req, res, next) => {
  const { email } = req.body
  // Check if user in DB using email
  const isUserExisted = await dbMethods.findOneDocument(User, { email })

  if (!isUserExisted.success) {
    return next(
      new Error(isUserExisted.message, { cause: isUserExisted.status })
    )
  }
  // create unique random otp (length=6)
  const otp = generateUniqueString(6)
  // Hashing the otp
  const hashedOTP = bcryptjs.hashSync(otp, parseInt(process.env.SALT))
  const hashedOTPTobBeSent = jwt.sign(otp, process.env.OTP_SECRET_CODE)

  // check if user gets otp doc in db, if TRUE, update it with new hashed OTP
  const isOTPDocExisted = await dbMethods.findOneDocument(OTP, { email })

  if (isOTPDocExisted.success) {
    isOTPDocExisted.result.otp = hashedOTP
    await isOTPDocExisted.result.save()
    return res.status(isOTPDocExisted.status).json({
      message: "Please send OTP to 'users/verifyOTPAndUpdatePassword'",
      OTP: otp,
    })
  }

  // in case it's first time to forget password , create OTP document with email and hashed OTP code
  const newOTP = await dbMethods.createDocument(OTP, { email, otp: hashedOTP })
  if (!newOTP.success) {
    return next(new Error('Error while creating OTP, please try again'))
  }
  // send it back to user and wait him to send it back through api "users/verifyOTPAndUpdatePassword"
  res.status(newOTP.status).json({
    message: "Please send OTP to 'users/verifyOTPAndUpdatePassword'",
    OTP: hashedOTPTobBeSent,
  })
}

/**
 * Verify the Email user if it's existed in OTP collection
 * check the OTP if it's not used before
 * compare OTP for authentication case
 * hashing the new password
 * Get the user and update password with the new one
 * send back the user data
 */
export const getOTPandNewPassword = async (req, res, next) => {
  const { otp, email, newPassword } = req.body
  // Verify the Email user if it's existed in OTP collection
  const isEmailExistedOTP = await dbMethods.findOneDocument(OTP, { email })
  if (!isEmailExistedOTP.success) {
    return next(new Error('Invalid Email, Please try again', { cause: 401 }))
  }
  // check the OTP if it's not used before
  if (isEmailExistedOTP.result.isUsed) {
    return next(
      new Error('This OTP has been used before, Please try again', {
        cause: 401,
      })
    )
  }

  // Decrypt the recieved OTP
  const decryptedOTP = jwt.verify(otp, process.env.OTP_SECRET_CODE)

  // compare OTP for authentication case
  const isOTPRight = bcryptjs.compareSync(
    decryptedOTP,
    isEmailExistedOTP.result.otp
  )
  if (!isOTPRight)
    return next(
      new Error('Invalid OTP, Please try again', {
        cause: 401,
      })
    )
  // hashing the new password
  const hashingNewPassword = bcryptjs.hashSync(
    newPassword,
    parseInt(process.env.SALT)
  )
  // Get the user and update password with the new one
  const getUser = await dbMethods.findOneDocument(User, {
    email,
  })
  if (!getUser.success) return next(new Error('No User with this Email'))

  getUser.result.password = hashingNewPassword
  await getUser.result.save()
  isEmailExistedOTP.result.isUsed = true
  await isEmailExistedOTP.result.save()
  // send back the user data
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
