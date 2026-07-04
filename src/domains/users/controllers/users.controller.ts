import type { Request, Response, NextFunction } from 'express';
import type { IGetUserUseCase } from '../use-cases/get-user.use-case';
import type { IDeleteUserUseCase } from '../use-cases/delete-user.use-case';
import type { User } from '../entities/user.entity';
import { auth } from '@/src/shared/auth';
import { InputParseError, ConflictError } from '@/src/shared/errors/common';
import { presentUser } from '../presenters/user.presenter';
import { db } from '@/src/shared/database';
import { profiles } from '@/src/shared/database/schema';

export type IGetUserController = ReturnType<typeof getUserController>;
export type ICreateUserController = ReturnType<typeof createUserController>;
export type IDeleteUserController = ReturnType<typeof deleteUserController>;

export const getUserController =
  (getUserUseCase: IGetUserUseCase) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.params.id as string;
        if (!userId) throw new InputParseError('User ID is required');
        const user = await getUserUseCase(userId);
        res.json({ success: true, data: presentUser(user) });
      } catch (error) {
        next(error);
      }
    };

export const createUserController = () =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      console.log("datos enviados desde el fronted", name, email, password)
      if (!name || !email || !password) {
        throw new InputParseError('Name, email, and password are required');
      }

      const result = await auth.api.signUpEmail({
        body: { name, email, password },
      });

      const user: User = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        emailVerified: result.user.emailVerified,
        image: result.user.image ?? null,
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
      };

      await db.insert(profiles).values({
        id: crypto.randomUUID(),
        userId: result.user.id,
        name: result.user.name,
      });

      res.status(201).json({ success: true, data: presentUser(user) });
    } catch (error: any) {
      // Better Auth throws APIError:
      //   error.status       = "UNPROCESSABLE_ENTITY" (string)
      //   error.statusCode   = 422 (number)
      //   error.body.code    = "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
      const apiError = error as { statusCode?: number; body?: { code?: string }; message?: string };

      if (apiError?.statusCode === 422 || apiError?.body?.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
        return next(new ConflictError('Email already in use'));
      }

      next(error);
    }
  };

export const deleteUserController =
  (deleteUserUseCase: IDeleteUserUseCase) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.params.id as string;
        if (!userId) throw new InputParseError('User ID is required');
        await deleteUserUseCase(userId);
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    };
