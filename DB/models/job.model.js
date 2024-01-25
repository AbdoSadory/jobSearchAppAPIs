import mongoose from 'mongoose'
import {
  jobLocationEnum,
  seniorityLevelEnum,
  workingTimeEnum,
} from '../../src/utils/generalSystemConstants.js'

const jobSchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    jobLocation: {
      type: String,
      required: true,
      enum: jobLocationEnum,
      default: jobLocationEnum[0],
    },
    workingTime: {
      type: String,
      required: true,
      enum: workingTimeEnum,
      default: workingTimeEnum[0],
    },
    seniorityLevel: {
      type: String,
      required: true,
      enum: seniorityLevelEnum,
      default: seniorityLevelEnum[0],
    },
    jobDescription: {
      type: String,
      required: true,
      trim: true,
      default: 'No Description yet',
    },
    technicalSkills: [
      {
        type: String,
      },
    ],
    softSkills: [
      {
        type: String,
      },
    ],
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

jobSchema.virtual('applications', {
  ref: 'Application',
  foreignField: 'jobId',
  localField: '_id',
})
const Job = mongoose.model('Job', jobSchema)

export default Job
