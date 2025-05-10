const HoldingCard = ({ holding }) => {
    return (
      <div className="flex flex-col bg-blue-800 p-4 rounded-lg space-y-2 text-white">
        <div className="flex justify-between text-xs">
          <span>Qty {holding.qty}</span>
          <span>Avg {holding.avg}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src={holding.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
            <div>
              <div className="font-semibold">{holding.name}</div>
              <div className="text-xs text-gray-300">{holding.id} | {holding.role}</div>
            </div>
          </div>
          <div className={`font-bold text-lg ${holding.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ₹{holding.pnl}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-300">
          <span>Invested {holding.invested}</span>
          <span>Price {holding.currentPrice}</span>
        </div>
      </div>
    );
  };
  
  export default HoldingCard;