import { useContext, useState } from "react";
import { UserContext } from "../../../Context/UserContext";
import { useNavigate } from "react-router-dom";
import GoogleIcon from "../../GoogleIcon/GoogleIcon";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { toast } from "react-toastify";


export default function Signup() {
  const { Name,setuserName,SignupPhone, setSignupPhone, sendOtp, handleGoogleSuccess } =
    useContext(UserContext);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleNext = async (e) => {
    e.preventDefault();

    let phoneNumber = SignupPhone.trim();

    // Remove spaces, dashes, or non-numeric characters
    phoneNumber = phoneNumber.replace(/\D/g, "");

    // Ensure it starts with +91
    if (!phoneNumber.startsWith("91")) {
      phoneNumber = `91${phoneNumber}`;
    }

    phoneNumber = `+${phoneNumber}`;

    const phoneRegex = /^\+91[6-9]\d{9}$/;

    if (!phoneRegex.test(phoneNumber)) {
      setError(
        "Invalid phone number. Must be a valid Indian number (+91XXXXXXXXXX)."
      );
      return;
    }

    setSignupPhone(phoneNumber);

    setError("");

    try {
      const response = await sendOtp(Name,phoneNumber);

      if (response?.message === "OTP sent successfully") {
        toast.success(response?.message);
        navigate("/verifyOtp");
      } else if (response?.message === "User already exist") {
        toast.info(
          "User already exist. Please login with your registered phone number."
        );
        navigate("/login");
      } else {
        toast.error(response?.error || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="w-full font-[Teko] tracking-wider max-w-full text-center bg-[#1671CC] py-6 text-4xl  font-bold text-white">
        Get Start
      </div>
      <div className="flex  flex-col min-h-screen py-10 p-4 items-center justify-center ">
        <div className="w-full max-w-md space-y-10 ">
          {/* Header */}
          <div className="space-y-4">
            <p className="text-center font-[Teko] tracking-wider text-2xl font-bold text-blue-400">
              Galaxy
            </p>
            <h1 className="text-center text-4xl font-bold text-white font-[Teko] tracking-wider">
              Create an account
            </h1>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="space-y-2">
            <input
                type="text"
                placeholder="Username*"
                className="border-gray-700 cursor-pointer  p-4 rounded-lg text-white outline-2 outline-gray-500 w-full"
                value={Name}
                onChange={(e) => {
                  setuserName(e.target.value);
                  setError("");
                }}
              />
            </div>
              <input
                type="text"
                placeholder="Phone Number*"
                className="border-gray-700 cursor-pointer  p-4 rounded-lg text-white outline-2 outline-gray-500 w-full"
                value={SignupPhone}
                onChange={(e) => {
                  setSignupPhone(e.target.value);
                  setError("");
                }}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
             
            <button
              className="w-full bg-[#1B8DFF] font-[Teko] tracking-wider py-3 text-2xl cursor-pointer rounded-lg text-white font-bold hover:bg-blue-600"
              onClick={handleNext}
            >
              Continue
            </button>
            <p className="text-center text-sm text-gray-400">
              If I have an account?{" "}
              <button
                href="#"
                className="text-blue-400 hover:underline cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <hr className=" w-[45%]  text-gray-400" />
            <span className=" text-gray-400">OR</span>
            <hr className=" w-[45%]  text-gray-400" />
          </div>

          {/* Alternative login methods */}
          <div className="space-y-6">
            {/* <button className="w-full flex justify-start cursor-pointer border-gray-700 p-2 rounded-lg text-xl items-center outline-2 outline-gray-500 text-gray-400"
            onClick={handleGoogleLogin}
            >
              <GoogleIcon className="mr-2 h-5 w-5" />
              <span>Continue with Google</span>
            </button> */}
            <GoogleOAuthProvider clientId="705501120220-17knjq3r5ci08tr7guusfpfa4ta0pblh.apps.googleusercontent.com">
              <button className="w-full flex justify-start cursor-pointer border-gray-700 p-2 rounded-lg text-xl items-center outline-2 outline-gray-500 text-gray-400">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google Login Failed")}
              />
              </button>
            </GoogleOAuthProvider>
          </div>

          {/* Footer */}
          <div className="pt-4 text-center text-md text-gray-300 mt-20">
            <a href="#" className="hover:text-gray-400">
              Terms of Use
            </a>{" "}
            |{" "}
            <a href="#" className="hover:text-gray-400">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
