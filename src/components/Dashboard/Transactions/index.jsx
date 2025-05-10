import React, { useEffect } from 'react';
import { useContext } from 'react';
import { UserContext } from '../../../Context/UserContext';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';
const Transactions = () => {
  // const {user} = useContext(UserContext);
  // useEffect(async() => {
  //   try {
  //     const response = await axios.get()
  //   } catch (error) {
      
  //   }
  //   return () => {
  //     second
  //   }
  // }, [third])
  
  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white p-4">
      <h1 className="mt-7 text-2xl font-bold mb-4">Transaction History</h1>
      <div className="bg-blue-800 bg-opacity-30 rounded-lg p-4">
        {/* Add your transaction list/table here */}
        <p>No transactions to display</p>
      </div>
    </div>
    </>
  );
};

export default Transactions;