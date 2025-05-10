import { useState } from "react";
import Button from "../../ui/Button";
import { CirclePlus, X } from "lucide-react";

const notifications = [

]

export default function Notifications() {
  const [popup, setPopup] = useState(false)
  const [datetime, setDatetime] = useState("")
  const [text, setText] = useState("")

  return (
    <section className="bg-[#081f58] flex flex-col gap-5 rounded-2xl ml-5 p-4 sm:p-8 w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-white">
        {/* Sidebar */}
        <h1 className="text-lg font-semibold">Notifications Sent</h1>
        <Button onClick={() => setPopup(true)} className={"flex gap-2 w-full sm:w-auto"}>
          <CirclePlus className="fill-white text-[#193cb8]" />
          New Notification
        </Button>
        {popup &&
          <div className="fixed inset-0 w-screen h-screen justify-center flex items-center bg-black/30 backdrop-blur-xs z-50">
            <div
              onClick={() => setPopup(false)}
              className="fixed inset-0 w-screen h-screen z-40"
            />
            <div className="z-50 bg-[#000e2d] border-2 rounded-2xl border-[#4c6590] p-4 sm:p-5 flex flex-col gap-5 w-[95vw] max-w-md">
              <div className=" mb-5 flex justify-between items-center ">
                <h1 className="font-bold"> Broadcast Notification </h1>
                <X
                  onClick={() => setPopup(false)}
                  className="size-7 rounded-lg p-1 hover:bg-blue-900 cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Message</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type here..."
                  className="p-2 rounded-lg border bg-gray-400/10 border-gray-300/20 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Schedule</label>
                <input
                  type="datetime-local"
                  value={datetime}
                  onChange={(e) => setDatetime(e.target.value)}
                  className="p-2 rounded-lg border bg-gray-400/10 border-gray-300/20 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Select Users</label>
                <select className="p-2 rounded-lg border bg-gray-400/10 border-gray-300/20 focus:outline-none focus:ring-2 focus:ring-white">
                  <option value="all">All</option>
                  <option value="user1">Users in loss</option>
                  <option value="user2">User in profit</option>
                  <option value="user2">Today Login</option>
                  <option value="user2">New User</option>
                  <option value="user2">User Inactive for 24hr</option>
                </select>
              </div>

              <Button className="bg-blue-800 hover:bg-blue-900 text-white w-fit h-fit py-2 px-4 mt-5 rounded-lg cursor-pointer">
                Send Notification
              </Button>
            </div>
          </div>
        }
      </div>
      <div className="overflow-x-auto">
        {/* create a table with three columns title, Date, Time */}
        <table className="w-full min-w-[400px] text-left text-sm sm:text-base">
          <thead>
            <tr>
              <th className="py-2 px-4">Title</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Time</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
            <tr className="border-b border-white/20 ">
              <td className="py-2 px-4">very long notification title</td>
              <td className="py-2 px-4">10/10/1000</td>
              <td className="py-2 px-4">10:10 PM</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section >
  )
}
