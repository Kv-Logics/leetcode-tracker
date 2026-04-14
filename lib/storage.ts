// Simple in-memory storage (replace with DB in production)
export const users = new Map<string, { id: string; username: string; password: string; role: 'admin' | 'user' }>();
export const problems = new Map<string, { userId: string; problemId: string; completed: boolean }>();

// Initialize with a default admin user
import { hashPassword } from './auth';

export const initStorage = async () => {
  if (users.size === 0) {
    const adminPass = await hashPassword('admin123');
    users.set('admin', {
      id: '1',
      username: 'admin',
      password: adminPass,
      role: 'admin'
    });
  }
};
