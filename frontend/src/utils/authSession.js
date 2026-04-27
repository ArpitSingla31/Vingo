import axios from "axios";

const authStorageKey = "vingo-authenticated";
const authTokenKey = "vingo-auth-token";

const setAxiosAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete axios.defaults.headers.common.Authorization;
};

export const restoreAuthSession = () => {
  const token = window.localStorage.getItem(authTokenKey);
  setAxiosAuthToken(token);
  return token;
};

export const hasStoredAuthSession = () =>
  window.localStorage.getItem(authStorageKey) === "true";

export const saveAuthSession = (token) => {
  window.localStorage.setItem(authStorageKey, "true");

  if (token) {
    window.localStorage.setItem(authTokenKey, token);
    setAxiosAuthToken(token);
  }
};

export const clearAuthSession = () => {
  window.localStorage.removeItem(authStorageKey);
  window.localStorage.removeItem(authTokenKey);
  setAxiosAuthToken(null);
};

