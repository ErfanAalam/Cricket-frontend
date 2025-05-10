import { useState, useRef, useEffect } from "react";
import MatchCard from "../CurrentMatches/MatchCard";
import { ChevronDown, ChevronUp } from "lucide-react";

const SeriesCard = ({ seriesName, matches }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState("0px");

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? `${contentRef.current.scrollHeight}px` : "0px");
    }
  }, [isOpen]);

  return (
    <div className="mb-6 bg-[#071c38f3]/100 border border-[#071c38f3]/50 rounded-xl overflow-hidden transition-all duration-500 sc">
      {/* Series Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-6 py-4 text-white focus:outline-none"
      >
        <h2 className="text-left text-xl font-semibold">{seriesName}</h2>
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </button>

      {/* Collapsible Match List with animation */}
      <div
        ref={contentRef}
        style={{
          maxHeight: height,
          transition: "max-height 0.5s ease, opacity 0.3s ease",
          opacity: isOpen ? 1 : 0,
        }}
        className="overflow-hidden"
      >
        <div className="flex flex-col gap-5 p-5">
          {matches.map((match) => (
            <MatchCard key={match.matchId} match={match} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeriesCard;