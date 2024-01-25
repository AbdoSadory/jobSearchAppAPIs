import * as dbMethods from '../../../DB/dbMethods.js'
import Application from '../../../DB/models/applications.mode.js'
import Company from '../../../DB/models/company.model.js'
import Job from '../../../DB/models/job.model.js'
import cloudinaryConnection from '../../utils/mediaHostConnection.js'
import path from 'path'
export const addJob = async (req, res, next) => {
  /**
   * check if company is existed
   *
   */
  const { authUser, isUserAuthorized } = req
  if (!isUserAuthorized)
    return next(new Error('Not Authorized', { cause: 403 }))
  const {
    companyEmail,
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
  } = req.body

  const isCompanyExisted = await dbMethods.findOneDocument(Company, {
    companyEmail,
  })
  if (!isCompanyExisted.success)
    return next(new Error('No Company with this email', { cause: 400 }))

  const newJob = await dbMethods.createDocument(Job, {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    addedBy: authUser._id,
    companyId: isCompanyExisted.result._id,
  })

  if (!newJob.success) return next(new Error('Error while creating Job'))

  res.status(201).json({ message: 'New Job', job: newJob.result })
}

export const updateJob = async (req, res, next) => {
  const { jobId } = req.params
  const { authUser, isUserAuthorized } = req
  if (!isUserAuthorized)
    return next(new Error('Not Authorized', { cause: 403 }))
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
  } = req.body

  const isJobExisted = await Job.findOneAndUpdate(
    {
      _id: jobId,
      addedBy: authUser._id,
    },
    {
      $set: {
        jobTitle,
        jobLocation,
        workingTime,
        seniorityLevel,
        jobDescription,
        technicalSkills,
        softSkills,
      },
      $inc: { __v: 1 },
    },
    {
      new: true,
    }
  )
  if (!isJobExisted)
    return next(new Error('No Job with this id to this user', { cause: 400 }))

  res.status(200).json({
    message: 'Job has been updated Successfully',
    job: isJobExisted,
  })
}
export const deleteJob = async (req, res, next) => {
  const { jobId } = req.params
  const { authUser, isUserAuthorized } = req
  if (!isUserAuthorized)
    return next(new Error('Not Authorized', { cause: 403 }))

  const isJobExisted = await dbMethods.findOneAndDeleteDocument(Job, {
    _id: jobId,
    addedBy: authUser._id,
  })
  if (!isJobExisted.success)
    return next(new Error('No Job with this id to this user', { cause: 400 }))

  res.status(200).json({ message: 'Job has been deleted successfully' })
}
export const getJobsWithCompanies = async (req, res, next) => {
  const jobs = await Job.find().populate('companyId')
  if (!jobs) return next(new Error('Error While getting jobs'))

  res.status(200).json({ message: 'Jobs', jobs })
}

export const getJobsOfCompany = async (req, res, next) => {
  const { companyName } = req.query
  const { authUser, isUserAuthorized } = req
  if (!isUserAuthorized)
    return next(new Error('Not Authorized', { cause: 403 }))

  const companies = await Company.find({
    companyName: { $regex: companyName, $options: 'i' },
  }).populate('jobs')
  if (!companies) {
    return next(new Error('Error while query the companies'))
  }

  let jobs = []
  jobs.push(companies.map((company) => company.jobs))

  res.status(200).json({
    messsage: 'jobs',
    jobs: jobs.length ? jobs.flat(Infinity) : [],
  })
}
export const getJobsWithFilter = async (req, res, next) => {
  const { authUser, isUserAuthorized } = req
  if (!isUserAuthorized)
    return next(new Error('Not Authorized', { cause: 403 }))
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    technicalSkills,
  } = req.query

  const query = {}
  jobTitle && (query.jobTitle = { $regex: jobTitle, $options: 'i' })
  jobLocation && (query.jobLocation = jobLocation)
  workingTime && (query.workingTime = workingTime)
  seniorityLevel && (query.seniorityLevel = seniorityLevel)

  const technicalSkillsArray = technicalSkills && JSON.parse(technicalSkills)
  technicalSkillsArray?.length &&
    (query.technicalSkills = { $all: technicalSkillsArray })

  const jobs = await Job.find(query)
  if (!jobs) return next(new Error('Error while filtering the jobs '))
  res.status(200).json({ message: 'Jobs', jobs })
}
export const applyToJob = async (req, res, next) => {
  /**
   * check the authorization
   *
   */
  const { jobId } = req.params
  const { userTechSkills, userSoftSkills } = req.body
  const userResume = req.file?.path
  const { authUser, isUserAuthorized } = req
  if (!isUserAuthorized)
    return next(new Error('Not Authorized', { cause: 403 }))
  const isJobExisted = await dbMethods.findByIdDocument(Job, jobId)
  if (!isJobExisted.success)
    return next(
      new Error('No Job is existed with this id', {
        cause: isJobExisted.status,
      })
    )
  const isUserApplied = await dbMethods.findOneDocument(Application, {
    jobId,
    userId: authUser._id,
  })
  if (isUserApplied.success)
    return next(new Error('This user is already applied for this job'))

  const pdfResume = await cloudinaryConnection().uploader.upload(userResume, {
    folder: `jobSearchApp/companies/companyId-${isJobExisted.result.companyId}/jobId-${isJobExisted.result._id}`,
    public_id: authUser._id,
  })
  if (!pdfResume)
    return next(
      new Error('Error while uploading the profile Image, please try again')
    )
  const newApplication = await dbMethods.createDocument(Application, {
    jobId,
    userId: authUser._id,
    userTechSkills: JSON.parse(userTechSkills),
    userSoftSkills: JSON.parse(userSoftSkills),
    userResume: {
      secure_url: pdfResume.secure_url,
      public_id: pdfResume.public_id,
    },
  })
  if (!newApplication.success) {
    await cloudinaryConnection().uploader.destroy(pdfResume.public_id)
    return next(new Error('Error While creating application'))
  }

  res
    .status(200)
    .json({ message: 'New Application', application: newApplication.result })
}
