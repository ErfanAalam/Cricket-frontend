import 'react-toastify/dist/ReactToastify.css';
import React from 'react';
import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../../../context/UserContext';
import { toast } from 'react-toastify';
import invitePic from '/assets/Frame.png';              


const InviteFriends = () => {
  const { user } = useContext(UserContext);
  
  useEffect(() => {
    if (!user.referralCode) {
      user.referralCode = `${user.name.split(" ")[0]}${user._id.slice(0, 10)}`;
    }
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    toast.success("Referral code copied!");
  };

  return (
    <div className="min-h-screen text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="backdrop-blur-sm rounded-2xl p-6 md:p-8">
          {/* Info Cards Section */}
          <div className="grid gap-6 mb-8">
            <div className="space-y-6">
              <div className="invite flex flex-col gap-10 items-center justify-center rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                <img src={invitePic} alt="" srcset="" />
                <h1
                className='text-green-500'
                style={{ fontSize: "2rem", fontWeight: "bold" }}
                >EARN DISCOUNTS & BONUS</h1>
                <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center "
                style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
          Invite Friends & Earn Rewards
        </h1>
        
              <div className="bg-blue-700/30 rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                <h2 className="text-xl font-semibold mb-3 text-blue-300">SIGN UPS BONUS</h2>
                <p className="text-gray-300">
                  For every friend that signs up using your referral code, you get 25 Discount XP and your friend gets 25 Discount XP.
                </p>
              </div>
              
              <div className="bg-blue-700/30 rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                <h2 className="text-xl font-semibold mb-3 text-blue-300">DEPOSITS BONUS</h2>
                <p className="text-gray-300">
                  For every first deposit made by your referred friend, you get 250 Discount XP and your friend gets 250 Discount XP.
                </p>
              </div>
              
              <div className="bg-blue-700/30 rounded-xl p-6 transform hover:scale-105 transition-transform duration-300">
                <h2 className="text-xl font-semibold mb-3 text-blue-300">TRADING BONUS</h2>
                <p className="text-gray-300">
                  Discount XP can be used to cover 100% of the order amount (excluding fees) of any buy transaction.
                </p>
              </div>
              </div>
            </div>
          </div>

          {/* Referral Code Section */}
          <div className="text-center space-y-6 mt-8">
            <h2 className="text-2xl font-bold text-blue-300">
              Send them your referral code now !
            </h2>
            <div className="p-6 rounded-lg inline-block min-w-[280px]">
              <code className="text-2xl font-mono tracking-wider text-white">
                {user.referralCode}
              </code>
            </div>
            <button 
              onClick={handleCopyCode}
              className="bg-blue-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg
                       transform hover:scale-105 transition-all duration-300 shadow-lg
                       flex items-center justify-center gap-2 mx-auto"
            >
              <span>Copy Code</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2H6zm0-2h8a4 4 0 014 4v11a4 4 0 01-4 4H6a4 4 0 01-4-4V5a4 4 0 014-4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteFriends;