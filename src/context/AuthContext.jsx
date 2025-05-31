import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();
const API = "http://localhost:8080";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const savedToken = localStorage.getItem("token")?.trim() || "";
      if (!savedToken) return logout();

      const res = await fetch(`${API}/usuarios/me`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.usuario);
        setToken(savedToken);
      } else {
        logout();
      }
    } catch (err) {
      console.error("Error autenticando:", err);
      logout();
    }
  };

  const login = async (correo, password) => {
    try {
      const res = await fetch(`${API}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });
      
      const data = await res.json();
      if (data.success) {
        setUser(data.usuario);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        return { success: true, usuario: data.usuario };
      } else {
        return { success: false, mensaje: data.mensaje };
      }

    } catch (err) {
      return { success: false, mensaje: "Error en el servidor" };
    }
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
