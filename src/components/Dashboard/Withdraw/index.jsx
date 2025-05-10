import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../../Context/UserContext.jsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../Navbar/Navbar.jsx';
const Withdraw = () => {
  const { user } = useContext(UserContext);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLimitUpper] = useState(10000);
  const [withdrawLimitLower] = useState(1000);
  const [withdrawHistory] = useState([
    {
      id: 1,
      date: new Date(2025, 3, 26).toLocaleDateString(),
      amount: 5000,
      status: 'Completed',
      transactionId: 'TXN123456'
    },
    {
      id: 2,
      date: new Date(2025, 3, 25).toLocaleDateString(),
      amount: 2500,
      status: 'Processing',
      transactionId: 'TXN123455'
    },
    {
      id: 3,
      date: new Date(2025, 3, 24).toLocaleDateString(),
      amount: 7500,
      status: 'Completed',
      transactionId: 'TXN123454'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const amount = parseFloat(withdrawAmount);

    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > withdrawLimitUpper) {
      toast.error(`Maximum withdrawal limit is ₹${withdrawLimitUpper.toLocaleString()}`);
      return;
    }
    if (amount < withdrawLimitLower) {
      toast.error(`Minimum withdrawal limit is ₹${withdrawLimitLower.toLocaleString()}`);
      return;
    }

    if (amount > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Processing withdrawal...');

    try {
      // TODO: Add your API call here
      // await withdrawFunds(amount);

      toast.update(toastId, {
        render: 'Withdrawal successful!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });

      setWithdrawAmount('');
    } catch (error) {
      toast.update(toastId, {
        render: error.message || 'Failed to process withdrawal',
        type: 'error',
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
          Withdraw Funds
        </h1>

        {/* Balance Card */}
        <div className="bg-blue-800/30 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <div className="text-center">
            <p className="text-gray-300 mb-2">Available Balance</p>
            <p className="text-3xl font-bold text-blue-300">
              ₹{user.balance?.toLocaleString() || '0'}
            </p>
          </div>
        </div>

        {/* Withdraw Form */}
        <div className="bg-blue-800/30 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-blue-300 mb-2">
                Enter Amount to Withdraw
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  ₹
                </span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full p-3 pl-8 rounded-lg bg-blue-700/30 border border-blue-500 
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                  />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Minimum: ₹{withdrawLimitLower.toLocaleString()} | Maximum: ₹{withdrawLimitUpper.toLocaleString()}
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 
              hover:from-blue-600 hover:to-blue-700 text-white font-semibold 
              py-3 px-8 rounded-lg transform hover:scale-[1.02] 
              transition-all duration-300 shadow-lg disabled:opacity-50"
              >
              {isLoading ? 'Processing...' : 'Withdraw'}
            </button>
          </form>
        </div>

        {/* Withdrawal History */}
        {withdrawHistory.length > 0 && (
          <div className="mt-8 bg-blue-800/30 backdrop-blur-sm rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-blue-300 mb-4">
              Recent Withdrawals
            </h2>
            <div className="space-y-4">
              {withdrawHistory.map((withdrawal) => (
                <div
                key={withdrawal.id}
                className="flex justify-between items-center p-4 bg-blue-700/20 rounded-lg hover:bg-blue-700/30 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-gray-300">{withdrawal.date}</p>
                    <p className="text-sm text-gray-400">TxID: {withdrawal.transactionId}</p>
                    <span className={`text-xs px-2 py-1 rounded ${withdrawal.status === 'Completed'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                      }`}>
                      {withdrawal.status}
                    </span>
                  </div>
                  <p className="text-xl font-semibold text-blue-300">
                    ₹{withdrawal.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="light"
        />
    </div>
        </>
  );
};

export default Withdraw;
