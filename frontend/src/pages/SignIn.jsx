import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { ClipLoader } from "react-spinners";
import { setUserData } from "../redux/userSlice";
import { useDispatch } from "react-redux";
import { saveAuthSession } from "../utils/authSession";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err,setErr]=useState("")
  const [loading,setLoading]=useState(false)
  const dispatch=useDispatch()
  const handleSignIn = async (event) => {
  event.preventDefault();
  setLoading(true);

  try {
    const res = await axios.post(
      `${serverUrl}/api/auth/signin`,
      { email, password },
      { withCredentials: true }
    );

    dispatch(setUserData(res.data)); // ✅ fixed
    saveAuthSession(res.data.token);
    setErr("");
    setLoading(false);

    navigate("/"); // ✅ VERY IMPORTANT
  } catch (err) {
    setErr(err.response?.data?.message);
    setLoading(false);
  }
};
 const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setErr("");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);

      const {data}=await axios.post(`${serverUrl}/api/auth/google-auth`,{
        fullName: result.user.displayName,
        email: result.user.email,
        role: "user",
        mobile: "0000000000",
      },{withCredentials:true})
      dispatch(setUserData(data))
      saveAuthSession(data.token);
      navigate("/")
    } catch (error) {
      setErr(error.response?.data?.message || error.message || "Google sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card max-h-[92vh] overflow-y-auto">
        <p className="section-kicker">Welcome Back</p>
        <h1 className="section-title">Sign in to Vingo</h1>
        <p className="section-copy">
          Pick up where you left off and jump back into orders, shops, and deliveries.
        </p>

        <form onSubmit={handleSignIn}>
        <div className="mt-8">
          <label className="field-label">Email</label>
          <input
            type="email"
            className="field-input"
            placeholder="Enter your email"
            value={email} required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mt-5">
          <label className="field-label">Password</label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="field-input pr-11"
              placeholder="Enter your password"
              value={password} required
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              onClick={() =>
                setShowPassword((prev) => !prev)
              }
            >
              {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </div>

        <div className="mt-4 text-right text-sm font-medium text-[#f05a28] cursor-pointer" onClick={()=>
          navigate("/forgot-password")}>
          Forgot Password
        </div>

        <button
          className="brand-button mt-5 w-full"
          type="submit"
          disabled={loading}
        >
          {loading?<ClipLoader size={20} color='white' />:"Sign In"}
        </button>
        </form>

        {err &&  <p className="mt-4 text-center text-sm text-red-500">{err}</p>}

        <button type="button" className="ghost-button mt-4 w-full gap-2" onClick={handleGoogleAuth}>
          <FcGoogle size={20} />
          <span>Sign in with Google</span>
        </button>

        <p
          className="mt-6 text-center text-sm text-slate-500 cursor-pointer"
          onClick={() => navigate("/signup")}
        >
          Don’t have an account?{" "}
          <span className="font-semibold text-[#f05a28]">
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
