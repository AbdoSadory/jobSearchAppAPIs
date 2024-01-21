import mongoose from 'mongoose'

const OTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    otp: {
      type: String,
      required: true,
      unique: true,
    },
    isUsed: {
      type: Boolean,
      required: true,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      expires: 60 * 3, // The document will be automatically deleted after 3 minutes of its creation time
    },
  },
  { timestamps: true }
)

const OTP = mongoose.model('OTP', OTPSchema)

export default OTP
