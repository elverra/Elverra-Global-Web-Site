import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '../../shared/config';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[AUTH_MIDDLEWARE] Missing or invalid authorization header:', {
        hasAuthHeader: !!authHeader,
        authHeaderValue: authHeader ? authHeader.substring(0, 20) + '...' : 'none',
        url: req.url,
        method: req.method
      });
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.error('[AUTH_MIDDLEWARE] Token extraction failed:', {
        authHeader: authHeader.substring(0, 50) + '...',
        url: req.url
      });
      return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, appConfig.auth.jwtSecret) as {
      id: string;
      email: string;
      role: string;
    };
    
    // Ajouter les informations de l'utilisateur à la requête
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user' // Fallback to 'user' if role is missing
    };
    
    console.log('[AUTH_MIDDLEWARE] Authentication successful:', {
      userId: req.user?.id,
      email: req.user?.email,
      url: req.url
    });
    
    next();
  } catch (error) {
    console.error('[AUTH_MIDDLEWARE] Authentication error:', {
      error: error instanceof Error ? error.message : error,
      url: req.url,
      method: req.method,
      hasAuthHeader: !!req.headers.authorization
    });
    return res.status(401).json({ error: 'Unauthorized - Invalid or expired token' });
  }
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Vérifier si l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized - Authentication required' });
    }

    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
