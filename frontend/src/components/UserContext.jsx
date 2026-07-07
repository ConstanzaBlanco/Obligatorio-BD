import { useState, useEffect } from "react";
import { UserContext } from "./useUser";

export default function UserProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoadingUser(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          logout();
        }
      } catch {
        logout();
      }

      setLoadingUser(false);
    };

    fetchUser();
  }, [token]);

  const login = async (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = async () => {
    const currentToken = localStorage.getItem("token");

    try {
      if (currentToken) {
        await fetch("http://localhost:8000/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${currentToken}`
          }
        });
      }
    } catch (err) {
      console.error("Error al cerrar sesión en backend:", err);
    }

    // Limpiar FRONTEND siempre
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        loadingUser,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
