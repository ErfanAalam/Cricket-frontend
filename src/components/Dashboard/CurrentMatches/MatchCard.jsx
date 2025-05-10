import React, { useContext, useEffect } from "react";
import { Calendar, Dot, DotIcon } from "lucide-react";
import { UserContext } from "../../../Context/UserContext";

const MatchCard = ({ match }) => {
  const { handleGetScore } = useContext(UserContext);
  const matchTime = new Date(match.startDate).getTime();
  const timeDiff = matchTime - Date.now();

  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
  let timeDisplay = "";

  if (hours >= 1) {
    timeDisplay = `${hours}h ${minutes}m`;
  } else if (minutes >= 1) {
    timeDisplay = `${minutes}m ${seconds}s`;
  } else {
    timeDisplay = `${seconds}s`;
  }
  function getTeamAbbreviation(teamName) {
    if (!teamName) return "";
    const words = teamName.trim().split(/\s+/);
    if (words.length === 1) {
      return teamName.slice(0, 3).toUpperCase();
    } else {
      return words.map(word => word[0]).join("").toUpperCase();
    }
  }
  useEffect(() => {
    console.log(match);
  }, []);
  return (
    <div className="text-white rounded-2xl overflow-hidden w-full mx-auto shadow-lg hover:shadow-xl transition-all sc">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#003690] p-[10px] sm:p-[16px] rounded-t-[10px]">
        <p className="text-[#E2E2E4] text-[18px] font-[400] mb-1 sm:mb-0">
          {match.format} | {match.seriesName}
        </p>
        <p className="text-[#E2E2E4] text-[18px] font-[400] flex items-center gap-1">
          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          {hours < 1
            ? "Now"
            : hours <= 24
            ? "Today"
            : new Date(match.startDate).toLocaleString("en-GB", {
                day: "numeric",
                month: "short", // e.g. Mar
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}{" "}
        </p>
      </div>

      {/* Match Details */}
      <div className="bg-[#002865] px-2 sm:px-3 md:px-4 text-center flex">
        <div className="flex items-center justify-between py-[24px] w-full">
          {/* Team 1 */}
          <div className="text-center w-1/3">
            <img
              src="/assets/crciketlogo.jpg"
              alt={match.team1}
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mx-auto mb-[6px] rounded-full"
            />
<p className="font-[400] text-sm sm:text-base md:text-lg">
  <span className="inline sm:hidden">{getTeamAbbreviation(match.team1)}</span>
  <span className="hidden sm:inline">{match.team1}</span>
</p>
          </div>
        {/* Countdown or Live */}
        <div className="flex flex-col items-center w-full sm:w-1/3 text-center gap-1">
          {timeDiff > 0 ? (
            <span className="text-sm sm:text-base text-white">Starts in</span>
          ) : null}
          <div
            className={`px-3 py-1 rounded-lg text-base font-medium ${
              timeDiff > 0
                ? "bg-[#FF9500] text-black"
                : match.isMatchComplete
                ? "bg-gray-500 text-white"
                : ""
            }`}
          >
            {timeDiff > 0
              ? hours <= 24
                ? timeDisplay
                : `${Math.floor(hours / 24)}D ${hours % 24}h`
              : match.isMatchComplete
              ? "Over"
              : (
                  <span className="flex items-center gap-1 text-lg">
                    <Dot className="text-[#e53935] w-5 h-5 animate-pulse" />
                    <span className="text-[#e53935] font-medium">Live</span>
                  </span>
                )}
          </div>
        </div>

          {/* Team 2 */}
          <div className="text-center w-1/3">
            <img
              src="/assets/crciketlogo.jpg"
              alt={match.team2}
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mx-auto mb-[6px] rounded-full"
            />
<p className="font-[400] text-sm sm:text-base md:text-lg">
  <span className="inline sm:hidden">{getTeamAbbreviation(match.team2)}</span>
  <span className="hidden sm:inline">{match.team2}</span>
</p>
          </div>
        </div>
      </div>

      {hours > 0 ? (
        <></>
      ) : (
        <button
          className={`w-full ${
            hours > 0 ? "bg-[#002865] " : "bg-[#1671CC]"
          } text-white cursor-pointer font-[400] rounded-b-[10px] text-[22px] sm:text-[22px] py-1 sm:py-2 hover:bg-blue-700`}
          onClick={(e) => {
            e.stopPropagation();
            handleGetScore(match);
          }}
        >
          Create Portfolio
        </button>
      )}
    </div>
  );
};

export default MatchCard;
