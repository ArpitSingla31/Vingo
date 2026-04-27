import jwt from "jsonwebtoken"

const isAuth = async (req, res, next) => {
  try {
    // 🔥 Get token properly
    const bearerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null
    const token = req.cookies?.token || bearerToken

    console.log("TOKEN:", token)

    if (!token) {
      return res.status(401).json({ message: "No token found" })
    }

    // 🔥 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    console.log("DECODED:", decoded)

    if (!decoded) {
      return res.status(401).json({ message: "Token invalid" })
    }

    // 🔥 Set userId
    req.userId = decoded.userId

    next()
  } catch (error) {
    console.log("ERROR:", error.message)
    return res.status(401).json({ message: "Auth failed" })
  }
}

export default isAuth
