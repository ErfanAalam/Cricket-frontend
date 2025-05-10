import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserContext } from "../../../Context/UserContext";
import { encrypt, generateAlphaCode } from "../../../lib/actions";
import invitePic from "/assets/Frame.png";
import Navbar from "../Navbar/Navbar";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

const InviteFriends = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [generatedCode, setGeneratedCode] = useState("");
  const { user } = useContext(UserContext);

  const handleGenerateCode = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    const phone = user.mobile;
    const newCode = `CRST-${encrypt(
      phone.replace("+", "")
    )}-${generateAlphaCode()}`;
    setGeneratedCode(newCode);
    toast.success("New referral code generated!");

    setIsGenerating(true);
    setCooldown(10);

    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No token found, user not logged in");
      return;
    }

    const data = await fetch(`${BACKEND_URL}/auth/add-referral-code`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        referralCode: newCode,
      }),
    });
    const status = data.status;
    if (status !== 200) {
      console.error("LOL");
    }

    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsGenerating(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast.success("Referral code copied!");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white p-6 md:p-12 flex flex-col justify-between">
        <div className="text-center space-y-8">
          <img src={invitePic} alt="Invite" className="mx-auto w-32 md:w-40" />
          <h1 className="text-green-500 text-3xl font-bold tracking-wide">
            Earn Discounts & Bonus
          </h1>
          <p className="text-xl md:text-2xl font-semibold text-blue-200">
            Invite Friends & Earn Rewards
          </p>

          <div className="space-y-6 mt-10">
            <button
              onClick={handleGenerateCode}
              disabled={isGenerating}
              className={`${
                isGenerating
                  ? "bg-green-800 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform ${
                !isGenerating ? "hover:translate-y-[-2px] hover:shadow-xl" : ""
              }`}
            >
              {isGenerating ? `Wait for ${cooldown}s` : "New Referral Code"}
            </button>
            {generatedCode && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex flex-col py-3 px-6 rounded-xl">
                  <code className="text-2xl font-mono tracking-widest text-green-300">
                    {generatedCode}
                  </code>
                </div>
                <button
                  onClick={() => handleCopyCode(generatedCode)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-full transition transform hover:scale-105"
                >
                  Copy Code
                </button>
                <p className="text-sm text-blue-200 font-medium">
                  Referral codes are valid for{" "}
                  <span className="text-green-400 font-bold">24 hours</span>{" "}
                  only.
                </p>
              </div>
            )}{" "}
          </div>
        </div>

        <div className="mt-16 space-y-6">
          <div className="bg-blue-800/30 p-6 rounded-xl transition hover:scale-[1.02]">
            <h3 className="text-xl font-semibold text-blue-400">
              SIGN UP BONUS
            </h3>
            <p className="text-gray-300">
              Invite a friend and get{" "}
              <span className="text-green-400 font-bold">25 Discount XP</span>{" "}
              when they sign up. Your friend also gets 25 XP!
            </p>
          </div>

          <div className="bg-blue-800/30 p-6 rounded-xl transition hover:scale-[1.02]">
            <h3 className="text-xl font-semibold text-blue-400">
              DEPOSIT BONUS
            </h3>
            <p className="text-gray-300">
              When your friend makes their first deposit, you both earn{" "}
              <span className="text-green-400 font-bold">250 Discount XP</span>.
            </p>
          </div>

          <div className="bg-blue-800/30 p-6 rounded-xl transition hover:scale-[1.02]">
            <h3 className="text-xl font-semibold text-blue-400">
              TRADING BONUS
            </h3>
            <p className="text-gray-300">
              Use your earned XP to cover{" "}
              <span className="text-green-400 font-bold">
                100% of the order amount
              </span>{" "}
              (excluding fees) on buy trades.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default InviteFriends;
