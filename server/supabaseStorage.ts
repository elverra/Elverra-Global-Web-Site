import { createClient } from '@supabase/supabase-js';
import { Response } from "express";
import { randomUUID } from "crypto";

// Supabase client configuration
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class SupabaseStorageService {
  private publicBucket = 'public-files';
  private privateBucket = 'private-files';

  constructor() {}

  // Initialize buckets if they don't exist
  async initializeBuckets() {
    try {
      // Create public bucket
      await supabase.storage.createBucket(this.publicBucket, {
        public: true,
        allowedMimeTypes: ['image/*', 'application/pdf', 'text/*'],
        fileSizeLimit: 10 * 1024 * 1024 // 10MB
      });
    } catch (error) {
      // Bucket might already exist
      console.log('Public bucket already exists or error:', error);
    }

    try {
      // Create private bucket
      await supabase.storage.createBucket(this.privateBucket, {
        public: false,
        allowedMimeTypes: ['image/*', 'application/pdf', 'text/*'],
        fileSizeLimit: 50 * 1024 * 1024 // 50MB
      });
    } catch (error) {
      // Bucket might already exist
      console.log('Private bucket already exists or error:', error);
    }
  }

  // Upload file to public bucket
  async uploadPublicFile(file: Buffer, fileName: string, contentType: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(this.publicBucket)
      .upload(fileName, file, {
        contentType,
        upsert: true
      });

    if (error) {
      throw new Error(`Failed to upload public file: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(this.publicBucket)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  }

  // Upload file to private bucket
  async uploadPrivateFile(file: Buffer, fileName: string, contentType: string): Promise<string> {
    const uniqueFileName = `${randomUUID()}-${fileName}`;
    
    const { data, error } = await supabase.storage
      .from(this.privateBucket)
      .upload(`uploads/${uniqueFileName}`, file, {
        contentType,
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload private file: ${error.message}`);
    }

    return `/objects/${data.path}`;
  }

  // Get signed URL for private file
  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(this.privateBucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  // Download and stream file
  async downloadFile(filePath: string, res: Response, isPublic: boolean = false) {
    try {
      const bucket = isPublic ? this.publicBucket : this.privateBucket;
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(filePath);

      if (error) {
        throw new Error(`Failed to download file: ${error.message}`);
      }

      if (!data) {
        throw new ObjectNotFoundError();
      }

      // Set appropriate headers
      res.set({
        'Content-Type': data.type || 'application/octet-stream',
        'Content-Length': data.size.toString(),
        'Cache-Control': `${isPublic ? 'public' : 'private'}, max-age=3600`,
      });

      // Convert blob to buffer and send
      const buffer = Buffer.from(await data.arrayBuffer());
      res.send(buffer);

    } catch (error) {
      console.error('Error downloading file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error downloading file' });
      }
    }
  }

  // Get upload URL for direct client upload
  async getUploadUrl(fileName: string, isPublic: boolean = false): Promise<{
    uploadUrl: string;
    filePath: string;
  }> {
    const bucket = isPublic ? this.publicBucket : this.privateBucket;
    const uniqueFileName = isPublic ? fileName : `uploads/${randomUUID()}-${fileName}`;

    // For Supabase, we return the bucket info for client-side upload
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${uniqueFileName}`;
    
    return {
      uploadUrl,
      filePath: uniqueFileName
    };
  }

  // Delete file
  async deleteFile(filePath: string, isPublic: boolean = false): Promise<void> {
    const bucket = isPublic ? this.publicBucket : this.privateBucket;
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // List files in bucket
  async listFiles(prefix: string = '', isPublic: boolean = false) {
    const bucket = isPublic ? this.publicBucket : this.privateBucket;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix, {
        limit: 100,
        offset: 0
      });

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }

    return data;
  }

  // Check if file exists
  async fileExists(filePath: string, isPublic: boolean = false): Promise<boolean> {
    const bucket = isPublic ? this.publicBucket : this.privateBucket;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath);

    return !error && !!data;
  }

  // Get file metadata
  async getFileMetadata(filePath: string, isPublic: boolean = false) {
    const bucket = isPublic ? this.publicBucket : this.privateBucket;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .list('', {
        search: filePath
      });

    if (error || !data || data.length === 0) {
      throw new ObjectNotFoundError();
    }

    return data[0];
  }
}

// Export singleton instance
export const storageService = new SupabaseStorageService();
