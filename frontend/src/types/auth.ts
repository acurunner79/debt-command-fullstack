export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export type MeResponse = {
  user: AuthUser;
};