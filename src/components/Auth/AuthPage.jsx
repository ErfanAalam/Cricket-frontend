import React, { useContext, useState } from "react";
import { UserContext } from "../../Context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { LoaderCircle } from "lucide-react"
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID


// Validation functions
const validatePassword = (password) => {
  if (!password) return "Password is required";

  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  if (!minLength) errors.push("at least 8 characters");
  if (!hasUpperCase) errors.push("an uppercase letter");
  if (!hasLowerCase) errors.push("a lowercase letter");
  if (!hasNumber) errors.push("a number");
  if (!hasSpecialChar) errors.push("a special character");

  if (errors.length > 0) {
    return `Password must contain ${errors.join(", ")}`;
  }
  return "";
};

const validatePhone = (phone) => {
  if (!phone) return "Phone number is required";

  // Remove all spaces from the phone number
  const trimmedPhone = phone.replace(/\s+/g, '');

  // Check if the number starts with +91
  if (trimmedPhone.startsWith('+91')) {
    // Remove +91 and check if remaining is 10 digits
    const actualNumber = trimmedPhone.slice(3);
    if (!/^\d{10}$/.test(actualNumber)) {
      return "Phone number must be exactly 10 digits after +91";
    }
  } else {
    // If no +91 prefix, check if it's exactly 10 digits
    if (!/^\d{10}$/.test(trimmedPhone)) {
      return "Phone number must be exactly 10 digits";
    }
  }
  return "";
};

const formatPhoneNumber = (phone) => {
  // Remove all spaces and get clean number
  const trimmedPhone = phone.replace(/\s+/g, '');

  // If already has +91, just remove spaces
  if (trimmedPhone.startsWith('+91')) {
    return trimmedPhone;
  }

  // Add +91 prefix if not present
  return `+91${trimmedPhone}`;
};

