import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../Context/UserContext";
import { toast } from "react-toastify";
import ticker from "/assets/ticker.png";
import { X } from "lucide-react";
const PlayerCard = ({ player, index, matchId }) => {
  const [price, setPrice] = useState(player.price);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [stockCount, setStockCount] = useState(1);
  const [actionType, setActionType] = useState(""); // "buy" or "sell"
  const [isLoading, setIsLoading] = useState(false);

  const { setPortfolio, sellPortfolio } = useContext(UserContext);
  const maxReferencePrice = 200; // or dynamically computed based on max possible price
  const normalizedInitialPrice = (player.price / maxReferencePrice) * 100;
  const normalizedCurrentPrice = (price / maxReferencePrice) * 100;
  useEffect(() => {
    const newPrice = updatePlayerPrice(player);
    setPrice(newPrice.toFixed(2));
  }, [player.score, player.dots, player.status, player.wicketCode]);

  const handleClick = () => {
    if (player.status == "batting" || player.status == "not out") {
      setShowActionButtons(true);
    }
  };

  const statusColor = (player, price) => {
    if (player.status != "not out") {
      return "Out";
    }
    if (price == player.price && player.balls == 0) {
      return "Yet to Bat";
    } else {
      return "Playing";
    }
  };
  const handleActionSelect = (action) => {
    setActionType(action);
    setShowModal(true);
    setShowActionButtons(false);
  };

  const updatePlayerPrice = (player) => {
    let newPrice = player.price;

    // Increase price by 0.75 per run
    newPrice += player.score * 0.75;

    // Decrease price by 0.5 per dot ball
    newPrice -= player.dots * 0.5;

    // if (player.wicketCode !== "") {
    //   return newPrice * 0.7;
    // }

    return newPrice;
  };

  const handleConfirm = async () => {
    const portfolioData = {
      // playerId,team,initialPrice,price,quantity,runs
      MatchId: matchId,
      playerId: player.id,
      playerName: player.name,
      team: player.team,
      initialPrice: player.price,
      price,
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

  const getLogo = () => {
    if (index < 4) return "/assets/batsmenlogo1.jpg";
    if (index < 7) return "/assets/batsmenlogo2.jpg";
    return "/assets/batsmenlogo3.webp";
  };

  return (
    <>
      <div
        className={`rounded-xl p-4 transition duration-300 ease-in-out
          ${
            statusColor(player, price) !== "Out"
              ? "bg-[#002865] hover:shadow-2xl"
              : "bg-[#001D4F] scale-[0.98]"
          }
          ${
            statusColor(player, price) !== "Out"
              ? "cursor-pointer hover:scale-[1.015]"
              : ""
          }`}
        onClick={handleClick}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {/* logo div */}
            <div className="w-14 h-14 rounded-full mr-3 overflow-hidden border-4 border-[#1671CC]">
              <img
                src={getLogo()}
                alt="Player Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center font-semibold">
                {player.name}
              </div>
              <div className="mt-2 text-sm flex items-center">
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-1 ${
                    player.teamColor === "orange"
                      ? "bg-orange-500"
                      : "bg-red-500"
                  }`}
                ></span>
                <span className="text-gray-400"> | {player.team}</span>
                <span
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    statusColor(player, price) === "Out"
                      ? "border-red-500 border-2 text-red-500"
                      : statusColor(player, price) === "Yet to Bat"
                      ? "border-blue-500 border-2 text-blue-500"
                      : "border-green-500 border-2 text-green-500"
                  }`}
                >
                  {statusColor(player, price)}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Price</div>
            <div
              className={`text-2xl font-bold ${
                price > player.price
                  ? "text-green-500"
                  : price < player.price
                  ? "text-red-500"
                  : "text-blue-500"
              }
              `}
            >
              ₹{price}
            </div>
          </div>
        </div>

        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            {/* <span>0</span>
            <span>100</span> */}
          </div>
          <div className="my-5 w-full bg-[#0c3f7c] h-1 rounded-full relative">
            {/* Progress fill */}
            <div
              className={`h-full ${
                price > player.price
                  ? "bg-green-500"
                  : price < player.price
                  ? "bg-red-500"
                  : "bg-blue-500"
              }`}
              style={{
                width: `${normalizedCurrentPrice}%`,
                transition: "width 0.5s ease",
              }}
            ></div>

            {/* Initial price marker */}
            <div
              className="absolute top-[-20px] text-xs text-gray-400/50"
              style={{ left: `calc(${normalizedInitialPrice}% - 10px)` }}
            ></div>
            <div
              className="absolute top-[-7px] h-5 w-[2px] bg-gray-400/50"
              style={{ left: `calc(${normalizedInitialPrice}% - 1px)` }}
            ></div>

            {/* Current price marker */}
            <div
              className="ml-[-8px] absolute top-[-25px] text-xs"
              style={{
                left: `calc(${normalizedCurrentPrice}% - 10px)`,
                transition: "all 0.5s ease",
              }}
            >
              ₹{Number(price).toFixed(1)}
            </div>
            <div
              className={`absolute top-[-9px] h-6 w-[2px] ${
                price > player.price
                  ? "bg-green-500"
                  : price < player.price
                  ? "bg-red-500"
                  : "bg-blue-500"
              }`}
              style={{
                left: `calc(${normalizedCurrentPrice}% - 1px)`,
                transition: "all 0.5s ease",
              }}
            ></div>
          </div>

          <div className="mt-6 bg-[#003690] px-4 py-2 flex justify-between text-sm rounded-lg">
            <div>
              <span>
                <span className="text-white">Dots </span>
                <span className="text-red-500 font-bold">
                  {player.dots < 10 ? `0${player.dots}` : player.dots}
                </span>{" "}
                | <span className="text-white">Sixes </span>
                <span className="text-green-500 font-bold">
                  {player.Sixes < 10 ? `0${player.Sixes}` : player.Sixes}
                </span>{" "}
                | <span className="text-white">Fours </span>
                <span className="text-yellow-500 font-bold">
                  {player.Fours < 10 ? `0${player.Fours}` : player.Fours}
                </span>
              </span>
            </div>
            <div>
              Runs{" "}
              <span className="font-bold text-green-500">
                {player.score < 10 ? `0${player.score}` : player.score}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Buy/Sell Action Buttons Modal */}
      {showActionButtons && (
        <div className="fixed inset-0 w-screen h-screen bg-[#002865]/10 backdrop-blur-sm flex items-center justify-center z-50 afi">
          <div className="relative flex flex-col bg-white/50 text-black rounded-lg p-6 w-80">
            <X
              className="p-1 stroke-3 absolute top-2 right-2 hover:bg-white/40 cursor-pointer rounded-sm"
              onClick={() => setShowActionButtons(false)}
            />
            <h2 className="mt-5 text-xl font-semibold mb-4 text-center">
              {player.name}
            </h2>
            <div className="flex justify-between gap-4">
              <button
                onClick={() => handleActionSelect("buy")}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg w-full font-bold transition-all duration-200 ease-in-out cursor-pointer"
              >
                BUY
              </button>
              <button
                onClick={() => handleActionSelect("sell")}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg w-full font-bold transition-all duration-200 ease-in-out cursor-pointer"
              >
                SELL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Count Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#002865] bg-opacity-70 flex items-center justify-center z-50">
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
            <div
              className={`mb-4 text-center ${
                price > player.price
                  ? "text-green-500"
                  : price < player.price
                  ? "text-red-500"
                  : "text-blue-500"
              }`}
            >
              Total Price: ₹{(price * stockCount).toFixed(2)}
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

export default PlayerCard;
