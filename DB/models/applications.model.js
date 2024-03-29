import mongoose from 'mongoose'

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userTechSkills: [
      {
        type: String,
        required: true,
      },
    ],
    userSoftSkills: [
      {
        type: String,
        required: true,
      },
    ],
    userResume: {
      secure_url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

const Application = mongoose.model('Application', applicationSchema)

export default Application
