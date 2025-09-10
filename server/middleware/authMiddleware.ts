import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '../../shared/config';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { authService } from '../services/authService';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  type?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
  jti?: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    cinetpayAuthToken?: string | null;
    cinetpayTokenExpiresAt?: Date | null;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    // Vérifier le token JWT
    const decoded = authService.verifyToken(token) as JwtPayload;
    
    // Vérifier si c'est un refresh token
    if (decoded.type === 'refresh') {
      return res.status(401).json({ 
        error: 'Refresh token cannot be used for authentication',
        code: 'INVALID_TOKEN_TYPE'
      });
    }
    
    // Récupérer l'utilisateur depuis la base de données
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, decoded.id)
    });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Vérifier si le token JWT a été révoqué (en comparant avec la date de déconnexion)
    if (user.lastLoginAt && decoded.iat && new Date(decoded.iat * 1000) < user.lastLoginAt) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }
    
    // Ajouter les informations de l'utilisateur à la requête
    req.user = {
      id: user.id,
      email: user.email,
      role: decoded.role || 'user', // Fallback to 'user' if role is missing
      cinetpayAuthToken: (user as any).cinetpayAuthToken || null,
      cinetpayTokenExpiresAt: (user as any).cinetpayTokenExpiresAt ? new Date((user as any).cinetpayTokenExpiresAt) : null
    };
    
    console.log('[AUTH_MIDDLEWARE] Authentication successful:', {
      userId: req.user?.id,
      email: req.user?.email,
      url: req.url
    });
    
    next();
  } catch (error) {
    // Vérifier si c'est une erreur d'expiration de token
    if (error instanceof Error && error.message === 'Token expired') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
        message: 'The access token has expired. Please refresh your token.'
      });
    }
    
    // Autres erreurs d'authentification
    console.error('[AUTH_MIDDLEWARE] Authentication error:', {
      error: error instanceof Error ? error.message : error,
      url: req.url,
      method: req.method,
      hasAuthHeader: !!req.headers.authorization
    });
    
    return res.status(401).json({ 
      error: 'Unauthorized - Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Vérifier si l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Unauthorized - Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        error: 'Forbidden - Admin access required',
        code: 'ADMIN_ACCESS_REQUIRED'
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Middleware pour générer un nouveau token d'accès à partir d'un refresh token
export const refreshTokenMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.headers['x-refresh-token'] as string;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        error: 'Refresh token is required',
        code: 'REFRESH_TOKEN_REQUIRED'
      });
    }
    
    // Vérifier le refresh token
    const decoded = authService.verifyToken(refreshToken, true) as JwtPayload;
    
    // Vérifier que c'est bien un refresh token
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ 
        error: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
    }
    
    // Récupérer l'utilisateur associé au refresh token
    const user = await authService.getUserByRefreshToken(refreshToken);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }
    
    // Générer de nouveaux tokens
    const tokens = await authService.generateTokens(user.id, user.email, (user as any).role);
    
    // Ajouter le nouvel access token à la réponse
    res.setHeader('Authorization', `Bearer ${tokens.accessToken}`);
    
    // Ajouter les informations de l'utilisateur à la requête
    req.user = {
      id: user.id,
      email: user.email,
      role: (user as any).role || 'user',
      cinetpayAuthToken: (user as any).cinetpayAuthToken || null,
      cinetpayTokenExpiresAt: (user as any).cinetpayTokenExpiresAt || null
    };
    
    // Ajouter le nouveau refresh token au cookie si nécessaire
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
    });
    
    next();
  } catch (error) {
    console.error('Refresh token middleware error:', error);
    
    if (error instanceof Error && error.message === 'Token expired') {
      return res.status(401).json({ 
        error: 'Refresh token has expired',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({ 
      error: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Middleware pour vérifier et rafraîchir le token CinetPay si nécessaire
export const cinetpayAuthMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    // Vérifier si le token CinetPay est toujours valide
    if (req.user.cinetpayAuthToken && req.user.cinetpayTokenExpiresAt) {
      const now = new Date();
      const expiresAt = new Date(req.user.cinetpayTokenExpiresAt);
      
      // Si le token expire dans moins de 5 minutes, on le considère comme expiré
      const expiresSoon = new Date(expiresAt.getTime() - 5 * 60 * 1000);
      
      if (now < expiresSoon) {
        // Le token est toujours valide, on continue
        return next();
      }
    }
    
    // Si on arrive ici, il faut rafraîchir le token CinetPay
    // Cette partie dépend de l'API CinetPay, à implémenter selon la documentation
    // Exemple d'appel à l'API CinetPay pour rafraîchir le token
    /*
    const response = await fetch('https://api.cinetpay.com/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.user.cinetpayAuthToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh CinetPay token');
    }
    
    const data = await response.json();
    
    // Mettre à jour l'utilisateur avec le nouveau token
    await db.update(users)
      .set({
        cinetpayAuthToken: data.token,
        cinetpayTokenExpiresAt: new Date(Date.now() + data.expiresIn * 1000),
        updatedAt: new Date()
      })
      .where(eq(users.id, req.user.id));
    
    // Mettre à jour l'utilisateur dans la requête
    req.user.cinetpayAuthToken = data.token;
    req.user.cinetpayTokenExpiresAt = new Date(Date.now() + data.expiresIn * 1000);
    */
    
    // Pour l'instant, on retourne une erreur indiquant que le token doit être rafraîchi
    return res.status(401).json({
      error: 'CinetPay token expired',
      code: 'CINETPAY_TOKEN_EXPIRED',
      requiresRefresh: true
    });
    
  } catch (error) {
    console.error('CinetPay auth middleware error:', error);
    return res.status(500).json({
      error: 'Failed to authenticate with CinetPay',
      code: 'CINETPAY_AUTH_ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
