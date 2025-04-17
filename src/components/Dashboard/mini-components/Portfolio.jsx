import React, { useContext, useEffect, useState } from "react";
import Navbar from "../Navbar/Navbar";
import { UserContext } from "../../../Context/UserContext";
import { toast } from "react-toastify";

const Portfolio = () => {
  const { setPortfolio,sellPortfolio,getPortfolio } = useContext(UserContext);
  const [portfolio, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allMatchData, setAllMatchdata] = useState([]);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [stockCount, setStockCount] = useState(1);
  const [actionType, setActionType] = useState(""); // "buy" or "sell"
  const [player, setPlayer] = useState({});

    const [isLoading, setIsLoading] = useState(false); //for stock purchase

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL    

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await getPortfolio();
        // console.log(data);

        setPortfolioData(data);
        setLoading(false);
      } catch (error) {
        toast.error("Error fetching portfolio");
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [getPortfolio]);

  // console.log(portfolio);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/match-scores/all-scores`
        );
        const data = await response.json();
        setAllMatchdata(data.matchScores);
      } catch (error) {
        console.error("Error fetching match scores:", error);
      }
    };

    fetchScores();
    const interval = setInterval(fetchScores, 10000);

    return () => clearInterval(interval);
  }, []);

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

  const calculateUpdatedPrice = (playerStats, initialPrice) => {
    let currentPrice = Number(initialPrice);
    if (!playerStats) return currentPrice;

    // Apply runs and dots effect
    currentPrice += playerStats.runs * 0.75;
    currentPrice -= playerStats.dots * 0.5;

    // Then check if player is out
    if (playerStats.wicketCode !== "") {
      currentPrice *= 0.5; // Halve the price if the player is out
    }

    return currentPrice;
  };

  const calculateProfitLoss = (currentPrice, buyPrice, quantity) => {
    const diff = currentPrice - buyPrice;
    const profit = diff * quantity;
    const percentage = ((diff / buyPrice) * 100).toFixed(2);
    return { profit: profit.toFixed(2), percentage };
  };

  const handleClick = (player) => {
    setPlayer(player);
    setShowActionButtons(true);
  };
  
  // console.log(player);
  
  const handleActionSelect = (action) => {
    setActionType(action);
    setShowModal(true);
    setShowActionButtons(false);
  };
  
  const handleConfirm = async () => {
      const portfolioData = {
        // playerId,team,initialPrice,price,quantity,runs
        MatchId:player.matchId,
        playerId: player.playerId,
        playerName:player.playerName,
        team:player.team,
        initialPrice:player.initialPrice,
        price:player.currentPrice,
        quantity: stockCount,
      };
      setIsLoading(true);
      
  
      try {
        if (actionType === "buy") {
          await setPortfolio(portfolioData);
          toast.success(
            `Successfully bought ${stockCount} stock(s) of ${player.name}!`
          );
        } else if (actionType === "sell") {
          await sellPortfolio(portfolioData);
          toast.success(
            `Successfully sold ${stockCount} stock(s) of ${player.name}!`
          );
        }
  
        setShowModal(false); // Close modal on success
      } catch (error) {
        toast.error(`Failed to complete transaction: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

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
            initialPrice:item.initialPrice,
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
          initialPrice:holding.initialPrice,
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


    if(holdings.length > 0){
      return holdings.map((h) => (
        <div
          key={h.key}
          className="border p-4 m-2 shadow rounded-lg"
          onClick={() => handleClick(h)}
        >
          <h2 className="font-bold">
            {h.playerName} ({h.team})
          </h2>
          <p>PlayerId : {h.playerId}</p>
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
        </div>
      ));
    }else{
      return <h1>No current Holdings</h1>
    }
  };

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
        });
      }

      return (
        <div
          key={item.playerId + "-sold"}
          className="border p-4 m-2 shadow rounded-lg bg-gray-100 text-black"
        >
          <h2 className="font-bold">
            {item.playerName} ({item.team}) - Sold
          </h2>
          {sellDetails.map((s, i) => (
            <div key={i}>
              <p>Buy Price: ₹{s.buyPrice}</p> {/* ✅ ADD THIS LINE */}
              <p>Sell Price: ₹{s.sellPrice}</p>
              <p>Quantity Sold: {s.quantity}</p>
              <p
                className={`font-semibold ${
                  s.profit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                P&L: ₹{s.profit} ({s.percentage}%)
              </p>
              <hr />
            </div>
          ))}
        </div>
      );
    });
  };

  return (
    <>
      <Navbar />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">📈 Your Portfolio</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div>
              <h2 className="text-xl font-semibold mb-2">Current Holdings</h2>
              {renderCurrentHoldings()}
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">Sold Players</h2>
              {renderSoldPlayers()}
            </div>
          </>
        )}
      </div>

      {showActionButtons && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg p-6 w-80">
            <h2 className="text-xl font-semibold mb-4 text-center">
              {player.name}
            </h2>
            <div className="flex justify-between gap-4">
              <button
                onClick={() => handleActionSelect("buy")}
                className="bg-green-600 text-white px-6 py-3 rounded w-full font-bold"
              >
                BUY
              </button>
              <button
                onClick={() => handleActionSelect("sell")}
                className="bg-red-600 text-white px-6 py-3 rounded w-full font-bold"
              >
                SELL
              </button>
            </div>
            <div className="text-center mt-4">
              <button
                onClick={() => setShowActionButtons(false)}
                className="text-gray-600 underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

{showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">
              {actionType === "buy" ? "Buy" : "Sell"} Stocks for {player.name}
            </h2>
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => setStockCount(Math.max(1, stockCount - 1))}
                className="bg-gray-300 px-4 py-1 rounded text-xl"
              >
                -
              </button>
              <span className="text-2xl font-bold">{stockCount}</span>
              <button
                onClick={() => setStockCount(stockCount + 1)}
                className="bg-gray-300 px-4 py-1 rounded text-xl"
              >
                +
              </button>
            </div>
            <div className="mb-4 text-center">
              Total Price: ₹{(player.currentPrice * stockCount).toFixed(2)}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setShowModal(false);
                  setActionType("");
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`${
                  actionType === "buy" ? "bg-green-600" : "bg-red-600"
                } text-white px-4 py-2 rounded ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading
                  ? "Processing..."
                  : `Confirm ${actionType === "buy" ? "Purchase" : "Sale"}`}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default Portfolio;
