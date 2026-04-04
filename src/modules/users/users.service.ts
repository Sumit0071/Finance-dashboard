import prisma from '../../config/database';
import { AppError } from '../../utils/errors';
import { UpdateUserInput, ListUsersQuery } from './users.validation';

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  deleted: true,
  createdAt: true,
  updatedAt: true,
};

export class UsersService {
  /**
   * List users with pagination, filtering, and search.
   */
  async listUsers(query: ListUsersQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { deleted: false };

    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: USER_SELECT,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  /**
   * Get a single user by ID.
   */
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        ...USER_SELECT,
        _count: {
          select: { records: true },
        },
      },
    });

    if (!user || user.deleted) {
      throw AppError.notFound('User not found');
    }

    return user;
  }

  /**
   * Update a user's role, status, or name.
   */
  async updateUser(id: string, data: UpdateUserInput, requesterId: string) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user || user.deleted) {
      throw AppError.notFound('User not found');
    }

    // Prevent self-demotion for safety
    if (id === requesterId && data.role && data.role !== user.role) {
      throw AppError.badRequest('You cannot change your own role');
    }

    // Prevent self-deactivation
    if (id === requesterId && data.status === 'INACTIVE') {
      throw AppError.badRequest('You cannot deactivate your own account');
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });

    return updated;
  }

  /**
   * Soft-delete a user.
   */
  async deleteUser(id: string, requesterId: string) {
    if (id === requesterId) {
      throw AppError.badRequest('You cannot delete your own account');
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user || user.deleted) {
      throw AppError.notFound('User not found');
    }

    await prisma.user.update({
      where: { id },
      data: { deleted: true, status: 'INACTIVE' },
    });

    return { message: 'User deleted successfully' };
  }
}

export const usersService = new UsersService();
