import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (uploadedUrl: string) => void;
  buttonClassName?: string;
  children: ReactNode;
  accept?: string;
}

/**
 * A simple file upload component for merchant logos and images
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 5242880, // 5MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
  accept = "image/*"
}: ObjectUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Get upload parameters from backend
      const { url } = null;

      // Upload file directly to storage
      const uploadResponse = await fetch(url, {
        method: "PUT",
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // Extract the URL without query parameters
      const uploadedUrl = url.split('?')[0];
      
      toast({
        title: "Upload successful",
        description: "Image uploaded successfully",
      });

      onComplete?.(uploadedUrl);
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
        disabled={isUploading}
      />
      
      <label htmlFor="file-upload">
        <Button 
          type="button"
          variant="outline" 
          className={buttonClassName}
          disabled={isUploading}
          asChild
        >
          <span className="cursor-pointer">
            {children}
          </span>
        </Button>
      </label>

      {selectedFile && (
        <div className="flex items-center gap-2 p-2 border rounded">
          <span className="text-sm text-gray-600 flex-1">{selectedFile.name}</span>
          <Button
            type="button"
            size="sm"
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}