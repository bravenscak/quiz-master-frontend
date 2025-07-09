export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  roleId: number;
  organizationName?: string;
  description?: string;
}

export interface AuthResponse {
  token: string;
  expiration: string; 
  user: UserResponse;
}

export interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  organizationName?: string;
  description?: string;
  roleName: string;
  isApproved: boolean;
}