import { z } from 'zod';

export const getUserSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export type GetUserInput = z.infer<typeof getUserSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
