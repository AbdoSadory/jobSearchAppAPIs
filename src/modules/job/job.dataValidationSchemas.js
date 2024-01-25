import Joi from 'joi'
import {
  jobLocationEnum,
  seniorityLevelEnum,
  workingTimeEnum,
} from '../../utils/generalSystemConstants.js'
import { Types } from 'mongoose'

const objectIdValidation = (value, helper) => {
  const isValid = Types.ObjectId.isValid(value)
  return isValid ? value : helper.message('Invalid ObjectId')
}
export const addJobSchema = {
  body: Joi.object({
    companyEmail: Joi.string().email().trim().required(),
    jobTitle: Joi.string().trim().min(5).required(),
    jobLocation: Joi.string()
      .valid(...jobLocationEnum)
      .required(),
    workingTime: Joi.string()
      .valid(...workingTimeEnum)
      .required(),
    seniorityLevel: Joi.string()
      .valid(...seniorityLevelEnum)
      .required(),
    jobDescription: Joi.string().trim().required(),
    technicalSkills: Joi.array().items(Joi.string()).required(),
    softSkills: Joi.array().items(Joi.string()).required(),
  }),
}
export const updateJobSchema = {
  params: Joi.object({
    jobId: Joi.string().custom(objectIdValidation).required(),
  }),
  body: Joi.object({
    jobTitle: Joi.string().trim().min(5),
    jobLocation: Joi.string().valid(...jobLocationEnum),
    workingTime: Joi.string().valid(...workingTimeEnum),
    seniorityLevel: Joi.string().valid(...seniorityLevelEnum),
    jobDescription: Joi.string().trim(),
    technicalSkills: Joi.array().items(Joi.string()),
    softSkills: Joi.array().items(Joi.string()),
  }),
}
export const deleteJobSchema = {
  params: Joi.object({
    jobId: Joi.string().custom(objectIdValidation).required(),
  }),
}
export const getJobsOfCompanyUsingNameSchema = {
  query: Joi.object({
    companyName: Joi.string().trim().required(),
  }),
}
export const getJobsWithFilterSchema = {
  query: Joi.object({
    jobTitle: Joi.string().trim().min(5),
    jobLocation: Joi.string().valid(...jobLocationEnum),
    workingTime: Joi.string().valid(...workingTimeEnum),
    seniorityLevel: Joi.string().valid(...seniorityLevelEnum),
    technicalSkills: Joi.string(),
  }),
}

export const applyToJobSchema = {
  params: Joi.object({
    jobId: Joi.string().custom(objectIdValidation).required(),
  }),
  body: Joi.object({
    userTechSkills: Joi.string().required(),
    userSoftSkills: Joi.string().required(),
    userResume: Joi.string(),
  }),
}
