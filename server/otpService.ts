import { eq, and, gte } from "drizzle-orm";
import { db } from "./db";
import { phoneOtps, users, insertPhoneOtpSchema } from "@shared/schema";

export interface OtpVerificationResult {
  success: boolean;
  message: string;
  userId?: string;
}

export class OtpService {
  // Generate a 6-digit OTP
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP to phone number (in production, this would integrate with SMS service)
  async sendOtp(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      // Clean phone number format
      const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/[^+\d]/g, '');
      
      // Generate OTP
      const otp = this.generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Check if user exists with this phone number
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.phone, cleanPhone))
        .limit(1);

      if (existingUser.length === 0) {
        return {
          success: false,
          message: "No account found with this phone number. Please register first."
        };
      }

      // Delete any existing OTPs for this phone number
      await db.delete(phoneOtps).where(eq(phoneOtps.phone, cleanPhone));

      // Insert new OTP
      await db.insert(phoneOtps).values({
        phone: cleanPhone,
        otp,
        expiresAt,
        verified: false
      });

      // In production, send SMS here
      console.log(`📱 OTP Service: Would send OTP ${otp} to ${cleanPhone}`);
      console.log(`📱 For testing purposes, OTP is: ${otp}`);

      return {
        success: true,
        message: "OTP sent successfully. Please check your phone."
      };
    } catch (error) {
      console.error("Error sending OTP:", error);
      return {
        success: false,
        message: "Failed to send OTP. Please try again."
      };
    }
  }

  // Verify OTP and return user information
  async verifyOtp(phoneNumber: string, otp: string): Promise<OtpVerificationResult> {
    try {
      const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/[^+\d]/g, '');
      
      // Find the OTP record
      const otpRecord = await db
        .select()
        .from(phoneOtps)
        .where(
          and(
            eq(phoneOtps.phone, cleanPhone),
            eq(phoneOtps.otp, otp),
            eq(phoneOtps.verified, false),
            gte(phoneOtps.expiresAt, new Date())
          )
        )
        .limit(1);

      if (otpRecord.length === 0) {
        return {
          success: false,
          message: "Invalid or expired OTP. Please try again."
        };
      }

      // Mark OTP as verified
      await db
        .update(phoneOtps)
        .set({ verified: true })
        .where(eq(phoneOtps.id, otpRecord[0].id));

      // Get user information
      const user = await db
        .select()
        .from(users)
        .where(eq(users.phone, cleanPhone))
        .limit(1);

      if (user.length === 0) {
        return {
          success: false,
          message: "User account not found."
        };
      }

      // Update user phone verification status
      await db
        .update(users)
        .set({ isPhoneVerified: true })
        .where(eq(users.id, user[0].id));

      console.log(`📱 OTP verified successfully for phone: ${cleanPhone}`);

      return {
        success: true,
        message: "Phone number verified successfully.",
        userId: user[0].id
      };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return {
        success: false,
        message: "Failed to verify OTP. Please try again."
      };
    }
  }

  // Clean up expired OTPs (can be run periodically)
  async cleanupExpiredOtps(): Promise<void> {
    try {
      const result = await db
        .delete(phoneOtps)
        .where(
          and(
            gte(new Date(), phoneOtps.expiresAt),
            eq(phoneOtps.verified, false)
          )
        );
      
      console.log(`🧹 Cleaned up expired OTPs`);
    } catch (error) {
      console.error("Error cleaning up expired OTPs:", error);
    }
  }

  // Get user by phone number
  async getUserByPhone(phoneNumber: string) {
    try {
      const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/[^+\d]/g, '');
      
      const user = await db
        .select()
        .from(users)
        .where(eq(users.phone, cleanPhone))
        .limit(1);

      return user.length > 0 ? user[0] : null;
    } catch (error) {
      console.error("Error getting user by phone:", error);
      return null;
    }
  }
}

export const otpService = new OtpService();