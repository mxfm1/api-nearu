import type { User } from '../entities/user.entity';

export function presentUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function presentUsers(users: User[]) {
  return users.map(presentUser);
}
