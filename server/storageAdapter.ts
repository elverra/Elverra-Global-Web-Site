import { Response } from "express";
import { SupabaseStorageService, ObjectNotFoundError as SupabaseObjectNotFoundError } from "./supabaseStorage.js";
import { ObjectStorageService, ObjectNotFoundError as GCSObjectNotFoundError } from "./objectStorage.js";

// Unified storage interface
export interface StorageAdapter {
  uploadFile(file: Buffer, fileName: string, contentType: string, isPublic?: boolean): Promise<string>;
  downloadFile(filePath: string, res: Response, isPublic?: boolean): Promise<void>;
  getSignedUrl(filePath: string, expiresIn?: number): Promise<string>;
  deleteFile(filePath: string, isPublic?: boolean): Promise<void>;
  fileExists(filePath: string, isPublic?: boolean): Promise<boolean>;
}

// Supabase Storage Adapter
class SupabaseAdapter implements StorageAdapter {
  private service = new SupabaseStorageService();

  async uploadFile(file: Buffer, fileName: string, contentType: string, isPublic = false): Promise<string> {
    if (isPublic) {
      return this.service.uploadPublicFile(file, fileName, contentType);
    } else {
      return this.service.uploadPrivateFile(file, fileName, contentType);
    }
  }

  async downloadFile(filePath: string, res: Response, isPublic = false): Promise<void> {
    return this.service.downloadFile(filePath, res, isPublic);
  }

  async getSignedUrl(filePath: string, expiresIn = 3600): Promise<string> {
    return this.service.getSignedUrl(filePath, expiresIn);
  }

  async deleteFile(filePath: string, isPublic = false): Promise<void> {
    return this.service.deleteFile(filePath, isPublic);
  }

  async fileExists(filePath: string, isPublic = false): Promise<boolean> {
    return this.service.fileExists(filePath, isPublic);
  }
}

// Google Cloud Storage Adapter (legacy)
class GCSAdapter implements StorageAdapter {
  private service = new ObjectStorageService();

  async uploadFile(file: Buffer, fileName: string, contentType: string, isPublic = false): Promise<string> {
    // Implementation would need to be added to ObjectStorageService
    throw new Error("GCS upload not implemented in current ObjectStorageService");
  }

  async downloadFile(filePath: string, res: Response, isPublic = false): Promise<void> {
    try {
      const objectFile = await this.service.getObjectEntityFile(filePath);
      await this.service.downloadObject(objectFile, res);
    } catch (error) {
      throw error;
    }
  }

  async getSignedUrl(filePath: string, expiresIn = 3600): Promise<string> {
    return this.service.getObjectEntityUploadURL();
  }

  async deleteFile(filePath: string, isPublic = false): Promise<void> {
    throw new Error("GCS delete not implemented in current ObjectStorageService");
  }

  async fileExists(filePath: string, isPublic = false): Promise<boolean> {
    try {
      await this.service.getObjectEntityFile(filePath);
      return true;
    } catch (error) {
      if (error instanceof GCSObjectNotFoundError) {
        return false;
      }
      throw error;
    }
  }
}

// Factory function to get the appropriate storage adapter
export function getStorageAdapter(): StorageAdapter {
  const useSupabase = process.env.USE_SUPABASE_STORAGE === 'true' || !process.env.GOOGLE_CLOUD_PROJECT_ID;
  
  if (useSupabase) {
    return new SupabaseAdapter();
  } else {
    return new GCSAdapter();
  }
}

// Export unified error class
export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

// Export the default storage instance
export const storage = getStorageAdapter();
