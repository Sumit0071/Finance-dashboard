import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { sendSuccess, sendPaginated } from '../../utils/response';

export class UsersController {
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { users, total, page, limit } = await usersService.listUsers(req.query as any);
      sendPaginated(res, users, total, page, limit);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.getUserById(req.params.id as string);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.updateUser(
        req.params.id as string,
        req.body,
        req.user!.userId
      );
      sendSuccess(res, user, 200, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usersService.deleteUser(req.params.id as string, req.user!.userId);
      sendSuccess(res, result, 200, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
