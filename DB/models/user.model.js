import mongoose from 'mongoose'

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
      enum: ['company_HR', 'user'],
      required: true,
      default: 'user',
    },
    status: {
      type: String,
      enum: ['online', 'offline'],
      required: true,
      default: 'offline',
    },
    profileImage: {
      secure_url: {
        type: String,
        default:
          'https://res.cloudinary.com/dsjy29z66/image/upload/v1705850816/jobSearchApp/defaultProfileImage_i6axjh.png',
      },
      public_id: {
        type: String,
        default: 'jobSearchApp/defaultProfileImage_i6axjh',
      },
    },
  },
  { timestamps: true }
)

const User = mongoose.model('User', userSchema)

export default User
