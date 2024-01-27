# Job Search App

A Job Search App API is similar to linkedIn website to create company, job an apply for a job by create application, using NodeJS runtime environment and ExpressJS as the server framework.
The API will support creating, viewing, editing, and deleting tasks.

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the API](#running-the-api)
- [API Structure](#api-structure)
- [Endpoints](#endpoints)

## Prerequisites

Before you run the API, make sure you have the following prerequisites installed:

**MongoDB Server:** Ensure you have MongoDB Server installed. You can download and install MongoDB from [MongoDB official website](https://www.mongodb.com/try/download/community).

## Installation

To install dependencies:

```bash
npm install
```

## Running the API

To run in dev mode:

```bash
npm run dev
```

## API Structure

Following ExpressJS Structure:

- DB : for DB connection and Entities Schemas
- Src : for middlewares, modules (controllers,routes) , utils

```
  ├── DB
  |   ├── models
  |   |      ├── applications.model.js
  |   |      ├── company.model.js
  |   |      ├── job.model.js
  |   |      ├── OTP.model.js
  |   |      └── user.model.js
  |   ├── connection.js
  |   └── dbMethods.js
  ├── src
  |   ├── middlewares
  |   |      ├── authHandler.js
  |   |      ├── authorizationHandler.js
  |   |      ├── globalErrorHandler.js
  |   |      ├── uploadingFilesHandler.js
  |   |      └── validationMiddleware.js
  │   ├── modules
  |   |      ├── users
  |   |      |      ├── controllers.js
  |   |      |      ├── dataValidationSchema.js
  |   |      |      └── routes.js
  |   |      ├── company
  |   |      |      ├── controllers.js
  |   |      |      ├── dataValidationSchema.js
  |   |      |      └── routes.js
  |   |      ├── job
  |   |      |      ├── controllers.js
  |   |      |      ├── dataValidationSchema.js
  |   |      └──    └── routes.js
  |   ├── utils
  |   |      ├── allowedExtensions.js
  |   |      ├── generalSystemConstants.js
  |   |      ├── generateUniqueString.js
  |   |      ├── generateUserToken.js
  |   |      └── mediaHostConnection.js
  ├── index.js
  ├── .env
  ├── README.md
  └── .gitignore
```

## Endpoints

### Check APIs Documentation : https://documenter.getpostman.com/view/27228437/2s9YsKgBt3

### User

| Method | URL                                   | Description                                         |
| ------ | ------------------------------------- | --------------------------------------------------- |
| GET    | `/users/myProfile`                    | Get Private Profile and must be logged In           |
| GET    | `/users/allAccountsWithRecoveryEmail` | Get Users accounts using same recoveryEmail         |
| POST   | `/users/signUp`                       | Create a new user account                           |
| POST   | `/users/signIn`                       | Authenticate and get access token                   |
| POST   | `/users/userProfile/:userId`          | Get Profile of users using Id and must be logged In |
| PUT    | `/users/updateProfile`                | Update User Profile and must be logged In           |
| PUT    | `/users/changePassword`               | Change Password and must be logged In               |
| PUT    | `/users/forgetPassword`               | Forget Password                                     |
| POST   | `/users/verifyOTPAndUpdatePassword`   | Send OTP to change password with new one            |
| PUT    | `/users/updateProfileImage`           | Change Profile Image and must be logged In          |
| DELETE | `/users/deleteProfile`                | Delete User Profile and must be logged In           |

### Company

| Method | URL                                           | Description                                           |
| ------ | --------------------------------------------- | ----------------------------------------------------- |
| GET    | `/company/createCompany`                      | Retrieve all company                                  |
| GET    | `/company/companyDetails/:companyId`          | get company and must be logged In                     |
| GET    | `/company/searchByName`                       | get company using query params and must be logged In  |
| GET    | `/company/companyJobsApplications/:companyId` | get company applications and must be logged In        |
| POST   | `/company/createCompany`                      | Create new company and must be logged In with HR role |
| PUT    | `/company/updateCompany`                      | Update company and must be logged In with HR role     |
| PUT    | `/company/assignTaskToUser`                   | Assign company to user and must be logged In          |
| PUT    | `/company/updateProfileImage/:companyId`      | Change Profile Image and must be logged In            |
| DELETE | `/company/deleteCompany`                      | Delete company and must be logged In with HR role     |

### Jobs

| Method | URL                            | Description                                                          |
| ------ | ------------------------------ | -------------------------------------------------------------------- |
| GET    | `/jobs/getJobsWithFullInfo`    | Get all jobs with Full Info and must be logged In                    |
| GET    | `/jobs/getJobsWithCompanyName` | Get jobs wit company name and must be logged In                      |
| GET    | `/jobs/getJobsWithFilter`      | Get all jobs using filter in query params and must be logged In      |
| POST   | `/jobs/addJob`                 | add new job and must be HR , logged In and add it for his company    |
| POST   | `/jobs/applyJob/:jobId`        | Add application for job and must be user role, logged In             |
| PUT    | `/jobs/updateJob/:jobId`       | Update task and must be HR , logged In and update it for his company |
| DELETE | `/jobs/deleteJob/:jobId`       | Delete Job and must be HR , logged In and delete it for his company  |
