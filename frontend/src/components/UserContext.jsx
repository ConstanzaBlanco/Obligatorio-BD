import { createContext, useContext, useState, useEffect } from "react";

export const UserContext = createContext({
  user: null,
  token: null,
  loadingUser: true,
  login: () => {},
  logout: () => {},
});


export function useUser() {
  return useContext(UserContext);
}


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
      } catch (error) {
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

  const logout = () => {
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
