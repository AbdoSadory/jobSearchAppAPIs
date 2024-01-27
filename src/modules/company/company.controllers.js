import * as dbMethods from '../../../DB/dbMethods.js'
import Application from '../../../DB/models/applications.mode.js'
import Company from '../../../DB/models/company.model.js'
import Job from '../../../DB/models/job.model.js'
import cloudinaryConnection from '../../utils/mediaHostConnection.js'

/**
 * check if company is existed
 * create company
 */
export const createCompany = async (req, res, next) => {
  const { authUser, isUserAuthorized } = req
  const {
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
  } = req.body
  if (!isUserAuthorized)
    return next(new Error('Not Authorized', { cause: 403 }))

  // check if company is existed
  const isCompanyExisted = await dbMethods.findOneDocument(Company, {
    $or: [{ companyEmail }, { companyName }],
  })
  if (isCompanyExisted.success) {
    return next(
      new Error('This Company Email or Name is already existed ', {
        cause: 400,
      })
    )
  }
  // Create Company
  const createCompany = await dbMethods.createDocument(Company, {
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
    companyHR: authUser._id,
  })
  if (!createCompany.success)
    return next(new Error('Error while creating company'))

  res
    .status(201)
    .json({ message: 'New Company', company: createCompany.result })
}

// check if there's company with companyEmailToUpdate and user id
// if companyEmail will be updated, check if it's existed and not the same target company to be updated
// if companyName will be updated, check if it's existed and not the same target company to be updated
// Update each field if related value is sent in req.body
export const updateCompany = async (req, res, next) => {
  const { authUser, isUserAuthorized } = req
  const {
    companyEmailToUpdate,
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
  } = req.body
  if (!isUserAuthorized)
    return next(new Error('Not Authorized', { cause: 403 }))
  // check if there's company with companyEmailToUpdate and user id
  const isCompanyExisted = await dbMethods.findOneDocument(Company, {
    companyEmail: companyEmailToUpdate,
    companyHR: authUser._id.toString(),
  })
  if (!isCompanyExisted.success)
    return next(
      new Error(
        'This Company Email is not existed with this user id, Please try another one',
        {
          cause: 404,
        }
      )
    )
  // if companyEmail will be updated, check if it's existed and not the same target company to be updated
  if (companyEmail) {
    const isCompanyExistedWithCompanyEmail = await dbMethods.findOneDocument(
      Company,
      {
        companyEmail,
      }
    )
    if (
      isCompanyExistedWithCompanyEmail.success &&
      isCompanyExistedWithCompanyEmail.result.companyEmail !==
        isCompanyExisted.result.companyEmail
    ) {
      return next(
        new Error(
          'This Company Email is existed for another company, try another one',
          {
            cause: 400,
          }
        )
      )
    }
  }
  // if companyName will be updated, check if it's existed and not the same target company to be updated
  if (companyName) {
    const isCompanyExistedWithCompanyName = await dbMethods.findOneDocument(
      Company,
      {
        companyName,
      }
    )
    if (
      isCompanyExistedWithCompanyName.success &&
      isCompanyExistedWithCompanyName.result.companyName !==
        isCompanyExisted.result.companyName
    ) {
      return next(
        new Error(
          'This Company Name is existed for another company, try another one',
          {
            cause: 400,
          }
        )
      )
    }
  }

  // Update each field if related value is sent in req.body
  companyName && (isCompanyExisted.result.companyName = companyName)
  description && (isCompanyExisted.result.description = description)
  industry && (isCompanyExisted.result.industry = industry)
  address && (isCompanyExisted.result.address = address)
  numberOfEmployees &&
    (isCompanyExisted.result.numberOfEmployees = numberOfEmployees)
  companyEmail && (isCompanyExisted.result.companyEmail = companyEmail)

  const updatedCompany = await isCompanyExisted.result.save()

  res.status(200).json({ message: 'updated Company', company: updatedCompany })
}

