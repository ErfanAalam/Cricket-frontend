import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../../../Context/UserContext";
import Navbar from "../Navbar/Navbar";
import PlayerCard from "./PlayerCard";
import Teamcard from "./Teamcard";

const BettingInterface = () => {
  const { scoreData, selectedMatch } = useContext(UserContext);

  const [prevTeamPrice, setPrevTeamPrice] = useState(50);
  const [teamPrice, setTeamPrice] = useState(50);
  const [statusMessage, setStatusMessage] = useState("Loading...");
  const [matchData, setMatchData] = useState(() => {
    return scoreData && Object.keys(scoreData).length > 0
      ? scoreData
      : JSON.parse(localStorage.getItem("MatchData") || "{}");
  });

  const [currentMatch, setCurrentMatch] = useState(() => {
    return (
      selectedMatch || JSON.parse(localStorage.getItem("SelectedMatch") || "{}")
    );
  });
  const previousPriceRef = useRef(50);

  // Update matchData when new scoreData is received
  useEffect(() => {
    if (scoreData && Object.keys(scoreData).length > 0) {
      setMatchData(scoreData);
      // localStorage.setItem("MatchData", JSON.stringify(scoreData)); // Optional: still store it
    }
  }, [scoreData]);

  // Calculate team price and player data when matchData changes
  useEffect(() => {
    if (!matchData || Object.keys(matchData).length === 0) return;

    const innings = matchData?.innings || [];
    const currentInnings = innings.length === 2 ? innings[1] : innings[0];
    if (!currentInnings) return;

    const batsmenData = currentInnings?.batsmen || [];

    // Calculate initial team price based on target score
    let calculatedTeamPrice = 50;
    if (innings.length === 2 && currentInnings === innings[1]) {
      const targetScore = innings[0]?.score;
      if (targetScore >= 220) calculatedTeamPrice = 70;
      else if (targetScore >= 200) calculatedTeamPrice = 65;
      else if (targetScore >= 180) calculatedTeamPrice = 60;
      else if (targetScore >= 160) calculatedTeamPrice = 55;
    }

    // Adjust team price based on player performance
    batsmenData.forEach((batsman) => {
      calculatedTeamPrice += (batsman.runs || 0) * 0.1;
      if (batsman.wicketCode && batsman.wicketCode.toLowerCase() !== "") {
        calculatedTeamPrice *= 0.85;
      }
    });

    calculatedTeamPrice = parseFloat(calculatedTeamPrice.toFixed(2));

    // Store the previous price before updating
    previousPriceRef.current = teamPrice;
    setPrevTeamPrice(previousPriceRef.current);
    setTeamPrice(calculatedTeamPrice);
  }, [matchData]);

  // Match status updates
  useEffect(() => {
    if (!matchData?.status) {
      setStatusMessage("Match is not started Yet");
      return;
    }

    if (!currentMatch?.startDate) {
      setStatusMessage("Match data not available");
      return;
    }

    const matchStartTime = new Date(currentMatch.startDate);
    const currentTime = new Date();
    const formattedStartTime = matchStartTime.toLocaleString();
    const timeDiffInMinutes = (currentTime - matchStartTime) / (1000 * 60);

    if (currentTime < matchStartTime) {
      setStatusMessage(`Match starts at ${formattedStartTime}`);
    } else if (
      currentTime > matchStartTime &&
      (!matchData?.innings || matchData?.innings?.length === 0) &&
      timeDiffInMinutes > 5
    ) {
      setStatusMessage("Match is Cancelled");
    } else if (
      currentTime > matchStartTime &&
      matchData?.isMatchComplete === true
    ) {
      setStatusMessage("Match is Completed");
    } else if (
      currentTime > matchStartTime &&
      matchData.status === "Innings Break"
    ) {
      setStatusMessage("Innings Break");
    } else if (currentTime > matchStartTime) {
      setStatusMessage("LIVE");
    }
  }, [matchData, currentMatch]);

  // Prepare data for rendering
  const innings = matchData?.innings || [];
  const currentInnings = innings.length === 2 ? innings[1] : innings[0];
  const previousInnings = innings.length === 2 ? innings[0] : null;
  const batsmenData = currentInnings?.batsmen || [];

  const players = batsmenData.map((batsman, index) => {
    let initialPrice = 25;
    if (index < 4) initialPrice = 35;
    else if (index < 7) initialPrice = 30;

    return {
      id: batsman.id,
      name: batsman.name || batsman.nickName,
      team: currentInnings.batTeamName,
      STeamName: currentInnings.batTeamSName,
      teamColor:
        currentInnings.batTeamName === (currentInnings?.batTeamName || "")
          ? "orange"
          : "red",
      price: initialPrice,
      score: batsman.runs || 0,
      Fours: batsman.fours || 0,
      Sixes: batsman.sixes || 0,
      balls: batsman.balls || 0,
      dots: batsman.dots || 0,
      ones: batsman.ones || 0,
      twos: batsman.twos || 0,
      threes: batsman.threes || 0,
      boundaries: batsman.boundaries || 0,
      average: batsman.avg || "0.00",
      progress: initialPrice,
      strikeRate: batsman.strikeRate || "0.00",
      status: batsman.outDesc || "Not Out",
      isCaptain: batsman.isCaptain,
      isKeeper: batsman.isKeeper,
      wicketCode: batsman.wicketCode,
    };
  });

  const teams = [
    {
      id: 1,
      name: currentInnings?.batTeamName || "Team 1",
      percentage: currentInnings?.runRate || "0.00",
      price: teamPrice,
      previousPrice: prevTeamPrice,
      graphData: Array.from({ length: 20 }, (_, i) => i + 1),
      color: "green",
    },
    {
      id: 2,
      name: currentInnings?.bowlTeamName || "Team 2",
      percentage: "N/A",
      graphData: Array.from({ length: 20 }, (_, i) => i + 1),
      color: "yellow",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="max-w-md mx-auto ms:mx-0 md:max-w-full px-4 py-6">
        <div className="mb-6">
          <div className="relative mb-2">
            <span className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-3 py-1 rounded-md">
              {matchData?.status}
            </span>
          </div>
          <h1 className="text-center text-xl md:text-2xl font-bold mt-6">
            {currentMatch.team1} vs {currentMatch.team2}
          </h1>
          <p className="text-center text-gray-400 mt-2">Current Innings:
            {currentInnings ? (
              <>
                {currentInnings.batTeamName} - {currentInnings.score}/
                {currentInnings.wickets?.length || 0} ({currentInnings.overs}{" "}
                ov, RR: {currentInnings.runRate || "0.00"})
              </>
            ) : (
              " Not Started"
            )}
          </p>
          {previousInnings && (
            <p className="text-center text-gray-400 mt-1">
              Previous Innings: {previousInnings.batTeamName} -{" "}
              {previousInnings.score}/{previousInnings.wickets?.length || 0}(
              {previousInnings.overs} ov, RR: {previousInnings.runRate})
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {teams.map((team) => (
            <Teamcard key={team.id} team={team} />
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-4xl font-bold mb-4">
            {currentInnings?.batTeamName}
          </h2>
          {players?.length > 0 || matchData?.matchScore ? (
            <div className="space-y-4">
              {players.map((player, index) => (
                <PlayerCard
                  key={player.id || index}
                  player={player}
                  index={index}
                  matchId={scoreData?.matchId || currentMatch.matchId}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((dummy) => (
                <div
                  className="bg-[#001D4F] rounded-lg p-4 cursor-pointer"
                  key={dummy}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-400 rounded-full mr-3"></div>
                      <div>
                        <div className="flex items-center font-semibold">-</div>
                        <div className="text-sm flex items-center">
                          <span className="text-gray-400">| -</span>
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-500 text-white">
                            playing
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Price</div>
                      <div className="text-2xl font-bold">100</div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>0</span>
                      <span>100</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${dummy * 10}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <div>
                        <span className="text-green-500 ">
                          <span className="text-white">Dots: 13</span>
                          &nbsp;|&nbsp;
                          <span className="text-white">Fours: 5</span>
                          &nbsp;|&nbsp;
                          <span className="text-white">Sixes: 3</span>
                        </span>
                      </div>
                      <div>
                        Runs: <span className="text-green-500">120</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BettingInterface;
