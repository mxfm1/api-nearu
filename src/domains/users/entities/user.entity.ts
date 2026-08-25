export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: 'user' | 'admin';
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}
