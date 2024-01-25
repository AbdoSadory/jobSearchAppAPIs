import mongoose from 'mongoose'
import {
  userRolesEnum,
  userStatusEnum,
} from '../../src/utils/generalSystemConstants.js'

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    recoveryEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    DOB: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: userRolesEnum,
      required: true,
      default: userRolesEnum[0],
    },
    status: {
      type: String,
      enum: userStatusEnum,
      required: true,
      default: userStatusEnum[0],
    },
    profileImage: {
      secure_url: {
        type: String,
        default:
          'https://res.cloudinary.com/dsjy29z66/image/upload/v1705864399/jobSearchApp/users/defaultProfileImage_kkebpj.png',
      },
      public_id: {
        type: String,
        default: 'jobSearchApp/users/defaultProfileImage_kkebpj',
      },
    },
  },
  { timestamps: true }
)

const User = mongoose.model('User', userSchema)

export default User
