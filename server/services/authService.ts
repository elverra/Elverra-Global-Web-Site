import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { appConfig } from '../../shared/config';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export const authService = {
  /**
   * Generate access and refresh tokens for a user
   */
  async generateTokens(userId: string, email: string, role: string = 'user') {
    // Generate access token
    const accessToken = jwt.sign(
      { id: userId, email, role, type: 'access' } as TokenPayload,
      appConfig.auth.jwtSecret,
      { expiresIn: appConfig.auth.jwtExpiresIn } as jwt.SignOptions
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { 
        id: userId, 
        email, 
        role, 
        type: 'refresh',
        jti: uuidv4() // Unique identifier for this token
      } as TokenPayload,
      appConfig.auth.refreshTokenSecret,
      { expiresIn: appConfig.auth.refreshTokenExpiresIn } as jwt.SignOptions
    );

    // Calculate refresh token expiration
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setSeconds(
      refreshTokenExpiresAt.getSeconds() + 
      (typeof appConfig.auth.refreshTokenExpiresIn === 'string' 
        ? parseInt(appConfig.auth.refreshTokenExpiresIn, 10) 
        : appConfig.auth.refreshTokenExpiresIn)
    );

    // Store refresh token in database
    await db.update(users)
      .set({
        refreshToken,
        refreshTokenExpiresAt,
        lastLoginAt: new Date()
      })
      .where(eq(users.id, userId));

    return {
      accessToken,
      refreshToken,
      expiresIn: appConfig.auth.jwtExpiresIn,
      tokenType: 'Bearer'
    };
  },

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeRefreshTokens(userId: string) {
    await db.update(users)
      .set({
        refreshToken: null,
        refreshTokenExpiresAt: null
      })
      .where(eq(users.id, userId));
  },

  /**
   * Verify and decode a JWT token
   */
  verifyToken(token: string, isRefreshToken: boolean = false) {
    try {
      const secret = isRefreshToken 
        ? appConfig.auth.refreshTokenSecret 
        : appConfig.auth.jwtSecret;
      
      return jwt.verify(token, secret) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      throw new Error('Invalid token');
    }
  },

  /**
   * Get user by refresh token
   */
  async getUserByRefreshToken(refreshToken: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.refreshToken, refreshToken))
      .limit(1);

    if (!user || !user.refreshTokenExpiresAt || new Date() > user.refreshTokenExpiresAt) {
      return null;
    }

    return user;
  },

  /**
   * Update CinetPay auth token
   */
  async updateCinetPayToken(userId: string, token: string, expiresIn: number) {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

    await db.update(users)
      .set({
        cinetpayAuthToken: token,
        cinetpayTokenExpiresAt: expiresAt
      })
      .where(eq(users.id, userId));
  },

  /**
   * Get CinetPay auth token for user
   */
  async getCinetPayToken(userId: string) {
    const [user] = await db
      .select({
        token: users.cinetpayAuthToken,
        expiresAt: users.cinetpayTokenExpiresAt
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.token || !user.expiresAt || new Date() >= user.expiresAt) {
      return null;
    }

    return user.token;
  }
};
