import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { File, X, Image, Video, FileText, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

type MediaType = 'image' | 'video' | 'document' | 'audio';

interface MediaFile {
  file: File;
  preview: string;
  type: MediaType;
  name: string;
  size: number;
  progress?: number;
  error?: string;
  id: string;
}

interface MediaUploaderProps {
  onUploadComplete: (urls: string[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  mediaTypes?: MediaType[];
  disabled?: boolean;
}

const getMediaType = (fileType: string): MediaType => {
  if (fileType.startsWith('image/')) return 'image';
  if (fileType.startsWith('video/')) return 'video';
  if (fileType.startsWith('audio/')) return 'audio';
  return 'document';
};

const getIcon = (type: MediaType) => {
  switch (type) {
    case 'image':
      return <Image className="w-5 h-5" />;
    case 'video':
      return <Video className="w-5 h-5" />;
    case 'audio':
      return <FileText className="w-5 h-5" />;
    default:
      return <File className="w-5 h-5" />;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function MediaUploader({
  onUploadComplete,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedTypes = ['image/*', 'video/*', 'application/pdf'],
  mediaTypes = ['image', 'video', 'document'],
  disabled = false,
}: MediaUploaderProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (disabled) return;

      // Gérer les rejets
      fileRejections.forEach(({ file, errors }) => {
        console.error(`Fichier rejeté: ${file.name}`, errors);
      });

      // Ajouter les nouveaux fichiers
      const newFiles = acceptedFiles.slice(0, maxFiles - files.length).map((file) => ({
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
        type: getMediaType(file.type),
        name: file.name,
        size: file.size,
        id: Math.random().toString(36).substring(2, 9),
      }));

      setFiles((prev) => [...prev, ...newFiles]);
    },
    [files.length, maxFiles, disabled]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.fromEntries(acceptedTypes.map(type => [type, []])),
    maxSize: maxSizeMB * 1024 * 1024,
    disabled: disabled || files.length >= maxFiles,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const uploadFile = async (mediaFile: MediaFile, eventId: string, userId: string) => {
    const fileExt = mediaFile.name.split('.').pop();
    const fileName = `${userId}/${eventId}/${mediaFile.id}.${fileExt}`;
    const filePath = `competition-submissions/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('competition-media')
        .upload(filePath, mediaFile.file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Obtenir l'URL signée
      const { data } = supabase.storage
        .from('competition-media')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      throw error;
    }
  };

  const handleUpload = async (eventId: string, userId: string) => {
    if (files.length === 0 || isUploading) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        try {
          setUploadProgress((prev) => ({ ...prev, [file.id]: 0 }));
          const url = await uploadFile(file, eventId, userId);
          uploadedUrls.push(url);
          setUploadProgress((prev) => ({ ...prev, [file.id]: 100 }));
        } catch (error) {
          console.error(`Erreur lors du téléchargement de ${file.name}:`, error);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? { ...f, error: 'Échec du téléchargement' }
                : f
            )
          );
        }
      }

      if (uploadedUrls.length > 0) {
        onUploadComplete(uploadedUrls);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Nettoyer les URLs de prévisualisation lors du démontage
  React.useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'
        } ${disabled || files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? 'Déposez les fichiers ici...'
              : `Glissez-déposez des fichiers ici, ou cliquez pour sélectionner`}
          </p>
          <p className="text-xs text-muted-foreground">
            Types supportés: {acceptedTypes.join(', ')}
          </p>
          <p className="text-xs text-muted-foreground">
            Taille maximale: {maxSizeMB}MB par fichier
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Fichiers sélectionnés ({files.length}/{maxFiles})</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="border rounded-md p-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-md bg-muted">
                    {getIcon(file.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    {file.error && (
                      <p className="text-xs text-destructive">{file.error}</p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