// check if there's company with companyEmailToUpdate and user id
//  delete it
//  delete Media
export const deleteCompany = async (req, res, next) => {
  const { authUser, isUserAuthorized } = req
  const { companyEmailToDelete } = req.body
  if (!isUserAuthorized)
    return next(new Error('Not Authorized', { cause: 403 }))
  // check if there's company with companyEmailToUpdate and user id
  const isCompanyExisted = await dbMethods.findOneDocument(Company, {
    companyEmail: companyEmailToDelete,
    companyHR: authUser._id.toString(),
  })
  if (!isCompanyExisted.success)
    return next(
      new Error(
        'This Company Email is not existed with this user id, Please try another one',
        {
          cause: 404,
        }
      )
    )

  //  delete it
  const deleteCompany = await dbMethods.findByIdAndDeleteDocument(
    Company,
    isCompanyExisted.result._id
  )
  if (!deleteCompany.success) {
    return next(new Error('Error while deleting the company from database'))
  }

  const jobs = await dbMethods.findDocuments(Job, {
    companyId: isCompanyExisted.result._id,
  })
  const jobsIds = jobs.result.map((job) => job._id)
  for (let jobId of jobsIds) {
    const deleteApplications = await Application.deleteMany({ jobId })
    if (!deleteApplications)
      return next(new Error('Error While deleting Application'))
  }
  const deleteJobs = await Job.deleteMany({
    companyId: isCompanyExisted.result._id,
  })
  if (!deleteJobs) return next(new Error('Error While deleting Jobs'))
  //  delete Media
  try {
    const sub_folders = await cloudinaryConnection().api.sub_folders(
      'jobSearchApp/companies'
    )
    let isFolderExisted = false
    sub_folders.folders.map((subFolder) => {
      if (subFolder.name === `companyId-${isCompanyExisted.result._id}`) {
        isFolderExisted = true
      }
    })
    if (isFolderExisted) {
      await cloudinaryConnection().api.delete_resources_by_prefix(
        `jobSearchApp/companies/companyId-${isCompanyExisted.result._id}`
      )
      await cloudinaryConnection().api.delete_folder(
        `jobSearchApp/companies/companyId-${isCompanyExisted.result._id}`
      )
    }
  } catch (error) {
    return next(new Error(`Error While deleting media ${error.message}`))
  }
  res.status(200).json({ message: 'Deleted Successfully' })
}

// get company using params when you're HR
export const getCompany = async (req, res, next) => {
  const { companyId } = req.params
  const { authUser, isUserAuthorized } = req
  if (!isUserAuthorized)
    return next(new Error('Not Authorized', { cause: 403 }))

  // get company using params when you're HR and populate Jobs
  const company = await Company.findById(companyId).populate('jobs')
  if (!company)
    return next(
      new Error("There's no Company with this id", {
        cause: 404,
      })
    )

  res.status(200).json({ message: 'Company', company })
}
/**
 * get companies using name in query
 */
export const searchCompanyUsingName = async (req, res, next) => {
  const { companyName } = req.query
  // get companies using name in query
  const companies = await dbMethods.findDocuments(Company, {
    companyName: { $regex: companyName, $options: 'i' },
  })
  if (!companies.success) {
    return next(new Error('Error while query the companies'))
  }
  res.status(200).json({
    messsage: 'Companies',
    companies: companies.result ? companies.result : [],
  })
}

/**
 * search on company using the HR id and company Id
 * get applications from Job Model using virtual properties

*/
export const getCompanyJobsApplications = async (req, res, next) => {
  const { companyId } = req.params
  const { authUser, isUserAuthorized } = req
  if (!isUserAuthorized)
    return next(new Error('Not Authorized', { cause: 403 }))
  // search on company using the HR id and company Id
  const company = await Company.findOne({
    _id: companyId,
    companyHR: authUser._id,
  })
  if (!company)
    return next(
      new Error("There's no Company with this user", {
        cause: 404,
      })
    )

  // get applications from Job Model using virtual properties
  const jobsWithApplications = await Job.find({ companyId }).populate({
    path: 'applications',
    populate: 'userId',
  })
  res.status(200).json({ message: 'Company', jobsWithApplications })
}

export const updateProfileImage = async (req, res, next) => {
  const { companyId } = req.params
  const { authUser, isUserAuthorized } = req
  if (!isUserAuthorized)
    return next(new Error('Not Authorized', { cause: 403 }))
  const company = await dbMethods.findByIdDocument(Company, companyId)
  if (!company.success)
    return next(new Error('No Company with this id', { cause: 400 }))

  const uploadedProfileImage = await cloudinaryConnection().uploader.upload(
    req.file.path,
    {
      folder: `jobSearchApp/companies/companyId-${company.result._id}`,
      public_id: 'profileImage',
    }
  )
  if (!uploadedProfileImage)
    return next(
      new Error('Error while uploading the profile Image, please try again')
    )

  company.result.profileImage.secure_url = uploadedProfileImage.secure_url
  company.result.profileImage.public_id = uploadedProfileImage.public_id
  await company.result.save()

  res.status(200).json({
    message: 'Company Profile Image has been updated',
    company: company.result,
  })
}
