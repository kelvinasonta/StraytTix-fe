import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { uploadApi, type ImageUploadPreset, PRESET_LIMITS, type UploadedImageData } from '../../api/upload';
import { resolveImageUrl } from '../../utils/imageUrl';

interface FileUploaderProps {
  label?: string;
  onChange: (url: string) => void;
  value?: string;
  aspectRatio?: 'square' | 'video' | 'banner';
  preset?: ImageUploadPreset;
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
  helperText?: string;
  hint?: string;
  onUploadStart?: () => void;
  onUploadComplete?: (data: UploadedImageData) => void;
  onUploadError?: (errorMsg: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  onChange,
  value = '',
  aspectRatio = 'square',
  preset = 'general',
  maxSizeMB,
  disabled = false,
  className = '',
  helperText,
  hint,
  onUploadStart,
  onUploadComplete,
  onUploadError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [hasImgError, setHasImgError] = useState(false);

  useEffect(() => {
    setHasImgError(false);
  }, [value]);

  const effectiveMaxSize = maxSizeMB ?? (PRESET_LIMITS[preset]?.maxSizeMB || 5);

  const aspectStyles = {
    square: 'aspect-square w-32 h-32 rounded-2xl',
    video: 'aspect-video w-full max-w-md rounded-2xl',
    banner: 'aspect-[3/1] w-full rounded-2xl',
  };

  const displayUrl = localPreview || (value ? resolveImageUrl(value) : '');

  const processUpload = async (file: File) => {
    if (disabled || isUploading) return;

    setError(null);
    setIsUploading(true);
    setProgress(5);
    onUploadStart?.();

    // Generate immediate client-side preview for responsive feedback
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    setHasImgError(false);

    try {
      const data = await uploadApi.uploadImage(file, preset, (pct) => {
        setProgress(pct);
      });

      const finalUrl = resolveImageUrl(data.url);
      setProgress(100);
      onChange(finalUrl);
      onUploadComplete?.(data);

      setTimeout(() => {
        setProgress(null);
        setIsUploading(false);
      }, 400);
    } catch (err: any) {
      setLocalPreview(null);
      const message = err.message || 'Failed to upload image. Please try again.';
      setError(message);
      setProgress(null);
      setIsUploading(false);
      onUploadError?.(message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processUpload(file);
    // Reset file input so selecting the same file triggers change again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUpload(file);
    }
  };

  const triggerSelect = () => {
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalPreview(null);
    setHasImgError(false);
    onChange('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <span className="text-sm font-semibold text-zinc-800">{label}</span>}

      <div
        onClick={triggerSelect}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative overflow-hidden cursor-pointer border-2 border-dashed transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed bg-zinc-100 border-zinc-200' : ''
        } ${
          isDragOver
            ? 'border-[#E31B23] bg-red-50/30 ring-2 ring-red-100'
            : error
            ? 'border-red-300 bg-red-50/15'
            : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100/70 hover:border-zinc-300'
        } ${aspectStyles[aspectRatio]} flex flex-col items-center justify-center p-4`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled || isUploading}
          className="hidden"
        />

        {displayUrl && !hasImgError && !isUploading ? (
          <>
            <img 
              src={displayUrl} 
              alt="Preview" 
              onError={() => setHasImgError(true)}
              className="absolute inset-0 w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/45 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <span className="text-xs font-bold text-white bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-xs">
                Click or Drop to Replace
              </span>
              <button
                type="button"
                onClick={handleRemove}
                title="Remove image"
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          !isUploading && (
            <div className="text-center flex flex-col items-center gap-1.5 p-3 pointer-events-none">
              <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 shadow-2xs flex items-center justify-center text-zinc-400 group-hover:text-zinc-600">
                <Upload className="w-5 h-5 text-zinc-500" />
              </div>
              <span className="text-xs font-bold text-zinc-800">
                {isDragOver ? 'Drop image to upload' : 'Click or drag & drop to upload'}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">
                {helperText || hint || `Up to ${effectiveMaxSize}MB (JPG, PNG, WebP)`}
              </span>
            </div>
          )
        )}

        {/* Real Upload Progress Loader */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-10">
            <Loader2 className="w-7 h-7 text-[#E31B23] animate-spin mb-2.5" />
            <span className="text-xs font-bold text-zinc-800 mb-1.5">Sanitizing & Uploading...</span>
            <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden max-w-[140px] border border-zinc-200">
              <div
                className="bg-[#E31B23] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress ?? 0}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-zinc-500 mt-1.5">{progress ?? 0}%</span>
          </div>
        )}
      </div>

      {error && (
        <span className="text-xs font-medium text-red-600 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </span>
      )}
    </div>
  );
};

export default FileUploader;