const AuthPage = () => {
  const [mode, setMode] = useState("login"); // 'login' | 'signup' | 'forgot'
  const [step, setStep] = useState("form"); // 'form' | 'otp'
  const [form, setForm] = useState({ name: "", phone: "", password: "", new_password: "", referralCode: "" });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const { handleGoogleSuccess, login } = useContext(UserContext);
  const navigate = useNavigate();
  if (localStorage.getItem("token")) {
    navigate("/");
  }

  // Handlers
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setInfo("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Only validate phone for login
    const phoneError = validatePhone(form.phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    // Basic check for empty password
    if (!form.password) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(form.phone);
      const res = await login(formattedPhone, form.password);
      if (res.success) {
        setInfo("Login successful!");
        navigate("/");
      } else {
        setError(res.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    // Full validation for signup
    const phoneError = validatePhone(form.phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    const passwordError = validatePassword(form.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(form.phone);
      const res = await axios.post(`${BACKEND_URL}/auth/send-otp`, {
        mobile: formattedPhone,
      });

      if (res.status === 200) {
        setStep("otp");
        setInfo(res.data.message);
      } else {
        setError(res.data.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 409 &&
        error.response.data && error.response.data.message === "User already exists") {
        toast.info("User already exists. Please login with your registered phone number.");
        setMode("login");
        setStep("form");
        setForm({ ...form, phone: form.phone });
      } else {
        console.log("Signup error:", error);
        setError(error.response?.data?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const formattedPhone = formatPhoneNumber(form.phone);
      // console.log(form.name, formattedPhone, form.password, otp)
      const res = await axios.post(`${BACKEND_URL}/auth/verify-otp`, {
        name: form.name,
        mobile: formattedPhone,
        password: form.password,
        referralCode: form.referralCode,
        otp
      });
      ;
      if (res.status === 201) {
        // Account created successfully
        setInfo("Signup successful! Please login.");
        setMode("login");
        setStep("form");
        setForm({ name: "", phone: form.phone, password: "", new_password: "" ,referralCode:""}); // Keep the phone number for easier login
        setOtp("");
      }
    } catch (error) {
      // Handle invalid OTP specifically
      if (error.response && error.response.status === 400) {
        setError("Invalid OTP. Please try again.");
      } else {
        // For other errors
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    // Implementation will be handled by you

    const phoneError = validatePhone(form.phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(form.phone);
      const res = await axios.post(`${BACKEND_URL}/auth/send-otp`, {
        mobile: formattedPhone,
        resetPassword: true,
      });

      if (res.status === 200) {
        setStep("otp");
        setInfo(res.data.message);
      } else {
        setError(res.data.message);
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }

  };

  const handleResetPassVerifyOtp = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const formattedPhone = formatPhoneNumber(form.phone);
      // console.log(form.name, formattedPhone, form.password, otp)
      const res = await axios.post(`${BACKEND_URL}/auth/verify-otp`, {
        mobile: formattedPhone,
        new_password: form.new_password,
        otp
      });
      ;
      if (res.status === 201) {
        // Account created successfully
        setInfo("Password Reset successful! Please login.");
        setMode("login");
        setStep("form");
        setForm({ name: "", phone: form.phone, password: "" }); // Keep the phone number for easier login
        setOtp("");
      }
    } catch (error) {
      // Handle invalid OTP specifically
      if (error.response && error.response.status === 400) {
        setError("Invalid OTP. Please try again.");
      } else {
        // For other errors
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen max-w-[40rem] mx-auto py-20 flex flex-col gap-10 items-center justify-between bg-[#122641] px-4 sm:px-6 lg:px-8">

      <div className="space-y-4 w-full">
        <p className="text-center font-[Teko] tracking-wider text-2xl font-bold text-blue-400">
          Galaxy
        </p>
        <h1 className="text-center text-4xl font-bold text-white font-[Teko] tracking-wider">
          Welcome back
        </h1>
      </div>

      <div className="flex flex-col w-full gap-8">
        <div className=" w-full px-10 rounded-xl animate-fade-out">
          {/* <div className="text-center"> */}
          {/*   <h2 className="mt-6 text-3xl font-extrabold text-gray-900"> */}
          {/*     {mode === "login" ? "Admin Login" : "Admin Signup"} */}
          {/*   </h2> */}
          {/* </div> */}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 animate-slide-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {info && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4 animate-slide-in">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{info}</p>
                </div>
              </div>
            </div>
          )}

          {mode === "login" && (
            <form onSubmit={handleLogin} className="mt-8 space-y-6 animate-slide-in">
              <div className="rounded-md space-y-4">
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="border-gray-700  p-4 rounded-lg text-white outline-2 outline-gray-500 w-full"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="border-gray-700 p-4 rounded-lg text-white outline-2 outline-gray-500 w-full"
                  />
                </div>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => { setMode("forgot"); setStep("form"); setError(""); setInfo(""); }}
                    className="text-sm text-blue-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="group w-full flex justify-center items-center bg-[#1B8DFF] font-[Teko] tracking-wider py-3 text-2xl cursor-pointer rounded-lg text-white font-bold hover:bg-blue-600"
                >
                  {
                    loading
                      ? <LoaderCircle className="animate-spin" />
                      : <span>Login</span>
                  }
                </button>
              </div>

              <div className="text-center">
                <p className="text-center text-sm text-gray-400">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("signup"); setStep("form"); setError(""); setInfo(""); }}
                    className="text-blue-400 hover:underline cursor-pointer"
                  >
                    Signup
                  </button>
                </p>
              </div>
            </form>
          )}

          {mode === "signup" && step === "form" && (
            <form onSubmit={handleSendOTP} className="mt-8 space-y-6 animate-slide-in">
              <div className="rounded-md space-y-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="border-gray-700  p-4 rounded-lg text-white outline-2 outline-gray-500 w-full"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="border-gray-700  p-4 rounded-lg text-white outline-2 outline-gray-500 w-full"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="border-gray-700  p-4 rounded-lg text-white outline-2 outline-gray-500 w-full"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="referralCode"
                    placeholder="Referral Code (Optional)"
                    value={form.referralCode}
                    onChange={handleChange}
                    className="border-gray-700  p-4 rounded-lg text-white outline-2 outline-gray-500 w-full"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="group w-full flex justify-center items-center bg-[#1B8DFF] font-[Teko] tracking-wider py-3 text-2xl cursor-pointer rounded-lg text-white font-bold hover:bg-blue-600"
                >
                  {
                    loading
                      ? <LoaderCircle className="animate-spin" />
                      : <span> Send OTP </span>
                  }
                </button>
              </div>

              <div className="text-center">
                <p className="text-center text-sm text-gray-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setStep("form"); setError(""); setInfo(""); }}
                    className="text-blue-400 hover:underline cursor-pointer"
                  >
                    Login
                  </button>
                </p>
              </div>
            </form>
          )}

          {mode === "signup" && step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6 animate-slide-in">
              <div className="rounded-md">
                <div>
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value); setError(""); setInfo(""); }}
                    required
                    className="border-gray-700  p-4 rounded-lg text-white outline-2 outline-gray-500 w-full"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="group w-full flex justify-center items-center bg-[#1B8DFF] font-[Teko] tracking-wider py-3 text-2xl cursor-pointer rounded-lg text-white font-bold hover:bg-blue-600"
                >
                  {
                    loading
                      ? <LoaderCircle className="animate-spin" />
                      : <span> Verify OTP & Signup </span>
                  }
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setStep("form"); setOtp(""); setError(""); setInfo(""); }}
                  className="font-medium text-blue-400 hover:text-blue-500 focus:outline-none focus:underline transition duration-150 ease-in-out cursor-pointer"
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {mode === "forgot" && step === "form" && (
            <form onSubmit={handleForgotPassword} className="mt-8 space-y-6 animate-slide-in">
              <div className="rounded-md space-y-4">
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="border-gray-700  p-4 rounded-lg text-white outline-2 outline-gray-500 w-full"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="group w-full flex justify-center items-center bg-[#1B8DFF] font-[Teko] tracking-wider py-3 text-2xl cursor-pointer rounded-lg text-white font-bold hover:bg-blue-600"
                >
                  {loading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <span>Send OTP</span>
                  )}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setMode("login"); setStep("form"); setError(""); setInfo(""); }}
                  className="text-sm text-blue-400 hover:underline cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}

          {mode === "forgot" && step === "otp" && (
            <form onSubmit={handleResetPassVerifyOtp} className="mt-8 space-y-6 animate-slide-in">
              <div className="rounded-md space-y-4">
                <div>
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value); setError(""); setInfo(""); }}
                    required
                    className="border-gray-700  p-4 rounded-lg text-white outline-2 outline-gray-500 w-full"
                  />
                </div>
              </div>

              <div>
                <input
                  type="password"
                  name="new_password"
                  placeholder="Create New Password"
                  value={form.new_password}
                  onChange={handleChange}
                  required
                  className="border-gray-700 p-4 rounded-lg text-white outline-2 outline-gray-500 w-full"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="group w-full flex justify-center items-center bg-[#1B8DFF] font-[Teko] tracking-wider py-3 text-2xl cursor-pointer rounded-lg text-white font-bold hover:bg-blue-600"
                >
                  {loading ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <span>Verify OTP & Reset Password</span>
                  )}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setMode("login"); setStep("form"); setError(""); setInfo(""); }}
                  className="text-sm text-blue-400 hover:underline cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 px-10">
          <hr className=" w-[45%]  text-gray-400" />
          <span className=" text-gray-400">OR</span>
          <hr className=" w-[45%]  text-gray-400" />
        </div>

        {/* Alternative login methods */}
        <div className="space-y-6 w-fit self-center">
          {/* <button className="w-full flex justify-start cursor-pointer border-gray-700 p-2 rounded-lg text-xl items-center outline-2 outline-gray-500 text-gray-400">
              <GoogleIcon className="mr-2 h-5 w-5" />
              <span>Continue with Google</span>
            </button> */}
          <GoogleOAuthProvider clientId={CLIENT_ID}>
            <button className="w-full flex justify-start cursor-pointer border-gray-700 p-2 rounded-lg text-xl items-center outline-2 outline-gray-500 text-gray-400">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google Login Failed")}
              />
            </button>
          </GoogleOAuthProvider>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-300">
        <a href="#" className="hover:text-gray-400">
          Terms of Use
        </a>{" "}
        |{" "}
        <a href="#" className="hover:text-gray-400">
          Privacy Policy
        </a>
      </div>
    </div>
  );
};

export default AuthPage; 
