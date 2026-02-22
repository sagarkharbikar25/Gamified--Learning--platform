import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";
 
const AuthContext = createContext(null);
 
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
 
  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem("eduquest_token");
    const savedUser = localStorage.getItem("eduquest_user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Refresh user data from API
      authAPI.getMe()
        .then(res => { setUser(res.data.user); localStorage.setItem("eduquest_user", JSON.stringify(res.data.user)); })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);
 
  const login = useCallback(async (email, password, role) => {
    const res = await authAPI.login({ email, password, role });
    const { token, user } = res.data;
    localStorage.setItem("eduquest_token", token);
    localStorage.setItem("eduquest_user", JSON.stringify(user));
    setUser(user);
    toast.success(`Welcome back, ${user.name.split(" ")[0]}! 🎉`);
    return user;
  }, []);
 
  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    const { token, user } = res.data;
    localStorage.setItem("eduquest_token", token);
    localStorage.setItem("eduquest_user", JSON.stringify(user));
    setUser(user);
    toast.success(`Account created! Welcome to EduQuest 🚀`);
    return user;
  }, []);
 
  const logout = useCallback(() => {
    localStorage.removeItem("eduquest_token");
    localStorage.removeItem("eduquest_user");
    setUser(null);
    toast("Signed out successfully");
  }, []);
 
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("eduquest_user", JSON.stringify(updatedUser));
  }, []);
 
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
 
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
