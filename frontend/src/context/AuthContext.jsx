// src/context/AuthContext.jsx
import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}
