import {useEffect, useState } from "react";
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
import CurrentMatch from "./components/Dashboard/CurrentMatches/CurrentMatch";
import BettingInterface from "./components/Dashboard/mini-components/BettingInterface";
import {ToastContainer} from 'react-toastify'
import UserProfile from "./components/Dashboard/Profile/UserProfile";
import Portfolio from "./components/Dashboard/mini-components/Portfolio";
import Teamstats from "./components/Dashboard/mini-components/Teamstats";
import Contact from "./components/Dashboard/StaticComponents/Contact";
import About from "./components/Dashboard/StaticComponents/About";
import Transactions from './components/Dashboard/Transactions';
import Withdraw from './components/Dashboard/Withdraw';
import KYCVerification from './components/Dashboard/KYC';
import InviteFriends from './components/Dashboard/Invite';
import TermsAndConditions from './components/Dashboard/Legal/TermsAndConditions';
import PrivacyPolicy from './components/Dashboard/Legal/PrivacyPolicy';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasSeenLoader = sessionStorage.getItem("hasSeenLoader");

    if (!hasSeenLoader) {
      setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem("hasSeenLoader", "true");
      }, 4100); // Adjust the time as needed
    } else {
      setLoading(false);
    }
  }, []);

  return (
    
    <UserProvider>
       {loading ? (
         <Preloader onComplete={() => setLoading(false)} />
        ) : (
          <>
            <ToastContainer position="top-right" autoClose={1500} />
          <Router>
          <Routes>
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/betting-interface" element={<PrivateRoute><BettingInterface /></PrivateRoute>} />
            <Route path="/live-matches" element={<PrivateRoute><CurrentMatch /></PrivateRoute>} />
            <Route path="/UserProfile" element={<PrivateRoute><UserProfile/></PrivateRoute>}/>
            <Route path="/portfolio" element={<PrivateRoute><Portfolio /></PrivateRoute>} />
            <Route path="/team-stats" element={<PrivateRoute><Teamstats /></PrivateRoute>} />
            <Route path="/contact" element={<PrivateRoute><Contact /></PrivateRoute>} />
            <Route path="/about" element={<PrivateRoute><About /></PrivateRoute>} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/kyc" element={<KYCVerification />} />
            <Route path="/invite" element={<InviteFriends />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />          
            <Route path="/signup" element={<Signup />} />
            <Route path="/verifyOtp" element={<VerifyOTP />} />
            <Route path="/setpassword" element={<SetPassword />} />
            <Route path="/login" element={<Login />} />
            <Route path="/verifypass" element={<VerifyPass />} />
            <Route path="/forgot-password" element={<ForgetPass/>}/> 
            <Route path="/forgot-password/verify-password" element={<ForgetVerifyOtp/>}/> 
            <Route path="/forgot-password/changePass" element={<ChangePass/>} />
            <Route path="/*" element={<>No Such Endpoints</>} />

          </Routes>
        </Router>
          </>
       )} 

    </UserProvider>
  );
}

export default App;
