import Joi from 'joi'
import joiDate from '@joi/date'
import { Types } from 'mongoose'

const joi = Joi.extend(joiDate) // to use @joi/date in validation the date format

const objectIdValidation = (value, helper) => {
  const isValid = Types.ObjectId.isValid(value)
  return isValid ? value : helper.message('invalid objectId')
}

export const signUpSchema = {
  body: joi.object({
    firstName: joi.string().trim().min(3).required(),
    lastName: joi.string().trim().min(3).required(),
    email: joi.string().email().trim().required(),
    recoveryEmail: joi
      .string()
      .email()
      .trim()
      .disallow(joi.ref('email'))
      .required()
      .messages({
        '*': 'recoveryEmail must be valid Email and not equal email field value',
      }),
    password: joi.string().trim().alphanum().min(6).required(),
    DOB: joi
      .date()
      .format('YYYY-MM-DD')
      .less('2006-01-01') // only +18 users, to avoid the illegal work age
      .required()
      .messages({
        '*': 'DOB (date of birth) must be in YYYY-MM-DD format and before 2006-01-01 (the legal working age)',
      }),
    mobileNumber: joi.string().trim().min(7).max(15).required(),
    role: joi.string().trim().valid('company_HR', 'user'),
  }),
}

export const signInSchema = {
  body: Joi.object({
    email: Joi.string().email().trim(),
    mobileNumber: joi.string().trim().min(7).max(15),
    password: Joi.string().trim().alphanum().min(6).required(),
  })
    .with('email', 'password')
    .with('mobileNumber', 'password'),
}

export const updateUserDataSchema = {
  body: joi.object({
    firstName: joi.string().trim().min(3),
    lastName: joi.string().trim().min(3),
    email: joi.string().email().trim(),
    recoveryEmail: joi
      .string()
      .email()
      .trim()
      .disallow(joi.ref('email'))
      .messages({
        '*': 'recoveryEmail must be valid Email and not equal email field value',
      }),
    DOB: joi.date().format('YYYY-MM-DD').less('2006-01-01').messages({
      '*': 'DOB (date of birth) must be in YYYY-MM-DD format and before 2006-01-01 (the legal working age)',
    }),
    mobileNumber: joi.string().trim().min(7).max(15),
  }),
}

export const getUserProfile = {
  params: joi.object({
    userId: joi.string().custom(objectIdValidation),
  }),
}
export const updatePasswordSchema = {
  body: joi
    .object({
      oldPassword: joi.string().trim().alphanum().min(6).required(),
      newPassword: joi
        .string()
        .trim()
        .alphanum()
        .min(6)
        .disallow(joi.ref('oldPassword'))
        .required()
        .messages({
          '*': 'new password should not be the same like old password and with minimum length 6 characters',
        }),
    })
    .with('newPassword', 'oldPassword'),
}

export const forgetPasswordSchema = {
  body: joi.object({
    email: joi.string().email().trim().required(),
  }),
}
export const verifyOTPandUpdatePasswordSchema = {
  body: joi
    .object({
      newPassword: joi.string().trim().alphanum().min(6).required(),
      otp: joi.string().length(6).trim().required(),
    })
    .with('newPassword', 'otp'),
}
export const allAccountsWithRecoveryEmailSchema = {
  body: joi.object({
    recoveryEmail: joi.string().email().trim().required(),
  }),
}
