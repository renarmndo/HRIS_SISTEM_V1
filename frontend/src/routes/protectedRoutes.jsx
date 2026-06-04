import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    if (!decoded?.exp) return false;
    if (decoded.exp * 1000 < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
};

const getRequiredRole = (pathname) => {
  if (pathname.startsWith("/hrd")) return "hrd";
  if (pathname.startsWith("/karyawan")) return "karyawan";
  return null;
};

export default function ProtectedRoutes({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!isTokenValid(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    return <Navigate to={"/login"} replace state={{ from: location }} />;
  }

  const requiredRole = getRequiredRole(location.pathname);
  const userRole = localStorage.getItem("role") || jwtDecode(token)?.role;

  if (requiredRole && userRole !== requiredRole) {
    const fallback = userRole === "hrd" ? "/hrd/dashboard" : "/karyawan/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
