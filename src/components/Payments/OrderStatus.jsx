import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";


import {
  Call,
  Download,
  Home,
  MoneyOutlined,
  Numbers,
  Payment,
  PermIdentity,
  WatchLater,
} from "@mui/icons-material";

const OrderStatus = () => {
  const downloadReceipt = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
  
    doc.setFillColor(22, 113, 204);
    doc.rect(0, 0, pageWidth, 30, "F");
  
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Receipt", pageWidth / 2, 20, { align: "center" });
  
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
  
    let date = new Date().toLocaleString();
    const time = date.split(",")[1];
    date = date.split(",")[0];
    const tableBody = [
      ["Customer OID", paymentData?.merchantTransactionId || "N/A"],
      ["Cashfree OID", paymentData?.merchantId || "N/A"],
      ["Name", paymentData?.customerName || "N/A"],
      ["Phone Number", paymentData?.customerPhone || "N/A"],
      ["Amount (INR)", `Rs ${paymentData?.amount || "0"}`],
      ["Status", paymentData?.state || "N/A"],
      ["Date", date],
      ["Time", time],
    ];
  
    autoTable(doc, {
      startY: 40,
      head: [["Field", "Details"]],
      body: tableBody,
      theme: "grid",
      headStyles: { fillColor: [22, 113, 204], textColor: 255 },
      styles: { cellPadding: 4, fontSize: 11 },
    });
  
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      "This is a system generated receipt. For support, contact support@cricstock11.com",
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  
    const fileName = `${paymentData.customerName?.split(" ")[0] || "user"}-${
      paymentData.merchantTransactionId?.split("_")[1] || "order"
    }.pdf`;
  
    doc.save(fileName);
  };    
  const navigate = useNavigate();
  const BACK = import.meta.env.VITE_BACKEND_URL;
  const { orderId } = useParams();
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const goToHome = () => navigate("/UserProfile");

  const getTransactionStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in again");
        return;
      }

      const response = await axios.get(
        `${BACK}/payment/check-order/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data?.orderDetails || {};
      const status = data.order_status;
      console.log(response);
      if (status === "PAID") {
        toast.success("Payment Successful");

        setPaymentData({
          merchantTransactionId: data.order_id,
          merchantId: data.cf_order_id,
          state: data.order_status,
          amount: data.order_amount,
          customerName: data.customer_details?.customer_name,
          customerPhone: data.customer_details?.customer_phone,
          createdAt: data.created_at,
        });
      } else {
        toast.info("No Such Transaction");
      }
    } catch (error) {
      console.error("Error fetching transaction status:", error);

      const errMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to fetch payment status.";

      if (error.response?.status === 404) {
        toast.error("Transaction not found.");
      } else if (error.response?.status === 401) {
        toast.error("Unauthorized. Please log in again.");
      } else {
        toast.error(errMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getTransactionStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-700">Fetching payment status...</p>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-8">
        <p className="text-gray-800 text-lg">
          No successful transaction found.
        </p>
        <button
          onClick={goToHome}
          className="mt-4 border border-blue-600 px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition"
        >
          <Home /> Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="border-2 border-black bg-white shadow-xl rounded-2xl p-6 max-w-2xl w-full">
        <h2 className="text-2xl sm:text-3xl font-semibold text-black text-center mb-6 border-b-2 pb-4">
          Payment Status
        </h2>

        <div className="space-y-4 text-sm sm:text-base text-gray-700">
          <div className="flex flex-col sm:flex-row justify-between">
            <span className="font-medium">
              <Numbers /> Order ID
            </span>
            <span className="break-all">
              {paymentData.merchantTransactionId}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between">
            <span className="font-medium">
              <Payment /> Cashfree Order ID
            </span>
            <span className="break-all">{paymentData.merchantId}</span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between">
            <span className="font-medium">
              <PermIdentity /> Customer
            </span>
            <span>{paymentData.customerName}</span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between">
            <span className="font-medium">
              <Call /> Phone
            </span>
            <span>{paymentData.customerPhone}</span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between">
            <span className="font-medium">
              <WatchLater /> Status
            </span>
            <span className="capitalize font-semibold px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 border">
              {paymentData.state}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between">
            <span className="font-medium">
              <MoneyOutlined /> Amount
            </span>
            <span>₹{paymentData.amount}</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-5 border-t-2 border-black pt-5">
          <button
            onClick={downloadReceipt}
            className="border-2 border-[#1671CC] hover:bg-[#1671CC]  text-[#1671CC] hover:text-white px-5 py-2 rounded-lg shadow-md transition"
          >
            <Download /> Download Receipt
          </button>
          <button
            onClick={goToHome}
            className="hover:bg-[#1671CC] text-[#1671CC] hover:text-white px-5 py-2 rounded-lg transition"
          >
            <Home /> Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
