import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { users, userRoles } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';

// Extend the Express Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Verify JWT token
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', async (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    try {
      // Fetch user and their role from database
      const [userWithRole] = await db
        .select({
          id: users.id,
          email: users.email,
          role: userRoles.role
        })
        .from(users)
        .leftJoin(userRoles, and(
          eq(users.id, userRoles.userId),
          eq(userRoles.role, 'admin') // Only check for admin role for now
        ))
        .where(eq(users.id, user.userId))
        .limit(1);

      if (!userWithRole) {
        return res.status(403).json({ error: 'User not found' });
      }

      // Attach user to request object
      req.user = {
        id: userWithRole.id,
        email: userWithRole.email,
        role: userWithRole.role || 'user',
      };

      next();
    } catch (error) {
      console.error('Error authenticating user:', error);
      res.status(500).json({ error: 'Authentication error' });
    }
  });
}

// Middleware to check if user has admin role
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
}
