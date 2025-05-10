import { Outlet, Link, useParams, useLocation, useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button";
import { LogOut, ChevronDown, Menu, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useState } from "react";

const MobileSidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-0 top-0 left-0 z-50 h-full w-[16rem] p-4 py-8 flex flex-col items-center gap-5 bg-[#001440] transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* <button onClick={onClose} className="p-1 absolute top-3 right-3 rounded-lg hover:bg-white/10"> */}
        {/*   <X className="h-6 w-6" /> */}
        {/* </button> */}
        <div className="w-full flex justify-center mt-10">
          <div className="flex flex-col items-center gap-3">
            <img src="/assets/dmdp.jpg" alt="Logo" className="h-10 w-10 rounded-full" />
            <h2 className="text-lg">Very Long User Name</h2>
          </div>
        </div>
        <hr className="w-full border-white/40" />

        <div className="flex flex-col justify-between h-full items-center">
          <div className="space-y-2 w-full mt-10">
            <Link
              to={"/admin/dashboard"}
              onClick={onClose}
              className={cn(
                "flex items-center py-3 px-4 text-white rounded-lg",
                useLocation().pathname == "/admin/dashboard" ? "bg-green-500/20 text-green-500" : "hover:bg-white/10"
              )}
            >
              <span className="font-medium">Admin Dashboard</span>
            </Link>
            <Link
              to={"/admin/notifications"}
              onClick={onClose}
              className={cn(
                "flex items-center py-3 px-4 text-white rounded-lg",
                useLocation().pathname == "/admin/notifications" ? "bg-green-500/20 text-green-500" : "hover:bg-white/10"
              )}
            >
              <span className="font-medium">Notifications Manager</span>
            </Link>
          </div>

          <Button className="w-full flex justify-center items-center font-medium bg-transparent">
            <LogOut className="mr-2 size-5 stroke-3" />
            Log Out
          </Button>
        </div>
      </div>
    </>
  );
};

export default function AdminLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const handleLogout = () => {
    // Perform logout logic here
    localStorage.removeItem("token");
    navigate("/admin/login") // Redirect to login page
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-2 bg-[#001440] w-screen h-screen px-2 md:px-5 py-2 md:py-5">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="md:hidden fixed border-2 border-white/40 top-4 right-4 z-50 p-2 rounded-lg bg-[#102a6a] text-white"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Mobile Sidebar */}
        <MobileSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Desktop Sidebar */}
        <div className="hidden md:flex p-2 py-8 w-[16rem] border-2 border-white/40 rounded-2xl flex-col gap-10 items-center justify-between bg-[#001440]">
          <div className="flex flex-col items-center mb-8">
            <img src="/assets/dmdp.jpg" alt="Logo" className="h-16 w-16 rounded-full" />
            <h2 className="mt-4 text-lg text-center">Very Long User Name</h2>
          </div>

          <div className="space-y-2 -mt-5 w-full">
            <Link
              to={"/admin/dashboard"}
              className={cn(
                "flex items-start py-2 px-2 text-white border-l-4 border-transparent",
                useLocation().pathname == "/admin/dashboard" && "border-green-500 text-green-500"
              )}
            >
              <span className="ml-2 font-medium">Admin Dashboard</span>
            </Link>
            <Link
              to={"/admin/notifications"}
              className={cn(
                "flex items-start py-2 px-2 text-white hover:bg-blue-900/20 border-l-4 border-transparent",
                useLocation().pathname == "/admin/notifications" && "border-green-500 text-green-500"
              )}
            >
              <span className="ml-2 font-medium">Notifications Manager</span>
            </Link>
          </div>

          <Button onClick={handleLogout}
            className="flex justify-center items-center font-medium bg-transparent">
            <LogOut className="mr-2 size-5 stroke-3" />
            Log Out
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </>
  );
}
