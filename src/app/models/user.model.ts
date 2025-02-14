export interface User {
  userId?: string;
  name: string;
  email: string;
  password: string;
  createdAt?: string;
  roles?: string[];
  enabled: boolean;
}
