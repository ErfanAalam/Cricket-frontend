import React, { useContext, useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import { UserContext } from "../../../Context/UserContext";
import { toast } from "react-toastify";
import dmdp from "/assets/dmdp.png";

const Portfolio = () => {
  const {
    setPortfolio,
    sellPortfolio,
    getPortfolio,
    setTeamPortfolio,
    sellTeamPortfolio,
    getTeamPortfolio,
  } = useContext(UserContext);

  // Player portfolio states
  const [portfolio, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Team portfolio states
  const [teamPortfolio, setTeamPortfolioData] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);

  // Shared states
  const [allMatchData, setAllMatchdata] = useState([]);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [stockCount, setStockCount] = useState(1);
  const [actionType, setActionType] = useState(""); // "buy" or "sell"
  const [player, setPlayer] = useState({});
  const [team, setTeam] = useState({});
  const [isLoading, setIsLoading] = useState(false); // for stock purchase
  const [processedMatches, setProcessedMatches] = useState({}); // Track processed matches to avoid duplicates
  const [activeTab, setActiveTab] = useState("players"); // "players" or "teams"
  const [selectedEntity, setSelectedEntity] = useState("player"); // "player" or "team"

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Fetch player portfolio
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await getPortfolio();
        setPortfolioData(data);
        setLoading(false);
      } catch (error) {
        toast.error("Error fetching player portfolio");
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [getPortfolio]);

  // Fetch team portfolio
  useEffect(() => {
    const fetchTeamPortfolio = async () => {
      try {
        const data = await getTeamPortfolio();
        setTeamPortfolioData(data);
        setTeamLoading(false);
      } catch (error) {
        toast.error("Error fetching team portfolio");
        setTeamLoading(false);
      }
    };

    fetchTeamPortfolio();
  }, [getTeamPortfolio]);

  // Fetch match data and handle auto-selling
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/match-scores/all-scores`);
        const data = await response.json();
        setAllMatchdata(data.matchScores);

        // Process auto-selling after fetching match data
        if (portfolio.length > 0) {
          checkAndAutoSellStocks(data.matchScores);
        }

        // Process auto-selling for team stocks
        if (teamPortfolio.length > 0) {
          checkAndAutoSellTeamStocks(data.matchScores);
        }
      } catch (error) {
        console.error("Error fetching match scores:", error);
      }
    };

    fetchScores();
    const interval = setInterval(fetchScores, 10000);

    return () => clearInterval(interval);
  }, [portfolio, teamPortfolio]);

  // Function to calculate team price based on match data
  const calculateTeamPrice = (matchData, initialPrice) => {
    if (!matchData || Object.keys(matchData).length === 0) return initialPrice;

    const innings = matchData?.innings || [];
    const currentInnings = innings.length === 2 ? innings[1] : innings[0];
    if (!currentInnings) return initialPrice;

    const batsmenData = currentInnings?.batsmen || [];

    // Calculate initial team price based on target score
    let calculatedTeamPrice = Number(initialPrice);
    if (innings.length === 2 && currentInnings === innings[1]) {
      const targetScore = innings[0]?.score;
      if (targetScore >= 220)
        calculatedTeamPrice = Math.max(calculatedTeamPrice, 70);
      else if (targetScore >= 200)
        calculatedTeamPrice = Math.max(calculatedTeamPrice, 65);
      else if (targetScore >= 180)
        calculatedTeamPrice = Math.max(calculatedTeamPrice, 60);
      else if (targetScore >= 160)
        calculatedTeamPrice = Math.max(calculatedTeamPrice, 55);
    }

    // Adjust team price based on player performance
    batsmenData.forEach((batsman) => {
      calculatedTeamPrice += (batsman.runs || 0) * 0.1;
      if (batsman.wicketCode && batsman.wicketCode.toLowerCase() !== "") {
        calculatedTeamPrice *= 0.85;
      }
    });

    return parseFloat(calculatedTeamPrice.toFixed(2));
  };

  // Function to check and auto-sell team stocks based on conditions
  const checkAndAutoSellTeamStocks = async (matchData) => {
    const currentTeamHoldings = [];

    teamPortfolio.forEach((item) => {
      const buys = item.transactions
        .filter((tx) => tx.type === "buy")
        .map((tx) => ({ ...tx }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      const sells = item.transactions
        .filter((tx) => tx.type === "sell")
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      for (let sell of sells) {
        let qtyToSell = sell.quantity;
        while (qtyToSell > 0 && buys.length > 0) {
          const buy = buys[0];
          const usedQty = Math.min(qtyToSell, buy.quantity);
          buy.quantity -= usedQty;
          qtyToSell -= usedQty;
          if (buy.quantity === 0) buys.shift();
        }
      }

      const remainingStocks = buys.reduce(
        (total, buy) => total + buy.quantity,
        0
      );

      if (remainingStocks > 0) {
        currentTeamHoldings.push({
          teamId: item.teamId,
          matchId: item.matchId,
          teamName: item.teamName,
          initialPrice: item.initialPrice,
          quantity: remainingStocks,
        });
      }
    });

    for (const holding of currentTeamHoldings) {
      const match = matchData.find(
        (m) => m.matchId.toString() === holding.matchId.toString()
      );

      if (!match) continue;

      const holdingKey = `team-${holding.matchId}-${holding.teamId}`;

      // Determine if holding team is 1st or 2nd inning team
      const firstInningTeamId = match.innings?.[0]?.battingTeamId?.toString();
      const isFirstInningTeam = holding.teamId.toString() === firstInningTeamId;

      const firstInningsCompleted = match.innings.length >= 2;
      const isMatchCompleted = match.isMatchComplete === true;

      const shouldAutoSell =
        isMatchCompleted || (isFirstInningTeam && firstInningsCompleted);

      if (shouldAutoSell && !processedMatches[holdingKey]) {
        try {
          const currentPrice = calculateTeamPrice(match, holding.initialPrice);

          const sellData = {
            MatchId: holding.matchId,
            teamId: holding.teamId,
            teamName: holding.teamName,
            initialPrice: holding.initialPrice,
            price: currentPrice,
            quantity: holding.quantity,
            autoSold: true,
            reason: isMatchCompleted ? "match_completed" : "innings_completed",
          };

          await sellTeamPortfolio(sellData);

          toast.info(
            `Auto-sold ${holding.quantity} team stock(s) of ${holding.teamName} - Reason: ${sellData.reason}`
          );

          setProcessedMatches((prev) => ({
            ...prev,
            [holdingKey]: true,
          }));

          const updatedTeamPortfolio = await getTeamPortfolio();
          setTeamPortfolioData(updatedTeamPortfolio);
        } catch (error) {
          console.error(
            `Auto-sell failed for team ${holding.teamName}:`,
            error
          );
          toast.error(`Failed to auto-sell ${holding.teamName}'s stocks`);
        }
      }
    }
  };

  // Function to check and auto-sell player stocks based on conditions
  const checkAndAutoSellStocks = async (matchData) => {
    const currentHoldings = [];

    portfolio.forEach((item) => {
      const buys = item.transactions
        .filter((tx) => tx.type === "buy")
        .map((tx) => ({ ...tx }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      const sells = item.transactions
        .filter((tx) => tx.type === "sell")
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      for (let sell of sells) {
        let qtyToSell = sell.quantity;
        while (qtyToSell > 0 && buys.length > 0) {
          const buy = buys[0];
          const usedQty = Math.min(qtyToSell, buy.quantity);
          buy.quantity -= usedQty;
          qtyToSell -= usedQty;
          if (buy.quantity === 0) buys.shift();
        }
      }

      const remainingStocks = buys.reduce(
        (total, buy) => total + buy.quantity,
        0
      );

      if (remainingStocks > 0) {
        currentHoldings.push({
          playerId: item.playerId,
          matchId: item.matchId,
          playerName: item.playerName,
          team: item.team,
          initialPrice: item.initialPrice,
          quantity: remainingStocks,
        });
      }
    });

    for (const holding of currentHoldings) {
      const match = matchData.find(
        (m) => m.matchId.toString() === holding.matchId.toString()
      );

      if (!match) continue;

      const holdingKey = `${holding.matchId}-${holding.playerId}`;
      const isMatchCompleted = match.isMatchComplete == true;

      // Player status & innings tracking
      let playerOut = false;
      let playerData = null;
      let playerInningsIndex = null;

      if (match.innings) {
        for (let i = 0; i < match.innings.length; i++) {
          const inning = match.innings[i];
          const batsmanData = inning.batsmen.find(
            (p) => p.id?.toString() === holding.playerId.toString()
          );

          if (batsmanData) {
            playerData = batsmanData;
            playerInningsIndex = i; // 0 = 1st innings, 1 = 2nd innings
            playerOut = batsmanData.wicketCode !== "";
            break;
          }
        }
      }

      // Determine if 1st innings is completed (innings length is 2)
      const isFirstInningsCompleted = match.innings?.length === 2;

      // Auto-sell logic
      const shouldAutoSell =
        playerOut ||
        (playerInningsIndex === 0 && isFirstInningsCompleted) || // Player in 1st innings and it completed
        (playerInningsIndex === 1 && isMatchCompleted); // Player in 2nd innings and match completed

      if (shouldAutoSell && !processedMatches[holdingKey]) {
        try {
          const currentPrice = calculateUpdatedPrice(
            playerData,
            holding.initialPrice
          );

          const sellData = {
            MatchId: holding.matchId,
            playerId: holding.playerId,
            playerName: holding.playerName,
            team: holding.team,
            initialPrice: holding.initialPrice,
            price: currentPrice,
            quantity: holding.quantity,
            autoSold: true,
            reason: playerOut
              ? "player_out"
              : playerInningsIndex === 0
              ? "first_innings_completed"
              : "match_completed",
          };

          await sellPortfolio(sellData);

          toast.info(
            `Auto-sold ${holding.quantity} stock(s) of ${holding.playerName} - Reason: ${sellData.reason}`
          );

          setProcessedMatches((prev) => ({
            ...prev,
            [holdingKey]: true,
          }));

          const updatedPortfolio = await getPortfolio();
          setPortfolioData(updatedPortfolio);
        } catch (error) {
          console.error(`Auto-sell failed for ${holding.playerName}:`, error);
          toast.error(`Failed to auto-sell ${holding.playerName}'s stocks`);
        }
      }
    }
  };

  // Get live player data from match data
  const getLivePlayerData = (playerId, matchId) => {
    const match = allMatchData.find(
      (m) => m.matchId.toString() === matchId.toString()
    );
    if (!match || !match.innings) return null;

    for (const inning of match.innings) {
      const found = inning.batsmen.find(
        (p) => p.id?.toString() === playerId.toString()
      );
      if (found) return found;
    }
    return null;
  };

  // Calculate updated player price based on stats
  const calculateUpdatedPrice = (playerStats, initialPrice) => {
    let currentPrice = Number(initialPrice);
    if (!playerStats) return currentPrice;

    // Apply runs and dots effect
    currentPrice += playerStats.runs * 0.75;
    currentPrice -= playerStats.dots * 0.5;

    // Then check if player is out
    if (playerStats.wicketCode !== "") {
      currentPrice *= 0.7; // Reduce price if the player is out
    }

    return currentPrice;
  };

  // Calculate profit/loss
  const calculateProfitLoss = (currentPrice, buyPrice, quantity) => {
    const diff = currentPrice - buyPrice;
    const profit = diff * quantity;
    const percentage = ((diff / buyPrice) * 100).toFixed(2);
    return { profit: profit.toFixed(2), percentage };
  };

  // Click handlers for actions
  const handleClick = (entity, type) => {
    if (type === "player") {
      setPlayer(entity);
      setSelectedEntity("player");
    } else {
      setTeam(entity);
      setSelectedEntity("team");
    }
    setShowActionButtons(true);
  };

  const handleActionSelect = (action) => {
    setActionType(action);
    setShowModal(true);
    setShowActionButtons(false);
  };

  // Handle transaction confirmation
  const handleConfirm = async () => {
    setIsLoading(true);

    try {
      if (selectedEntity === "player") {
        const portfolioData = {
          MatchId: player.matchId,
          playerId: player.playerId,
          playerName: player.playerName,
          team: player.team,
          initialPrice: player.initialPrice,
          price: player.currentPrice,
          quantity: stockCount,
          autosold: false,
          reason: "soldbyuser",
        };

        if (actionType === "buy") {
          await setPortfolio(portfolioData);
          toast.success(
            `Successfully bought ${stockCount} stock(s) of ${player.playerName}!`
          );
        } else if (actionType === "sell") {
          await sellPortfolio(portfolioData);
          toast.success(
            `Successfully sold ${stockCount} stock(s) of ${player.playerName}!`
          );
        }

        // Refresh portfolio after transaction
        const updatedPortfolio = await getPortfolio();
        setPortfolioData(updatedPortfolio);
      } else {
        // Team transaction
        const teamPortfolioData = {
          MatchId: team.matchId,
          teamId: team.teamId,
          teamName: team.teamName,
          initialPrice: team.initialPrice,
          price: team.currentPrice,
          quantity: stockCount,
          autosold: false,
          reason: "soldbyuser",
        };
        console.log(teamPortfolioData);

        if (actionType === "buy") {
          await setTeamPortfolio(teamPortfolioData);
          toast.success(
            `Successfully bought ${stockCount} stock(s) of ${team.teamName}!`
          );
        } else if (actionType === "sell") {
          await sellTeamPortfolio(teamPortfolioData);
          toast.success(
            `Successfully sold ${stockCount} stock(s) of ${team.teamName}!`
          );
        }

        // Refresh team portfolio after transaction
        const updatedTeamPortfolio = await getTeamPortfolio();
        setTeamPortfolioData(updatedTeamPortfolio);
      }

      setShowModal(false); // Close modal on success
    } catch (error) {
      toast.error(`Failed to complete transaction: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Render player current holdings
  const renderCurrentHoldings = () => {
    const holdings = [];

    portfolio.forEach((item) => {
      // Get all buy transactions
      const buys = item.transactions
        .filter((tx) => tx.type === "buy")
        .map((tx) => ({ ...tx }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Get all sell transactions
      const sells = item.transactions
        .filter((tx) => tx.type === "sell")
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // FIFO Sell matching
      for (let sell of sells) {
        let qtyToSell = sell.quantity;
        while (qtyToSell > 0 && buys.length > 0) {
          const buy = buys[0];
          const usedQty = Math.min(qtyToSell, buy.quantity);
          buy.quantity -= usedQty;
          qtyToSell -= usedQty;
          if (buy.quantity === 0) buys.shift();
        }
      }

      // Group remaining buys (current holdings) by price & timestamp
      const grouped = {};

      for (let buy of buys) {
        if (buy.quantity <= 0) continue;

        const key = `${buy.price}-${buy.timestamp}`;
        if (!grouped[key]) {
          grouped[key] = {
            playerName: item.playerName,
            team: item.team,
            initialPrice: item.initialPrice,
            buyPrice: buy.price,
            quantity: 0,
            timestamp: buy.timestamp,
            playerId: item.playerId,
            matchId: item.matchId,
          };
        }

        grouped[key].quantity += buy.quantity;
      }

      // Render each grouped holding
      Object.entries(grouped).forEach(([key, holding]) => {
        const liveStats = getLivePlayerData(holding.playerId, holding.matchId);
        const updatedPrice = calculateUpdatedPrice(
          liveStats,
          item.initialPrice
        );
        const { profit, percentage } = calculateProfitLoss(
          updatedPrice,
          holding.buyPrice,
          holding.quantity
        );

        holdings.push({
          key: `${holding.playerId}-${key}`,
          playerName: holding.playerName,
          playerId: holding.playerId,
          matchId: holding.matchId,
          initialPrice: holding.initialPrice,
          team: holding.team,
          buyPrice: holding.buyPrice,
          currentPrice: updatedPrice,
          quantity: holding.quantity,
          profit,
          percentage,
          latestTimestamp: new Date(holding.timestamp).getTime(),
        });
      });
    });

    if (holdings.length > 0) {
      return holdings.map((h) => (
        <div
          key={h.key}
          className="border p-4 m-2 shadow rounded-lg cursor-pointer"
          onClick={() => handleClick(h, "player")}
        >
          <h2 className="font-bold">
            {h.playerName} ({h.team})
          </h2>
          <p>PlayerId: {h.playerId}</p>
          <p>Buy Price: ₹{h.buyPrice}</p>
          <p>Current Price: ₹{h.currentPrice.toFixed(2)}</p>
          <p>Quantity Held: {h.quantity}</p>
          <p
            className={`font-semibold ${
              h.profit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            P&L: ₹{h.profit} ({h.percentage}%)
          </p>

          {/* Display player status indicator */}
          {(() => {
            const playerData = getLivePlayerData(h.playerId, h.matchId);
            const match = allMatchData.find(
              (m) => m.matchId.toString() === h.matchId.toString()
            );

            if (playerData && playerData.wicketCode !== "") {
              return <p className="text-red-500 font-bold">Status: Out</p>;
            }

            if (match) {
              if (match.status === "completed" || match.status === "finished") {
                return (
                  <p className="text-red-500 font-bold">Match Completed</p>
                );
              }

              if (
                match.innings &&
                match.innings.some((inn) => inn.status === "completed")
              ) {
                return (
                  <p className="text-orange-500 font-bold">Innings Completed</p>
                );
              }
            }

            return <p className="text-green-500 font-bold">Status: Playing</p>;
          })()}
        </div>
      ));
    } else {
      return (
        <h1 className="align-center text-center">No current player holdings</h1>
      );
    }
  };

  // Render team current holdings
  const renderTeamCurrentHoldings = () => {
    const holdings = [];

    teamPortfolio.forEach((item) => {
      // Get all buy transactions
      const buys = item.transactions
        .filter((tx) => tx.type === "buy")
        .map((tx) => ({ ...tx }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Get all sell transactions
      const sells = item.transactions
        .filter((tx) => tx.type === "sell")
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // FIFO Sell matching
      for (let sell of sells) {
        let qtyToSell = sell.quantity;
        while (qtyToSell > 0 && buys.length > 0) {
          const buy = buys[0];
          const usedQty = Math.min(qtyToSell, buy.quantity);
          buy.quantity -= usedQty;
          qtyToSell -= usedQty;
          if (buy.quantity === 0) buys.shift();
        }
      }

      // Group remaining buys (current holdings) by price & timestamp
      const grouped = {};

      for (let buy of buys) {
        if (buy.quantity <= 0) continue;

        const key = `${buy.price}-${buy.timestamp}`;
        if (!grouped[key]) {
          grouped[key] = {
            teamName: item.teamName,
            initialPrice: item.initialPrice,
            buyPrice: buy.price,
            quantity: 0,
            timestamp: buy.timestamp,
            teamId: item.teamId,
            matchId: item.matchId,
          };
        }

        grouped[key].quantity += buy.quantity;
      }

      // Render each grouped holding
      Object.entries(grouped).forEach(([key, holding]) => {
        const match = allMatchData.find(
          (m) => m.matchId.toString() === holding.matchId.toString()
        );
        const updatedPrice = calculateTeamPrice(match, item.initialPrice);
        const { profit, percentage } = calculateProfitLoss(
          updatedPrice,
          holding.buyPrice,
          holding.quantity
        );

        holdings.push({
          key: `team-${holding.teamId}-${key}`,
          teamName: holding.teamName,
          teamId: holding.teamId,
          matchId: holding.matchId,
          initialPrice: holding.initialPrice,
          buyPrice: holding.buyPrice,
          currentPrice: updatedPrice,
          quantity: holding.quantity,
          profit,
          percentage,
          latestTimestamp: new Date(holding.timestamp).getTime(),
        });
      });
    });

    if (holdings.length > 0) {
      return holdings.map((h) => (
        <div
          key={h.key}
          className="border p-4 m-2 shadow rounded-lg cursor-pointer"
          onClick={() => handleClick(h, "team")}
        >
          <h2 className="font-bold">{h.teamName}</h2>
          <p>TeamId: {h.teamId}</p>
          <p>Buy Price: ₹{h.buyPrice}</p>
          <p>Current Price: ₹{h.currentPrice}</p>
          <p>Quantity Held: {h.quantity}</p>
          <p
            className={`font-semibold ${
              h.profit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            P&L: ₹{h.profit} ({h.percentage}%)
          </p>

          {/* Display team match status indicator */}
          {(() => {
            const match = allMatchData.find(
              (m) => m.matchId.toString() === h.matchId.toString()
            );

            if (match) {
              if (match.status === "completed" || match.status === "finished") {
                return (
                  <p className="text-red-500 font-bold">Match Completed</p>
                );
              }
            }

            return (
              <p className="text-green-500 font-bold">Match In Progress</p>
            );
          })()}
        </div>
      ));
    } else {
      return (
        <h1 className="align-center text-center">No current team holdings</h1>
      );
    }
  };

  // Render sold players
  const renderSoldPlayers = () => {
    return portfolio.map((item, index) => {
      const buys = item.transactions
        .filter((tx) => tx.type === "buy")
        .map((tx) => ({ ...tx }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const sells = item.transactions.filter((tx) => tx.type === "sell");

      if (sells.length === 0) return null;

      const sellDetails = [];

      for (let sell of sells) {
        let sellQty = sell.quantity;
        let totalSellProfit = 0;
        let totalSellBuyAmount = 0;

        while (sellQty > 0 && buys.length > 0) {
          const buy = buys[0];
          const usedQty = Math.min(sellQty, buy.quantity);

          const profit = (sell.price - buy.price) * usedQty;

          totalSellProfit += profit;
          totalSellBuyAmount += buy.price * usedQty;

          if (!sell.buyPrice) sell.buyPrice = buy.price;

          buy.quantity -= usedQty;
          sellQty -= usedQty;

          if (buy.quantity === 0) buys.shift();
        }

        const percentage = (
          (totalSellProfit / totalSellBuyAmount) *
          100
        ).toFixed(2);
        sellDetails.push({
          sellPrice: sell.price,
          buyPrice: sell.buyPrice,
          quantity: sell.quantity,
          profit: totalSellProfit.toFixed(2),
          percentage,
          autoSold: sell.autoSold,
          reason: sell.reason || "Manual sale",
          timestamp: sell.timestamp,
        });
      }

      return (
        <div
          key={item.playerId + "-sold-" + index}
          className="bg-[#002865] border-2 border-[#1671CC] rounded-lg shadow-md overflow-hidden m-4 text-white"
        >
          {/* Header Section */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-lg mr-2">
                  Qty {" "}
                  {sellDetails.reduce((acc, s) => acc + s.quantity, 0)}
                </span>{" "}
                |
                <span className="text-lg ml-2">
                  Avg ₹
                  {(
                    sellDetails.reduce(
                      (acc, s) => acc + s.buyPrice * s.quantity,
                      0
                    ) / sellDetails.reduce((acc, s) => acc + s.quantity, 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="flex flex-col gap-4 px-4 pb-4 overflow-x-auto">
            {sellDetails.map((s, i) => (
              <div
                key={i}
                className="bg-[#002865] text-white rounded-lg min-w-[800px] w-full p-4"
              >
                <div className="flex flex-wrap lg:flex-nowrap justify-between items-center gap-6">
                  {/* Player Info */}
                  <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
                      <img
                        src={dmdp}
                        alt="Player"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">{item.playerName}</h2>
                      <p className="text-sm text-gray-300 uppercase tracking-widest">
                        {item.team
                          .split(" ")
                          .map((word) => word[0])
                          .join("")}
                      </p>
                    </div>
                  </div>

                  {/* Buy Price */}
                  <div className="text-center w-full lg:w-auto">
                    <p className="text-sm text-gray-300">Buy Price</p>
                    <p className="text-lg font-semibold">₹{s.buyPrice}</p>
                  </div>

                  {/* Sell Price */}
                  <div className="text-center w-full lg:w-auto">
                    <p className="text-sm text-gray-300">Sell Price</p>
                    <p className="text-lg font-semibold">₹{s.sellPrice}</p>
                  </div>

                  {/* Profit / Loss */}
                  <div className="text-center w-full lg:w-auto">
                    <p className="text-sm text-gray-300">
                      {s.profit >= 0 ? "Profit" : "Loss"}
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        s.profit >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      ₹{s.profit}
                    </p>
                  </div>

                  {/* Percentage */}
                  <div className="text-center w-full lg:w-auto">
                    <p className="text-sm text-gray-300">Percentage</p>
                    <p
                      className={`text-lg font-semibold ${
                        s.percentage >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {s.percentage}%
                    </p>
                  </div>

                  {/* Status */}
                  <div className="text-right w-full lg:w-auto">
                    {s.autoSold ? (
                      <div className="flex flex-col items-end">
                        <span className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-xs">
                          Auto-sold
                        </span>
                        <p className="mt-1 pr-2 text-xs text-gray-300">
                          {formatReason(s.reason)}
                        </p>
                      </div>
                    ) : (
                      <span className="bg-green-900 text-green-200 px-3 py-1 rounded-full text-xs">
                        Manual
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Summary Footer */}
          <div className="pl-4 pr-4 pt-3 pb-3 bg-[#001e42] border-t-2 border-[#1671CC]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-white">Total Invested</p>
                <p className="text-xl font-bold text-gray-300">
                  ₹
                  {sellDetails
                    .reduce((acc, s) => acc + s.buyPrice * s.quantity, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white">Current Value</p>
                <p
                  className={`text-xl font-bold ${
                    sellDetails.reduce(
                      (acc, s) => acc + (s.sellPrice - s.buyPrice) * s.quantity,
                      0
                    ) >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  ₹
                  {sellDetails
                    .reduce((acc, s) => acc + s.sellPrice * s.quantity, 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  // Render sold teams
  const renderSoldTeams = () => {
    return teamPortfolio.map((item, index) => {
      const buys = item.transactions
        .filter((tx) => tx.type === "buy")
        .map((tx) => ({ ...tx }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const sells = item.transactions.filter((tx) => tx.type === "sell");

      if (sells.length === 0) return null;

      const sellDetails = [];

      for (let sell of sells) {
        let sellQty = sell.quantity;
        let totalSellProfit = 0;
        let totalSellBuyAmount = 0;

        while (sellQty > 0 && buys.length > 0) {
          const buy = buys[0];
          const usedQty = Math.min(sellQty, buy.quantity);

          const profit = (sell.price - buy.price) * usedQty;

          totalSellProfit += profit;
          totalSellBuyAmount += buy.price * usedQty;

          if (!sell.buyPrice) sell.buyPrice = buy.price;

          buy.quantity -= usedQty;
          sellQty -= usedQty;

          if (buy.quantity === 0) buys.shift();
        }

        const percentage = (
          (totalSellProfit / totalSellBuyAmount) *
          100
        ).toFixed(2);
        sellDetails.push({
          sellPrice: sell.price,
          buyPrice: sell.buyPrice,
          quantity: sell.quantity,
          profit: totalSellProfit.toFixed(2),
          percentage,
          autoSold: sell.autoSold,
          reason: sell.reason || "Manual sale",
          timestamp: sell.timestamp,
        });
      }

      return (
        <div
          key={item.teamId + "-sold-" + index}
          className="border p-4 m-2 shadow rounded-lg bg-gray-100 text-black"
        >
          <h2 className="font-bold">{item.teamName} - Sold</h2>
          {sellDetails.map((s, i) => (
            <div key={i} className="mb-2">
              <p>Buy Price: ₹{s.buyPrice}</p>
              <p>Sell Price: ₹{s.sellPrice}</p>
              <p>Quantity Sold: {s.quantity}</p>
              <p
                className={`font-semibold ${
                  s.profit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                P&L: ₹{s.profit} ({s.percentage}%)
              </p>
              {s.autoSold && (
                <p className="italic text-gray-600">
                  Auto-sold: {formatReason(s.reason)} on{" "}
                  {new Date(s.timestamp).toLocaleString()}
                </p>
              )}
              <hr className="my-2" />
            </div>
          ))}
        </div>
      );
    });
  };

  // Helper function to format reason text
  const formatReason = (reason) => {
    if (!reason) return "Unknown reason";

    switch (reason.toLowerCase()) {
      case "player_out":
        return "Player Out";
      case "innings_completed":
        return "Innings Completed";
      case "match_completed":
        return "Match Completed";
      case "soldbyuser":
        return "Sold by User";
      default:
        return (
          reason.charAt(0).toUpperCase() + reason.slice(1).replace(/_/g, " ")
        );
    }
  };

  // Calculate total portfolio value
  const calculateTotalValue = () => {
    let totalValue = 0;
    let totalInvestment = 0;

    // Calculate player portfolio value
    portfolio.forEach((item) => {
      const buys = item.transactions
        .filter((tx) => tx.type === "buy")
        .map((tx) => ({ ...tx }));
      const sells = item.transactions
        .filter((tx) => tx.type === "sell")
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // FIFO Sell matching
      for (let sell of sells) {
        let qtyToSell = sell.quantity;
        while (qtyToSell > 0 && buys.length > 0) {
          const buy = buys[0];
          const usedQty = Math.min(qtyToSell, buy.quantity);
          buy.quantity -= usedQty;
          qtyToSell -= usedQty;
          if (buy.quantity === 0) buys.shift();
        }
      }

      // Calculate current value of remaining stocks
      for (let buy of buys) {
        if (buy.quantity <= 0) continue;

        const liveStats = getLivePlayerData(item.playerId, item.matchId);
        const currentPrice = calculateUpdatedPrice(
          liveStats,
          item.initialPrice
        );

        totalValue += currentPrice * buy.quantity;
        totalInvestment += buy.price * buy.quantity;
      }
    });

    // Calculate team portfolio value
    teamPortfolio.forEach((item) => {
      const buys = item.transactions
        .filter((tx) => tx.type === "buy")
        .map((tx) => ({ ...tx }));
      const sells = item.transactions
        .filter((tx) => tx.type === "sell")
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // FIFO Sell matching
      for (let sell of sells) {
        let qtyToSell = sell.quantity;
        while (qtyToSell > 0 && buys.length > 0) {
          const buy = buys[0];
          const usedQty = Math.min(qtyToSell, buy.quantity);
          buy.quantity -= usedQty;
          qtyToSell -= usedQty;
          if (buy.quantity === 0) buys.shift();
        }
      }

      // Calculate current value of remaining team stocks
      for (let buy of buys) {
        if (buy.quantity <= 0) continue;

        const match = allMatchData.find(
          (m) => m.matchId.toString() === item.matchId.toString()
        );
        const currentPrice = calculateTeamPrice(match, item.initialPrice);

        totalValue += currentPrice * buy.quantity;
        totalInvestment += buy.price * buy.quantity;
      }
    });

    const totalProfit = totalValue - totalInvestment;
    const profitPercentage =
      totalInvestment > 0
        ? ((totalProfit / totalInvestment) * 100).toFixed(2)
        : 0;

    return {
      totalValue: totalValue.toFixed(2),
      totalInvestment: totalInvestment.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
      profitPercentage,
    };
  };

  // Calculate historical profit/loss from sold stocks
  const calculateHistoricalProfitLoss = () => {
    let totalProfit = 0;
    let totalSold = 0;

    // Calculate from player portfolio
    portfolio.forEach((item) => {
      item.transactions
        .filter((tx) => tx.type === "sell")
        .forEach((sell) => {
          // Find corresponding buy transactions (simplified approach)
          const buyPrice =
            sell.buyPrice ||
            item.transactions.find((tx) => tx.type === "buy")?.price ||
            item.initialPrice;

          const profit = (sell.price - buyPrice) * sell.quantity;
          totalProfit += profit;
          totalSold += buyPrice * sell.quantity;
        });
    });

    // Calculate from team portfolio
    teamPortfolio.forEach((item) => {
      item.transactions
        .filter((tx) => tx.type === "sell")
        .forEach((sell) => {
          // Find corresponding buy transactions (simplified approach)
          const buyPrice =
            sell.buyPrice ||
            item.transactions.find((tx) => tx.type === "buy")?.price ||
            item.initialPrice;

          const profit = (sell.price - buyPrice) * sell.quantity;
          totalProfit += profit;
          totalSold += buyPrice * sell.quantity;
        });
    });

    const percentage =
      totalSold > 0 ? ((totalProfit / totalSold) * 100).toFixed(2) : 0;

    return {
      totalProfit: totalProfit.toFixed(2),
      percentage,
    };
  };

  const { totalValue, totalInvestment, totalProfit, profitPercentage } =
    calculateTotalValue();
  const { totalProfit: historicalProfit, percentage: historicalPercentage } =
    calculateHistoricalProfitLoss();

  // Main rendering
  return (
    <div
      className="min-h-screen text-white"
      style={{ backgroundColor: "#002865" }}
    >
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        {/* Portfolio Tab Navigation */}
        <div className="flex justify-center mb-8 space-x-6">
          <button
            className={`px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300 ease-in-out ${
              activeTab === "players"
                ? "bg-[#1671CC] text-white shadow-md"
                : "bg-[#002865] text-white hover:bg-gray-400 hover:text-black"
            }`}
            onClick={() => setActiveTab("players")}
          >
            Player Portfolio
          </button>
          <button
            className={`px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300 ease-in-out ${
              activeTab === "teams"
                ? "bg-[#1671CC] text-white shadow-md"
                : "bg-[#002865] text-white hover:bg-gray-400 hover:text-black"
            }`}
            onClick={() => setActiveTab("teams")}
          >
            Team Portfolio
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === "players" ? (
          <>
            <h2 className="text-3xl font-semibold mb-6 text-center">
              Current Player Holdings
            </h2>
            {loading ? (
              <p className="text-center">Loading player portfolio...</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {renderCurrentHoldings()}
              </div>
            )}

            <h2 className="text-3xl font-semibold mt-12 mb-6 text-center">
              Sold Players History
            </h2>
            <div className="grid grid-cols-1 gap-4">{renderSoldPlayers()}</div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-semibold mb-6 text-center">
              Current Team Holdings
            </h2>
            {teamLoading ? (
              <p className="text-center">Loading team portfolio...</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {renderTeamCurrentHoldings()}
              </div>
            )}

            <h2 className="text-3xl font-semibold mt-12 mb-6 text-center">
              Sold Teams History
            </h2>
            <div className="grid grid-cols-1 gap-4">{renderSoldTeams()}</div>
          </>
        )}
      </div>

      {/* Action Buttons Modal */}
      {showActionButtons && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-8 rounded-xl shadow-xl w-96 max-w-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {selectedEntity === "player" ? player.playerName : team.teamName}
            </h2>
            <p className="text-xl mb-4 text-center">
              Current Price: ₹
              {selectedEntity === "player"
                ? player.currentPrice
                : team.currentPrice}
            </p>
            <div className="flex justify-between mt-6">
              <button
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all"
                onClick={() => handleActionSelect("buy")}
              >
                Buy More
              </button>
              <button
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-all"
                onClick={() => handleActionSelect("sell")}
              >
                Sell
              </button>
              <button
                className="bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition-all"
                onClick={() => setShowActionButtons(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-8 rounded-xl shadow-xl w-96 max-w-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {actionType === "buy" ? "Buy" : "Sell"}{" "}
              {selectedEntity === "player" ? player.playerName : team.teamName}
            </h2>
            <p className="text-xl mb-4 text-center">
              Current Price: ₹
              {selectedEntity === "player"
                ? player.currentPrice
                : team.currentPrice}
            </p>
            <div className="my-6">
              <label className="block mb-2 text-lg">Quantity:</label>
              <input
                type="number"
                min="1"
                max={
                  actionType === "sell"
                    ? selectedEntity === "player"
                      ? player.quantity
                      : team.quantity
                    : 100
                }
                value={stockCount}
                onChange={(e) => setStockCount(parseInt(e.target.value) || 1)}
                className="border-[#1671CC] p-3 w-full rounded-lg shadow-sm"
              />
            </div>
            <p className="text-xl font-bold mb-6 text-center">
              Total:{" "}
              {selectedEntity === "player"
                ? (player.currentPrice * stockCount).toFixed(2)
                : (team.currentPrice * stockCount).toFixed(2)}{" "}
              ₹
            </p>
            <div className="flex justify-between mt-6">
              <button
                className={`${
                  actionType === "buy" ? "bg-green-500" : "bg-red-500"
                } text-white px-6 py-3 rounded-lg hover:bg-opacity-80 transition-all`}
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Confirm"}
              </button>
              <button
                className="bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition-all"
                onClick={() => setShowModal(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
