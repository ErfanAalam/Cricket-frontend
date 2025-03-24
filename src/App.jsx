import {useState } from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import "./App.css";
import Signup from "./components/Auth/SignUp/Signup";
import Preloader from "./components/preloader/Preloader";
import { UserProvider } from "./Context/UserContext";
import SetPassword from "./components/Auth/SignUp/SetPassword";
import VerifyOTP from "./components/Auth/SignUp/VerifyOTP";
import Home from "./components/Dashboard/Home";
import Login from "./components/Auth/Login/Login";
import VerifyPass from "./components/Auth/Login/VerifyPass";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import ForgetPass from "./components/Auth/Forgetpass/ForgetPass";
import ForgetVerifyOtp from "./components/Auth/Forgetpass/ForgetVerifyOtp";
import ChangePass from "./components/Auth/Forgetpass/ChangePass";
// import  UserContext  from "./Context/Context";

function App() {
  const [loading, setLoading] = useState(true);


  return (
    <UserProvider>
       {loading ? (
        <Preloader onComplete={() => setLoading(false)} />
      ) : (
        <Router>
          <Routes>
            <Route path="/" element={<Signup />} />
            <Route path="/verifyOtp" element={<VerifyOTP />} />
            <Route path="/setpassword" element={<SetPassword />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verifypass" element={<VerifyPass />} />
            <Route path="/forgot-password" element={<ForgetPass/>}/> 
            <Route path="/forgot-password/verify-password" element={<ForgetVerifyOtp/>}/> 
            <Route path="/forgot-password/changePass" element={<ChangePass/>} />
            <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
          </Routes>
        </Router>
       )} 

    </UserProvider>
  );
}

export default App;
