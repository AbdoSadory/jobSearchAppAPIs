export const authorizationHandler = (...userRole) => {
  /*
  checking the role of the authUser if he's authorized 
  */
  return async (req, res, next) => {
    const { authUser } = req
    console.log(authUser)

    const isUserAuthorizer = userRole.includes(authUser.role)

    if (!isUserAuthorizer) {
      return next(new Error('This user is not Authorized', { cause: 403 }))
    }
    req.isUserAuthorized = true // for more security
    next()
  }
}

export default authorizationHandler
