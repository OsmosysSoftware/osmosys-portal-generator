import { UserRole } from '../constants/roles';

export interface User {
  user_id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  user_role?: UserRole;
  organization_id?: number;
  status: number;
  created_on?: string;
  updated_on?: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
  organization_id?: number;
  iat: number;
  exp: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  // Some backends (e.g. the Osmosys api-generator) return tokens only on
  // login/refresh and expose the user via /auth/me. Optional so token
  // persistence never depends on it.
  user?: User;
  expires_in: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refresh_token: string;
}

export interface MeResponse {
  user: User;
}
