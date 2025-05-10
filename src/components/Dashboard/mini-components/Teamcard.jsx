import React from "react";
import { useNavigate } from "react-router-dom";

const Teamcard = ({ team }) => {
  const navigate = useNavigate()

  // console.log(team);
  
  
  return (
    <div
      className={`flex flex-col gap-42rounded-lg p-3 rounded-xl border ${
        team.color === "green" ? "border-green-500" : "border-red-500"
      }`}
    onClick={()=>{team.name !== 'Team 1' ? navigate("/team-stats") : null}}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm  md:text-xl h-10">{team.name}</span>
      </div>

      <div className="text-center mb-1">
        <div className="text-xl md:text-3xl font-bold">
          ₹
          <span
            className={
              team.color === "green"
                ? "text-green-500"
                : team.color === "red"
                ? "text-red-500"
                : ""
            }
          >
            {team.price}
          </span>
        </div>
        <div className="text-xs text-gray-400">Team Price</div>
        <div className="text-xs text-gray-400">{team.percentage}</div>
      </div>

      <div className="h-16 md:h-32 flex items-end justify-between">
        {team.graphData.map((value, index) => (
          <div
            key={index}
            className={`w-1 md:w-5 ${
              team.color === "green" ? "bg-green-500" : "bg-red-500"
            }`}
            style={{
              height: `${(value / Math.max(...team.graphData)) * 100}%`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Teamcard;
