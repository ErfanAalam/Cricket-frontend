import { useContext, useEffect } from "react";
import { UserContext } from "../../Context/UserContext";
import Navbar from "./Navbar/Navbar";
import { Calendar, MapPin } from "lucide-react";
import homeBanner from "/assets/home-banner.png";
import SeriesCard from "./mini-components/SeriesCard";

const Home = () => {
  const { seriesMatchData, isLoading, error } = useContext(UserContext);
  if (isLoading)
    return (
      <p className="text-center text-lg font-semibold mt-10">
        Loading matches...
      </p>
    );

  if (error)
    return <p className="text-center text-red-500 mt-10">Error: {error}</p>;

  return (
    <>
      <Navbar />
      {Object.keys(seriesMatchData).length === 0 ? (
        <h1 className="text-center text-lg font-semibold mt-10 text-white">
          No Match Found
        </h1>
      ) : (
        <>
        <div 
        className="relative bg-green-500/10 text-center p-10">
          <img
          src={homeBanner}
            className="text-center text-white absolute inset-0 w-full h-full -z-10 bg-cover object-cover brightness-70 "
          />
            <span className="text-xl inline-block px-4 py-2 rounded">
              🏏 Upcoming Cricket Matches & Series
            </span>
            <h1 className={"text-4xl "}>Don't Miss The Action</h1>
            </div>
          <div className="min-h-screen bg-[#06244bf3]  text-white py-12 relative">
            {/* Background Overlay */}
            <div className="fixed inset-0 bg-[#071c38f3] opacity-20 pointer-events-none z-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#071c38f3] via-black to-black"></div>
            </div>

            <div className="container mx-auto p-4 relative z-10">
              {Object.entries(seriesMatchData).map(([seriesName, matches]) => (
                <SeriesCard
                  key={seriesName}
                  seriesName={seriesName}
                  matches={matches}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Home;
