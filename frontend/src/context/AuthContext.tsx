import React, { createContext, useContext, useState, useEffect } from "react";
import { LoginCredentials, AuthState, User } from "../types/auth";
import { jwtDecode } from "jwt-decode";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// 🔹 Role validation function
function isValidRole(role: string): role is "admin" | "expert" {
  return role === "admin" || role === "expert";
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    console.log("🔹 Stored Token:", token);

    if (token) {
      try {
        const decoded = jwtDecode<{ id: string; role: string; name?: string; expertName?: string; username?: string }>(token);
        console.log("🔹 Decoded User Data:", decoded);

        // Validate role before updating state
        const role = isValidRole(decoded.role) ? decoded.role : "expert";

        const user: User = {
          id: decoded.id,
          role,
          name: decoded.name || "Unknown",
          expertName: decoded.expertName || "",
          username: decoded.username || "", // 🔹 Ensure username exists
        };

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

      } catch (error) {
        console.error("❌ Token Error:", error);
        localStorage.removeItem("auth_token");
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Session expired. Please login again.",
        });
      }
    } else {
      console.log("ℹ️ No token found, user is not authenticated");
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // 🔹 Login function
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch("https://sb1-k8e7.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log("🔹 Login API Response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid server response. Missing token or user data.");
      }

      localStorage.setItem("auth_token", data.token);

      // Validate role before setting state
      const role = isValidRole(data.user.role) ? data.user.role : "expert";

      const user: User = {
        id: data.user.id,
        role,
        name: data.user.name || "Unknown",
        expertName: data.user.expertName || "",
        username: data.user.username || "", // 🔹 Ensure username exists
      };

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log("🔹 Auth State Updated:", user);

      return true;
    } catch (error: any) {
      console.error("❌ Login error:", error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Network error",
      }));
      return false;
    }
  };

  // 🔹 Logout function
  const logout = () => {
    localStorage.removeItem("auth_token");
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
