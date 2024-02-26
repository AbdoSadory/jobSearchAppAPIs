import mongoose from 'mongoose'
import { companyIndustryEnum } from '../../src/utils/generalSystemConstants.js'

const companyShema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      default: 'No Description yet',
    },
    industry: {
      type: String,
      required: true,
      enum: companyIndustryEnum,
      default: 'others',
    },
    address: {
      type: String,
      default: 'no address yet',
    },
    numberOfEmployees: {
      from: {
        type: Number,
        required: true,
        min: 1,
      },
      to: { type: Number, required: true },
    },
    companyEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    companyHR: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    profileImage: {
      secure_url: {
        type: String,
        default:
          'https://res.cloudinary.com/dsjy29z66/image/upload/v1705869315/jobSearchApp/companies/defaultProfileImageCompany_oydcgq.png',
      },
      public_id: {
        type: String,
        default: 'jobSearchApp/companies/defaultProfileImageCompany_oydcgq',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

companyShema.virtual('jobs', {
  ref: 'Job',
  foreignField: 'companyId',
  localField: '_id',
})

const Company = mongoose.model('Company', companyShema)

export default Company
