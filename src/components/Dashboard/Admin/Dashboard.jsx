import { Outlet, Link, useParams, useLocation } from "react-router-dom";
import Button from "../../../components/ui/Button";
import { LogOut, ChevronDown } from "lucide-react";

export default function Dashboard() {

  return (
    <section className="w-full min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between text-white w-full">
        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 order-2 lg:order-1">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold">Analytics</h1>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6">
            {/* div 1 */}
            <div className="bg-blue-900/30 border-blue-800 rounded-2xl">
              <div className="p-6">
                <div className="text-6xl font-light mb-2">100</div>
                <div className="text-lg font-medium mb-1">Total User Login</div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-300">Last Month</span>
                  <span className="ml-2 text-green-500">+109</span>
                  <span className="ml-2 text-green-500">Up 25%</span>
                </div>
              </div>
            </div>

            {/* div 2 */}
            <div className="bg-blue-900/30 border-blue-800 rounded-2xl">
              <div className="p-6">
                <div className="text-6xl font-light mb-2">45</div>
                <div className="text-lg font-medium mb-1">Company Profit</div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-300">Last Month</span>
                  <span className="ml-2 text-green-500">+108</span>
                  <span className="ml-2 text-green-500">Up 11%</span>
                </div>
              </div>
            </div>

            {/* div 3 */}
            <div className="bg-blue-900/30 border-blue-800 rounded-2xl">
              <div className="p-6">
                <div className="text-6xl font-light mb-2">45</div>
                <div className="text-lg font-medium mb-1">Company Loss</div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-300">Last Month</span>
                  <span className="ml-2 text-red-500">-10</span>
                  <span className="ml-2 text-red-500">Down 15%</span>
                </div>
              </div>
            </div>

            {/* div 4 */}
            <div className="bg-blue-900/30 border-blue-800 rounded-2xl">
              <div className="p-6">
                <div className="text-6xl font-light mb-2">100</div>
                <div className="text-lg font-medium mb-1">Number of total user</div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-300">Last Month</span>
                  <span className="ml-2 text-green-500">+109</span>
                  <span className="ml-2 text-green-500">Up 25%</span>
                </div>
              </div>
            </div>

            {/* div 5 */}
            <div className="bg-blue-900/30 border-blue-800 rounded-2xl">
              <div className="p-6">
                <div className="text-6xl font-light mb-2">45</div>
                <div className="text-lg font-medium mb-1">Profitable user</div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-300">Last Month</span>
                  <span className="ml-2 text-green-500">+108</span>
                  <span className="ml-2 text-green-500">Up 11%</span>
                </div>
              </div>
            </div>

            {/* div 6 */}
            <div className="bg-blue-900/30 border-blue-800 rounded-2xl">
              <div className="p-6">
                <div className="text-6xl font-light mb-2">45</div>
                <div className="text-lg font-medium mb-1">User having losses</div>
                <div className="flex items-center text-sm">
                  <span className="text-gray-300">Last Month</span>
                  <span className="ml-2 text-red-500">-10</span>
                  <span className="ml-2 text-red-500">Down 15%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Activity */}
          <div className="bg-blue-900/30 border-blue-800 rounded-2xl">
            <div className="p-4 sm:p-6">
              <h2 className="text-xl font-bold mb-6">Transaction Activity</h2>
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/3 flex justify-center items-center mb-6 md:mb-0">
                  <div className="relative w-48 h-48">
                    <div className="w-full h-full rounded-full bg-blue-900/50 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold">234</div>
                        <div className="text-sm text-gray-300">Total Transition</div>
                      </div>
                    </div>
                    {/* Green progress arc - would need SVG for exact replication */}
                    <div className="absolute inset-0 w-full h-full">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="1"
                          strokeDasharray="283"
                          strokeDashoffset="0"
                          className="opacity-20"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#22C55E"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray="283"
                          strokeDashoffset="70"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-2/3 overflow-x-auto">
                  <table className="w-full min-w-[400px]">
                    <thead>
                      <tr className="border-b border-blue-800">
                        <th className="text-left py-3">Transaction Type</th>
                        <th className="text-left py-3">Account</th>
                        <th className="text-left py-3">Transaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-blue-800">
                        <td className="py-3">Deposit</td>
                        <td className="py-3">122</td>
                        <td className="py-3">2</td>
                      </tr>
                      <tr className="border-b border-blue-800">
                        <td className="py-3">Withdraw</td>
                        <td className="py-3">122</td>
                        <td className="py-3">2</td>
                      </tr>
                      <tr>
                        <td className="py-3">Discount</td>
                        <td className="py-3">122</td>
                        <td className="py-3">2</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members Sidebar */}
        <div className="w-full lg:w-80 border-2 border-[#102a6a] rounded-2xl p-4 sm:p-6 mb-6 lg:mb-0 order-2 lg:order-1">
          <h2 className="text-xl font-bold mb-6">Team members</h2>
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  {/* <Avatar className="h-10 w-10 bg-gray-300"> */}
                  {/*   <AvatarImage src="/placeholder.svg" alt="Team member" /> */}
                  {/*   <AvatarFallback>TM</AvatarFallback> */}
                  {/* </Avatar> */}
                  <div className="ml-3">
                    <div className="font-medium">Lorem Ipsum</div>
                    <div className="text-sm text-gray-400">Profile</div>
                  </div>
                </div>
                <Button variant="outline" className="bg-blue-900/30 flex items-center border-blue-800 text-white text-xs px-3">
                  Access <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
