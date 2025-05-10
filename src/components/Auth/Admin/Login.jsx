import React, { useContext, useState } from "react";
import { UserContext } from "../../../Context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { LoaderCircle } from "lucide-react"

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

const Login = () => {
  const [mode, setMode] = useState("login"); // 'login' | 'signup' | 'forgot'
  const [step, setStep] = useState("form"); // 'form' | 'otp'
  const [form, setForm] = useState({ name: "", phone: "", password: "", newPassword: "" });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  if (localStorage.getItem("token")) {
    navigate("/admin/dashboard");
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
        name: form.name,
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
      console.log(form.name, formattedPhone, form.password, otp)
      const res = await axios.post(`${BACKEND_URL}/auth/verify-otp`, {
        name: form.name,
        mobile: formattedPhone,
        password: form.password,
        otp
      });
      ;
      if (res.status === 201) {
        // Account created successfully
        setInfo("Signup successful! Please login.");
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

  // Add this empty handler for forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    // Implementation will be handled by you
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg animate-fade-in">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {mode === "login" ? "Admin Login" : mode === "signup" ? "Admin Signup" : "Forgot Password"}
          </h2>
        </div>

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
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition duration-150 ease-in-out"
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
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition duration-150 ease-in-out"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => { setMode("forgot"); setStep("form"); setError(""); setInfo(""); setForm({ ...form, password: "" }); }}
                  className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline transition duration-150 ease-in-out"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-[1.02]"
              >
                {loading ? <LoaderCircle className="animate-spin" /> : <span>Login</span>}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setStep("form"); setError(""); setInfo(""); }}
                  className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline transition duration-150 ease-in-out"
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
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition duration-150 ease-in-out"
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
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition duration-150 ease-in-out"
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
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition duration-150 ease-in-out"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-[1.02]"
              >
                {
                  loading
                    ? <LoaderCircle className="animate-spin" />
                    : <span> Send OTP </span>
                }
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); setStep("form"); setError(""); setInfo(""); }}
                  className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline transition duration-150 ease-in-out"
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
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition duration-150 ease-in-out"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-[1.02]"
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
                className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline transition duration-150 ease-in-out"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {mode === "forgot" && (
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
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition duration-150 ease-in-out"
                />
              </div>
              {step === "otp" && (
                <>
                  <div>
                    <input
                      type="text"
                      name="otp"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => { setOtp(e.target.value); setError(""); setInfo(""); }}
                      required
                      className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition duration-150 ease-in-out"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="New Password"
                      value={form.newPassword}
                      onChange={handleChange}
                      required
                      className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition duration-150 ease-in-out"
                    />
                  </div>
                </>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-[1.02]"
              >
                {loading ? <LoaderCircle className="animate-spin" /> : <span>{step === "form" ? "Send OTP" : "Reset Password"}</span>}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setMode("login"); setStep("form"); setError(""); setInfo(""); setForm({ ...form, newPassword: "" }); setOtp(""); }}
                className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline transition duration-150 ease-in-out"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login; 
