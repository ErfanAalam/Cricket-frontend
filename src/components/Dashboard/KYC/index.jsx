import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../Navbar/Navbar';
const KYCVerification = () => {
  const [aadharName, setAadharName] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [panName, setPanName] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!aadharName.trim()) newErrors.aadharName = 'Name cannot be empty';
    if (!aadharNumber || aadharNumber.length !== 12) {
      newErrors.aadharNumber = 'Valid 12-digit Aadhar number required';
    }
    if (!panName.trim()) newErrors.panName = 'Name cannot be empty';
    if (!panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber)) {
      newErrors.panNumber = 'Valid PAN number required (e.g., ABCDE1234F)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all fields correctly');
      return;
    }

    const kycData = {
      aadharName,
      aadharNumber,
      panName,
      panNumber
    };

    try {
      // Show loading toast
      const toastId = toast.loading('Submitting KYC details...');
      
      // TODO: Add your API call here
      console.log('Form Data Object:', kycData);
      
      // Update toast on success
      toast.update(toastId, {
        render: 'KYC details submitted successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });
    } catch (error) {
      toast.error('Failed to submit KYC details. Please try again.');
    }
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white p-4 md:p-8">
      <div className="mt-10 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
          KYC Verification
        </h1>
        
        <div className="bg-blue-800/30 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Aadhar Card Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-blue-300">Aadhar Card Details</h2>
              <div>
                <input 
                  type="text" 
                  className={`w-full p-3 rounded-lg bg-blue-700/30 border ${
                    errors.aadharName ? 'border-red-500' : 'border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter Name as per Aadhar"
                  value={aadharName}
                  onChange={(e) => setAadharName(e.target.value)}
                />
                {errors.aadharName && (
                  <p className="text-red-500 text-sm mt-1">{errors.aadharName}</p>
                )}
              </div>
              <div>
                <input 
                  type="text"
                  className={`w-full p-3 rounded-lg bg-blue-700/30 border ${
                    errors.aadharNumber ? 'border-red-500' : 'border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter 12-digit Aadhar Number"
                  value={aadharNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 12) {
                      setAadharNumber(value);
                    }
                  }}
                />
                {errors.aadharNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.aadharNumber}</p>
                )}
              </div>
            </div>

            {/* PAN Card Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-blue-300">PAN Card Details</h2>
              <div>
                <input 
                  type="text" 
                  className={`w-full p-3 rounded-lg bg-blue-700/30 border ${
                    errors.panName ? 'border-red-500' : 'border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter Name as per PAN"
                  value={panName}
                  onChange={(e) => setPanName(e.target.value)}
                />
                {errors.panName && (
                  <p className="text-red-500 text-sm mt-1">{errors.panName}</p>
                )}
              </div>
              <div>
                <input 
                  type="text" 
                  className={`w-full p-3 rounded-lg bg-blue-700/30 border ${
                    errors.panNumber ? 'border-red-500' : 'border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter PAN Number (e.g., ABCDE1234F)"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  maxLength={10}
                />
                {errors.panNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.panNumber}</p>
                )}
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 
                       hover:from-blue-600 hover:to-blue-700 text-white font-semibold 
                       py-3 px-8 rounded-lg transform hover:scale-[1.02] 
                       transition-all duration-300 shadow-lg"
            >
              Submit KYC Details
            </button>
          </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default KYCVerification;