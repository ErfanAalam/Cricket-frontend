import { createContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
// Create Context
export const UserContext = createContext();

// Provider Component
export const UserProvider = ({ children }) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const socket = useRef(null);

  // SignUp related states
  const [user, setUser] = useState(null);
  const [SignupPhone, setSignupPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [LoginPhone, setLoginPhone] = useState("");
  const [ForgetPhone, setForgetPhone] = useState("");
  const [OTP, SetOTP] = useState("");

  // Match data states
  const [matchData, setMatchData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [seriesMatchData, setSeriesMatchData] = useState(null);

  // Authentication Methods
  const sendOtp = async (Name, phonenumber,referralCode) => {
    const response = await axios.post(`${BACKEND_URL}/auth/send-otp`, {
      name: Name,
      mobile: phonenumber,
      referredBy: referralCode,
    });
    return response.data;
  };

  const sendForgotPasswordOtp = async (phonenumber) => {
    const response = await axios.post(
      `${BACKEND_URL}/auth/forgot-password/sendOtp`,
      { mobile: phonenumber }
    );
    return response.data;
  };

  const Updatepassword = async (mobile, newPassword) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/change-password`, {
        mobile,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Password Update Error:", error);
      return {
        error: error.response?.data?.message || "Password update failed",
      };
    }
  };

  const verifyOtp = async (mobile, otp) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/verify-otp`, {
        mobile,
        otp,
      });
      return response.data;
    } catch (error) {
      console.error("OTP Verification Error:", error);
      return {
        error: error.response?.data?.message || "OTP verification failed",
      };
    }
  };

  const setPasswordHandler = async (mobile, password) => {
    await axios.post(`${BACKEND_URL}/auth/set-password`, { mobile, password });
    alert("Signup complete! Now you can login");
  };

  const login = async (mobile, password) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/login`, {
        mobile,
        password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        alert("Login successful! Welcome to Dashboard.");
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const tokenId = credentialResponse.credential;

    if (!tokenId) {
      alert("Google authentication failed!");
      return;
    }

    const response = await axios.post(`${BACKEND_URL}/auth/google-login`, {
      tokenId,
    });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      alert("Login successful! Welcome to Dashboard.");
      window.location.href = "/";
      return { success: true, message: response.data.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
  };

  // Fetch Matches with improved error handling and live match selection
  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${BACKEND_URL}/matches/all-stored-matches`
      );

      const extractedMatches =
        response.data?.matches?.flatMap(
          (series) =>
            series.matchScheduleList?.flatMap(
              (schedule) =>
                schedule.matchInfo?.map((match) => ({
                  matchId: match.matchId || null,
                  seriesName: schedule.seriesName || "Series Not Available",
                  format: match.matchFormat || "Format Not Available",
                  team1: match.team1?.teamName || "Team 1",
                  team2: match.team2?.teamName || "Team 2",
                  startDate: match.startDate ? Number(match.startDate) : null,
                  venue: match.venueInfo?.ground || "Venue Not Available",
                  isMatchComplete: match.isMatchComplete,
                })) || []
            ) || []
        ) || [];

      // Filter today's live matches
      const today = new Date();
      const todayMatches = extractedMatches.filter((match) => {
        if (!match.startDate) return false;
        const matchDate = new Date(match.startDate);
        return (
          matchDate.getDate() === today.getDate() &&
          matchDate.getMonth() === today.getMonth() &&
          matchDate.getFullYear() === today.getFullYear() &&
          (match.format === "T20" || match.seriesName.includes("IPL"))
        );
      });

      setMatchData(todayMatches);

      // Organize matches by series - only include present and future T20/IPL matches
      const currentTime = new Date().getTime();
      const matchesBySeries = extractedMatches.reduce((acc, match) => {
        // Only include T20 or IPL matches that haven't started yet or are ongoing
        if (
          match.startDate &&
          match.startDate >= currentTime &&
          (match.format === "T20" || match.seriesName.includes("IPL"))
        ) {
          if (!acc[match.seriesName]) {
            acc[match.seriesName] = [];
          }
          acc[match.seriesName].push(match);
        }
        return acc;
      }, {});
      setSeriesMatchData(matchesBySeries);

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch matches:", error);
      setError(error.message);
      setIsLoading(false);
      toast.error("Failed to fetch matches. Please check your connection.");
    }
  };

  useEffect(() => {
    const connectSocket = () => {
      socket.current = io(BACKEND_URL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        transports: ["websocket", "polling"],
        withCredentials:true,
        timeout: 20000,
      });

      socket.current.on("connect", () => {
        console.log("Connected to WebSocket server");

        const savedMatch = localStorage.getItem("SelectedMatch");
        if (savedMatch) {
          try {
            const matchData = JSON.parse(savedMatch);
            if (matchData && matchData.matchId) {
              console.log("Auto-resubscribing to match:", matchData.matchId);
              socket.current.emit("subscribeMatch", matchData);
              setSelectedMatch(matchData);

              const savedScoreData = localStorage.getItem("MatchData");
              if (savedScoreData) {
                setScoreData(JSON.parse(savedScoreData));
              }
            }
          } catch (e) {
            console.error("Error parsing saved match data:", e);
          }
        }
      });

      socket.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        toast.error("Connection error. Retrying...");
      });

      socket.current.on("connect_timeout", (timeout) => {
        console.error("Socket connection timeout:", timeout);
        toast.error("Connection timeout. Please try again.");
      });
      socket.current.on("reconnect_attempt", (attempt) => {
        console.log("Reconnecting to WebSocket server, attempt:", attempt);
        toast.info(`Reconnecting to server... Attempt: ${attempt}`);
      });

      socket.current.on("disconnect", (reason) => {
        console.log("Disconnected from WebSocket server:", reason);
        if (reason === "io server disconnect") {
          socket.current.connect();
        }
      });

      socket.current.on("scoreUpdate", (data) => {
        // console.log("Received live score update:", data);
        setScoreData(data);
        localStorage.setItem("MatchData", JSON.stringify(data));
      });
    };

    connectSocket();

    // Detect browser back/forward navigation and manual URL changes
    if (
      window.location.pathname !== "/betting-interface" &&
      window.location.pathname !== "/team-stats"
    ) {
      const savedMatch = localStorage.getItem("SelectedMatch");
      if (savedMatch && socket.current) {
        try {
          const matchData = JSON.parse(savedMatch);
          if (matchData?.matchId) {
            console.log(
              "User navigated away. Unsubscribing:",
              matchData.matchId
            );
            socket.current.emit("unsubscribeMatch", matchData.matchId);
            localStorage.removeItem("SelectedMatch");
          }
        } catch (e) {
          console.error("Error unsubscribing on popstate:", e);
        }
      }
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  // console.log(matchData);

  // Manually select and start polling for a specific match
  const handleGetScore = async (match) => {
    // If already subscribed to a match, unsubscribe first
    if (selectedMatch && selectedMatch.matchId) {
      socket.current.emit("unsubscribeMatch", selectedMatch.matchId);
    }

    setSelectedMatch(match);
    localStorage.setItem("SelectedMatch", JSON.stringify(match));

    // Subscribe to live score updates for the new match
    socket.current.emit("subscribeMatch", match);
    toast.info(`Selected Match: ${match.team1} vs ${match.team2}`);
    window.location.href = "/betting-interface";
  };

  // Cleanup on component unmount
  useEffect(() => {
    fetchMatches();

    // Cleanup function
    return () => {
      // Cleanup code here
    };
  }, []);

  // Format date utility
  const formatDate = (timestamp) => {
    return timestamp
      ? new Date(Number(timestamp)).toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Date Not Available";
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found, user not logged in");
        return;
      }

      const response = await fetch(`${BACKEND_URL}/auth/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();

      setUser(data.user);

      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      fetchUserData();
      return;
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = localStorage.getItem("token"); // Get user token
      const response = await fetch(`${BACKEND_URL}/api/upload-profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Send token for authentication
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
      } else {
        throw new Error(data.message || "Profile update failed");
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
    }
  };

  // For the user who logged in using Google SignIn

  const VerifyMobile = async (mobile) => {
    try {
      const token = localStorage.getItem("token"); // Get user token
      const response = await fetch(`${BACKEND_URL}/auth/verify-mobile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile }),
      });

      if (!response.ok) {
        throw new Error("Failed to send OTP");
      }

      const data = await response.json();
      toast.success(data?.message);
    } catch (error) {
      console.error("Error sending otp:", error);
      toast.error(error.message);
    }
  };

  const verifyMobileOtp = async (mobile, otp) => {
    try {
      const token = localStorage.getItem("token"); // Get user token
      const response = await fetch(`${BACKEND_URL}/auth/verify-mobile-otp`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp, mobile }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(response.message);
        throw new Error("Failed to verify OTP");
      }

      console.log("Mobile OTP verified:", data);
      toast.success(data?.message);
    } catch (error) {
      console.error("Error verifying mobile OTP:", error);
      // toast.error(error.message);
    }
  };

  const setPortfolio = async (portfolioData) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BACKEND_URL}/portfolio/set-portfolio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          matchId: portfolioData.MatchId,
          playerId: portfolioData.playerId,
          playerName: portfolioData.playerName,
          team: portfolioData.team,
          initialPrice: portfolioData.initialPrice,
          price: portfolioData.price, // Changed from initialPrice
          quantity: portfolioData.quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update portfolio");
      }

      return data.portfolio;
    } catch (error) {
      console.error("Error updating portfolio:", error);
      throw error;
    }
  };

  // Add a sell function
  const sellPortfolio = async (sellData) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BACKEND_URL}/portfolio/sell-portfolio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          matchId: sellData.MatchId,
          playerId: sellData.playerId,
          price: sellData.price,
          quantity: sellData.quantity,
          autoSold: sellData.autoSold || false,
          reason: sellData.reason || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to sell stocks");
      }

      return data.portfolio;
    } catch (error) {
      console.error("Error selling stocks:", error);
      throw error;
    }
  };

  const getPortfolio = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BACKEND_URL}/portfolio/get-portfolio`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch portfolio");
      }

      return data.portfolio;
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      throw error;
    }
  };

  // Team Portfolio Functions for userContext

  const setTeamPortfolio = async (teamPortfolioData) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BACKEND_URL}/portfolio/set-team-portfolio`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            matchId: teamPortfolioData.MatchId,
            teamId: teamPortfolioData.teamId,
            teamName: teamPortfolioData.teamName,
            initialPrice: teamPortfolioData.initialPrice,
            price: teamPortfolioData.price,
            quantity: teamPortfolioData.quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update team portfolio");
      }

      return data.teamPortfolio;
    } catch (error) {
      console.error("Error updating team portfolio:", error);
      throw error;
    }
  };

  const sellTeamPortfolio = async (sellData) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BACKEND_URL}/portfolio/sell-team-portfolio`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            matchId: sellData.MatchId,
            teamId: sellData.teamId,
            price: sellData.price,
            quantity: sellData.quantity,
            autoSold: sellData.autoSold || false,
            reason: sellData.reason || "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to sell team stocks");
      }

      return data.teamPortfolio;
    } catch (error) {
      console.error("Error selling team stocks:", error);
      throw error;
    }
  };

  const getTeamPortfolio = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BACKEND_URL}/portfolio/get-team-portfolio`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch team portfolio");
      }

      return data.teamPortfolio;
    } catch (error) {
      console.error("Error fetching team portfolio:", error);
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{
        // Authentication methods
        user,
        SignupPhone,
        setSignupPhone,
        OTP,
        SetOTP,
        LoginPhone,
        setLoginPhone,
        confirmPassword,
        setConfirmPassword,
        sendOtp,
        verifyOtp,
        setPasswordHandler,
        login,
        logout,
        handleGoogleSuccess,
        ForgetPhone,
        setForgetPhone,
        sendForgotPasswordOtp,
        Updatepassword,

        // Match-related data and methods
        matchData,
        isLoading,
        error,
        selectedMatch,
        scoreData,
        seriesMatchData,
        handleGetScore,
        formatDate,

        // uploadProfileImage
        uploadImage,
        VerifyMobile,
        verifyMobileOtp,

        // portfolio routes
        setPortfolio,
        sellPortfolio,
        getPortfolio,

        // New team portfolio functions
        setTeamPortfolio,
        sellTeamPortfolio,
        getTeamPortfolio,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
