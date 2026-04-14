import api, { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "./index";

export const getStoredAccessToken = () =>
  localStorage.getItem(ACCESS_TOKEN_KEY);

export const getStoredRefreshToken = () =>
  localStorage.getItem(REFRESH_TOKEN_KEY);

export const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const storeTokens = ({ access, refresh }) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};

export const login = async ({ username, password }) => {
  const res = await api.post("/token/", { username, password });
  storeTokens(res.data);
  return res.data;
};

export const register = async ({ username, email, password }) => {
  const res = await api.post("/register/", { username, email, password });
  return res.data;
};

export const fetchProfile = async () => {
  const res = await api.get("/profile/");
  return res.data;
};

export const updateProfile = async (payload) => {
  const isFormData = payload instanceof FormData;
  const res = await api.patch("/profile/", payload, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
  return res.data;
};

export const getApiErrorMessage = (error, fallbackMessage) => {
  const data = error?.response?.data;

  if (!data) return fallbackMessage;

  if (typeof data.detail === "string") {
    return data.detail;
  }

  const usernameError = Array.isArray(data.username)
    ? data.username.join(" ")
    : "";
  const emailError = Array.isArray(data.email) ? data.email.join(" ") : "";

  if (usernameError && emailError) {
    return `${usernameError} ${emailError}`.trim();
  }

  if (usernameError || emailError) {
    return usernameError || emailError;
  }

  const nonFieldErrors = Array.isArray(data.non_field_errors)
    ? data.non_field_errors.join(" ")
    : "";

  if (nonFieldErrors) {
    return nonFieldErrors;
  }

  return fallbackMessage;
};
