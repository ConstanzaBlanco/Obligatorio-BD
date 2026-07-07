import { createContext, useContext } from "react";

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
