export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface LoginResponse {
  data: {
    user: AuthUser;
    token: string;
  };
  meta?: {
    message: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
}
