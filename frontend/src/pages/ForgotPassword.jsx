import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import axios from "axios"
import { ClipLoader } from "react-spinners";
const serverUrl="https://vingo-backend-b4xs.onrender.com"


function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err,setErr]=useState("")
  const [loading,setLoading]=useState(false)
  const handleSetOtp=async(event)=>{
    event.preventDefault()
    setLoading(true)
    try {
      const result=await axios.post(`${serverUrl}/api/auth/send-otp`,{email}, {withCredentials:true})
      console.log(result)
      setErr("")
      setStep(2)
      setLoading(false)
    } catch (error) {
      setErr(error?.response?.data?.message)
      setLoading(false)
    }
  }
   const handleVerifypOtp=async(event)=>{
    event.preventDefault()
    setLoading(true)
    try {
      const result=await axios.post(`${serverUrl}/api/auth/verify-otp`,{email,otp}, {withCredentials:true})
      console.log(result)
      setErr("")
      setStep(3)
      setLoading(false)
    } catch (error) {
      setErr(error?.response?.data?.message)
      setLoading(false)
    }
  }
   const handleResetPassword=async(event)=>{
    event.preventDefault()
    setLoading(true)
    if(newPassword!==confirmPassword){
      setErr("Passwords do not match")
      setLoading(false)
      return
    }
    try {
      const result=await axios.post(`${serverUrl}/api/auth/reset-password`,{email,newPassword}, {withCredentials:true})
      setErr("")
      console.log(result)
      setLoading(false)
      navigate("/signin")
    } catch (error) {
       setErr(error?.response?.data?.message)
       setLoading(false)
    }
  }
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="mb-6 flex items-center gap-4">
          <IoIosArrowRoundBack
            size={30}
            className="text-[#ff4d2d] cursor-pointer"
            onClick={() => navigate("/signin")}
          />
          <div>
            <p className="section-kicker">Password Recovery</p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Forgot Password
            </h1>
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={handleSetOtp}>
            <div className="mb-6">
              <label className="field-label">Email</label>

              <input
                type="email"
                className="field-input"
                placeholder="Enter your Email"
                value={email} required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              className="brand-button w-full" type="submit" disabled={loading}
            >
            {loading?<ClipLoader size={20} color='white'/>:"Send otp"}
            </button>
               {err &&  <p className="mt-4 text-center text-sm text-red-500">{err}</p>}
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifypOtp}>
            <div className="mb-6">
              <label className="field-label">OTP</label>

              <input
                type="text"
                className="field-input"
                placeholder="Enter Otp"
                value={otp} required
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <button
              className="brand-button w-full" type="submit" disabled={loading}
            >
            {loading?<ClipLoader size={20} color='white'/>:"verify otp"}
            </button>
             {err &&  <p className="mt-4 text-center text-sm text-red-500">{err}</p>}
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label className="field-label">New Password</label>

              <input
                type="password"
                className="field-input"
                placeholder="Enter New Password"
                value={newPassword} required
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="field-label">Confirm Password</label>

              <input
                type="password"
                className="field-input"
                placeholder="Confirm Password"
                value={confirmPassword}required
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              className="brand-button w-full" type="submit" disabled={loading}
            >
            {loading?<ClipLoader size={20} color='white'/>:"Reset Password"}
            </button>
                {err &&  <p className="mt-4 text-center text-sm text-red-500">{err}</p>}
          </form>
        )}

      </div>
    </div>
  );
}

export default ForgotPassword;
