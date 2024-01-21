import jwt from 'jsonwebtoken'
export const generateUserToken = (payload) => {
  const token = jwt.sign(payload, process.env.TOKEN_SECRET_CODE, {
    expiresIn: '24h',
  })
  return token
}

export default generateUserToken
