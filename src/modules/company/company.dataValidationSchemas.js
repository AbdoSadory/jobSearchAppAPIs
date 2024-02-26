import Joi from 'joi'
import { companyIndustryEnum } from '../../utils/generalSystemConstants.js'
import { Types } from 'mongoose'

const objectIdValidation = (value, helper) => {
  const isValid = Types.ObjectId.isValid(value)
  return isValid ? value : helper.message('Invalid ObjectId')
}
export const createCompanySchema = {
  body: Joi.object({
    companyName: Joi.string().trim().min(5).required(),
    description: Joi.string().trim().required(),
    industry: Joi.string()
      .valid(...companyIndustryEnum)
      .required(),
    address: Joi.string().trim().required(),
    numberOfEmployees: Joi.object({
      from: Joi.number().min(1).required(),
      to: Joi.number().min(Joi.ref('from')).required(),
    }).required(),
    companyEmail: Joi.string().email().trim().required(),
  }),
}
export const updateCompanySchema = {
  body: Joi.object({
    companyEmailToUpdate: Joi.string().email().trim().required(),
    companyName: Joi.string().trim().min(5),
    description: Joi.string().trim(),
    industry: Joi.string().valid(...companyIndustryEnum),
    address: Joi.string().trim(),
    numberOfEmployees: Joi.object({
      from: Joi.number().min(1).required(),
      to: Joi.number().min(Joi.ref('from')).required(),
    }),
    companyEmail: Joi.string().email().trim(),
  }),
}
export const deleteCompanySchema = {
  body: Joi.object({
    companyEmailToDelete: Joi.string().email().trim().required(),
  }),
}
export const getCompanyUsingIdSchema = {
  params: Joi.object({
    companyId: Joi.string().custom(objectIdValidation).required(),
  }),
}
export const searchCompanyUsingNameSchema = {
  query: Joi.object({
    companyName: Joi.string().trim().required(),
  }),
}

export const updateCompanyProfileImageUsingIdSchema = {
  params: Joi.object({
    companyId: Joi.string().custom(objectIdValidation).required(),
  }),
  body: Joi.object({
    profileImage: Joi.string(),
  }),
}
