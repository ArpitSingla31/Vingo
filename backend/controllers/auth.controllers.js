import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import genToken from "../utils/token.js"
import { sendOtpMail } from "../utils/mail.js"

const shouldUseCrossSiteCookie = () =>
  process.env.NODE_ENV === "production" ||
  process.env.RENDER === "true" ||
  process.env.FRONTEND_URL?.startsWith("https://")

const getAuthCookieOptions = () => {
  const useCrossSiteCookie = shouldUseCrossSiteCookie()

  return {
    secure: useCrossSiteCookie,
    sameSite: useCrossSiteCookie ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  }
}
export const signUp=async(req,res)=>{
  try {
    const {fullName,email,password,mobile,role}=req.body
    let user=await User.findOne({email})
    if (user){
      return res.status(400).json({message:"User already exist."})
    }
    if (password.length<6){
      return res.status(400).json({message:"password must be at least 6 chracters."})
    }
    if (mobile.length<10){
      return res.status(400).json({message:"mobile no must be at least 10 digits"})
    }

    const hashedPassword=await bcrypt.hash(password,10)
    user=await User.create({
      fullName,
      email,
      role,
      mobile,
      password: hashedPassword
    })
    const token = await genToken(user._id)
    res.cookie("token",token,getAuthCookieOptions())
    return res.status(201).json({ ...user.toObject(), token })
  } catch (error) {
     return res.status(500).json(`sign up error ${error}`)
  }
}
export const signIn=async(req,res)=>{
  try {
    const {email,password}=req.body
    const user=await User.findOne({email})
    if (!user){
      return res.status(400).json({message:"User does not exist."})
    }
    
  const isMatch=await bcrypt.compare(password,user.password)
  if(!isMatch){
     return res.status(400).json({message:"Incorrect password."})
  }
 
    const token = await genToken(user._id)
    res.cookie("token",token,getAuthCookieOptions())
    return res.status(200).json({ ...user.toObject(), token })
  } catch (error) {
     return res.status(500).json(`sign In error ${error}`)
  }
}
export const signOut=async(req,res)=>{
  try {
    const useCrossSiteCookie = shouldUseCrossSiteCookie()

    res.clearCookie("token",{
      path:"/",
      sameSite: useCrossSiteCookie ? "none" : "lax",
      secure: useCrossSiteCookie,
      httpOnly:true
    })
    return res.status(200).json({messsage:"log out succesfully"})
  } catch (error) {
    return res.status(500).json(`sign out error ${error.message}`)
  }
}

export const sendOtp=async (req,res)=>{
  try {
    const {email}=req.body
    const user=await User.findOne({email})
    if (!user){
       return res.status(400).json({message:"User does not exist."})
    }
    const otp=Math.floor(1000 + Math.random() *9000).toString()
    user.resetOtp=otp
    user.otpExpires=Date.now()+5*60*1000
    user.isOtpVerified=false
    await user.save()
    await sendOtpMail(email,otp)
    return res.status(200).json({message:"Otp sent succesfully"})
  } catch (error) {
    return res.status(500).json(`send otp error ${error}`)
  }
}

export const verifyOtp=async(req,res)=>{
  try {
    const{email,otp}=req.body
    const user=await User.findOne({email})
    if (!user || user.resetOtp!=otp || user.otpExpires<Date.now()){
      return res.status(400).json({message:"invalid/expired otp"})
    }
    user.isOtpVerified=true
    user.resetOtp=undefined
    user.otpExpires=undefined
    await user.save()
    return res.status(200).json({message:"Otp verify succesfully"})
  } catch (error) {
    return res.status(500).json(`verify otp error ${error}`)
  }
}

export const resetPassword= async(req,res)=>{
    try {
      const {email, newPassword}=req.body
        const user=await User.findOne({email})
    if (!user || !user.isOtpVerified){
       return res.status(400).json({message:"otp verification required"})
    }
    const hashedPassword=await bcrypt.hash(newPassword,10)
    user.password =hashedPassword
    user.isOtpVerified=false
    await user.save()
       return res.status(200).json({message:"password reset succesfully"})
    } catch (error) {
      return res.status(500).json(`reset password error ${error}`)
    }
}

export const googleAuth=async (req,res)=>{
  try {
    const {fullName,email,mobile,role}=req.body
    if (!email){
      return res.status(400).json({message:"Email is required for Google login."})
    }
    let user =await User.findOne({email})
    if (!user){
      const fallbackName = fullName || email.split("@")[0]
      const fallbackMobile = mobile || "0000000000"
      const fallbackRole = role || "user"
      user=await User.create({
        fullName: fallbackName,
        email,
        mobile: fallbackMobile,
        role: fallbackRole
      })
    }

      const token = await genToken(user._id)
    res.cookie("token",token,getAuthCookieOptions())
    return res.status(200).json({ ...user.toObject(), token })

  } catch (error) {
     return res.status(500).json(`Google auth error ${error}`)
  }
}
