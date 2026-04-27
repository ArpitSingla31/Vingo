import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase"; // ✅ IMPORTANT
import { ClipLoader } from "react-spinners"
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { saveAuthSession } from "../utils/authSession";
const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");

  const navigate = useNavigate();
  const [err,setErr]=useState("")
  const [loading,setLoading]=useState(false)
  const dispatch=useDispatch()

  // ✅ Signup
  const handleSignup = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { fullName, email, password, mobile, role },
        { withCredentials: true }
      );

      dispatch(setUserData(res.data))
      saveAuthSession(res.data.token)
      setErr("")
      setLoading(false)
     
    } catch (error) {
      setErr(error?.response?.data?.message)
      setLoading(false )
    }
  };

  // ✅ Google Auth (FIXED)
  const handleGoogleAuth = async () => {
    if(!mobile){
    return setErr("Mobile number is required")
    }
    
    try {
      setLoading(true)
      setErr("")
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);

  const {data}=await axios.post(`${serverUrl}/api/auth/google-auth`,{
    fullName:result.user.displayName,
    email:result.user.email,
    role,
    mobile

  },{withCredentials:true})
    dispatch(setUserData(data))
    saveAuthSession(data.token)
    navigate("/")
    } catch (error) {
      setErr(error.response?.data?.message || error.message || "Google sign up failed.")
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card max-h-[92vh] overflow-y-auto">
        <p className="section-kicker">Create Account</p>
        <h1 className="section-title">Join Vingo</h1>
        <p className="section-copy">
          Create one account for ordering, managing your restaurant, or delivering on the go.
        </p>

        <form onSubmit={handleSignup}>
        <div className="mt-8">
          <label className="field-label">Full name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            className="field-input"
            value={fullName} required
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <label className="field-label">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="field-input"
            value={email} required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <label className="field-label">Mobile</label>
          <input
            type="text"
            placeholder="Enter your mobile"
            className="field-input"
            value={mobile} required
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>

        <div className="relative mt-4">
          <label className="field-label">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="field-input pr-11"
            value={password} required
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-4 top-[45px] text-slate-400"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
          </button>
        </div>

        <div className="mt-5">
          <label className="field-label">Choose role</label>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["user", "owner", "deliveryboy"].map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 rounded-full px-3 py-2 text-center text-sm font-medium transition ${
                role === r ? "chip-button chip-button-active" : "chip-button"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <button
          className="brand-button mt-6 w-full"
          type="submit"
          disabled={loading}
        >
          {loading?<ClipLoader size={20} color='white' />:"Sign Up"}
        </button>
        </form>

        {err &&  <p className="mt-4 text-center text-sm text-red-500">{err}</p>}

        <button
          type="button"
          className="ghost-button mt-4 w-full gap-2"
          onClick={handleGoogleAuth}
        >
          <FcGoogle size={20} />
          <span>Sign up with Google</span>
        </button>

        <p
          className="mt-6 text-center text-sm text-slate-500 cursor-pointer"
          onClick={() => navigate("/signin")}
        >
          Already have an account?{" "}
          <span className="font-semibold text-[#f05a28]">Sign In</span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
