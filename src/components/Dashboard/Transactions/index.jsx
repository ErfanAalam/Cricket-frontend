import React from 'react';

const Transactions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Transaction History</h1>
      <div className="bg-blue-800 bg-opacity-30 rounded-lg p-4">
        {/* Add your transaction list/table here */}
        <p>No transactions to display</p>
      </div>
    </div>
  );
};

export default Transactions;