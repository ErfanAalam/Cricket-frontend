import { useContext } from "react";
import { UserContext } from "../../../Context/UserContext";
import Navbar from "../Navbar/Navbar";
import MatchCard from "./MatchCard";

export default function CurrentMatch() {
  const { matchData, isLoading, error } = useContext(UserContext);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Loading matches...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      <Navbar />
      {matchData.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 p-6">
          {matchData.map((match, index) => (
            <MatchCard key={index} match={match} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center my-10 text-white">
          <h1>No match Found</h1>
        </div>
      )}
    </>
  );
}