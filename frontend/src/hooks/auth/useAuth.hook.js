import { login, register } from "../../services/auth/auth.service";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await login(data);
      console.log("INI RESPONSE LOGIN", response);

      const token = response.token;
      const role = response.data.role;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      toast.success("Login Berhasil", {
        duration: 2000,
        style: {
          background: "#10b981",
          color: "white",
          borderBlockEnd: "1px solid #5bf1c2ff",
        },
      });

      if (role === "hrd") {
        navigate("/hrd/dashboard");
      } else if (role === "karyawan") {
        navigate("/karyawan/dashboard");
      } else {
        navigate("/");
      }

      return response;
    } catch (error) {
      toast.error(error.response?.data.msg, {
        duration: 2000,
        style: {
          background: "#E25E5E",
          color: "white",
        },
      });
      setError(error.response?.data.msg || "Terjadi Kesalahan Pada Server");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const response = await register(data);
      toast.success("Register Berhasil", {
        duration: 2000,
        style: {
          background: "#10b981",
          color: "black",
          borderBlockEnd: "1px solid #059669",
        },
      });
      return response;
    } catch (error) {
      toast.error(error.response?.data.msg, {
        duration: 2000,
        style: {
          background: "#E25E5E",
          color: "white",
        },
      });
      setError(error.response?.data.msg || "Terjadi Kesalahan pada server");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    handleLogin,
    handleRegister,
  };
}
