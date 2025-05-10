import HoldingCard from "./HoldingCard";

const CurrentHolding = ({ holdings }) => {
  return (
    <div className="space-y-4">
      {/* Mobile layout */}
      <div className="md:hidden space-y-4">
        {holdings.map(h => <HoldingCard key={h.id} holding={h} />)}
      </div>

      {/* Desktop layout */}
      <div className="hidden md:grid md:grid-cols-6 gap-4 text-sm text-white">
        {holdings.map(h => (
          <React.Fragment key={h.id}>
            <div className="text-xs">{h.qty}</div>
            <div className="text-xs">{h.avg}</div>
            <div className="flex items-center space-x-2">
              <img src={h.avatar} className="w-8 h-8 rounded-full" alt="" />
              <span>{h.name}</span>
            </div>
            <div className="text-xs">{h.id}</div>
            <div className={`text-right ${h.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ₹{h.pnl}
            </div>
            <div className="text-xs">{h.status}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CurrentHolding;