import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
  onUpload: (file: File) => Promise<string>;
  children: React.ReactNode;
  className?: string;
}

export function ImageUpload({ onUpload, children, className = '' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    try {
      await onUpload(acceptedFiles[0]);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    disabled: isUploading
  });

  return (
    <div
      {...getRootProps()}
      className={`
        cursor-pointer rounded-md transition-colors
        ${isDragActive ? 'bg-gray-100' : 'hover:bg-gray-50'}
        ${className}
      `}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="p-4 text-center">
          <p>Uploading...</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}