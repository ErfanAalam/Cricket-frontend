import { Navigate, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { isUserAdmin } from "../../../lib/actions";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const RequireAdminAuth = async () => {
  const isAdmin = await isUserAdmin();
  return isAdmin ? <Outlet /> : <Navigate to="/admin/login" />;
};

export default RequireAdminAuth
