// Image upload utilities for profile and identity card images
import { supabase } from '@/lib/supabaseClient';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Uploads profile image to Supabase storage
 */
export async function uploadProfileImage(file: File, userId: string): Promise<ImageUploadResult> {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Type de fichier non supporté. Utilisez JPG, PNG ou WebP.'
      };
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: 'La taille du fichier ne doit pas dépasser 5MB.'
      };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/profile_${Date.now()}.${fileExt}`;

    // Upload to Supabase storage
    const { error } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Profile image upload error:', error);
      return {
        success: false,
        error: 'Erreur lors du téléchargement de l\'image.'
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);

    return {
      success: true,
      url: urlData.publicUrl
    };

  } catch (error) {
    console.error('Profile image upload error:', error);
    return {
      success: false,
      error: 'Erreur inattendue lors du téléchargement.'
    };
  }
}

/**
 * Uploads identity card image to Supabase storage
 */
export async function uploadIdentityCardImage(file: File, userId: string): Promise<ImageUploadResult> {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Type de fichier non supporté. Utilisez JPG, PNG ou PDF.'
      };
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: 'La taille du fichier ne doit pas dépasser 10MB.'
      };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/identity_${Date.now()}.${fileExt}`;

    // Upload to Supabase storage
    const { error } = await supabase.storage
      .from('identity-cards')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Identity card upload error:', error);
      return {
        success: false,
        error: 'Erreur lors du téléchargement de la carte d\'identité.'
      };
    }

    // Get signed URL (private bucket)
    const { data: urlData, error: urlError } = await supabase.storage
      .from('identity-cards')
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year expiry

    if (urlError) {
      console.error('Error creating signed URL:', urlError);
      return {
        success: false,
        error: 'Erreur lors de la génération de l\'URL sécurisée.'
      };
    }

    return {
      success: true,
      url: urlData.signedUrl
    };

  } catch (error) {
    console.error('Identity card upload error:', error);
    return {
      success: false,
      error: 'Erreur inattendue lors du téléchargement.'
    };
  }
}

/**
 * Deletes an image from storage
 */
export async function deleteImage(bucket: 'profile-images' | 'identity-cards', filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

/**
 * Compresses image before upload
 */
export function compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}
