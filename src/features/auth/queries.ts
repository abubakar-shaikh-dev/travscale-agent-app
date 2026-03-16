import { useMutation } from "@tanstack/react-query";
import { loginApi, logoutApi, getCurrentUserApi } from "./api";
import type { LoginCredentials } from "./types";

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginApi(credentials),
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.data.token);
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      localStorage.removeItem("auth_token");
      window.location.href = "/auth/login";
    },
  });
};

export const useCurrentUser = () => {
  return useMutation({
    mutationFn: getCurrentUserApi,
  });
};
