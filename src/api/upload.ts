import { apiClient, getApiErrorMessage } from './client';
import type { ApiResponse } from '../types/api';
import { resolveImageUrl } from '../utils/imageUrl';

export type ImageUploadPreset = 'avatar' | 'event_banner' | 'organizer_logo' | 'general';

export interface UploadedImageData {
  url: string;
  path: string;
  disk: string;
  filename: string;
  mime_type: string;
  extension: string;
  size_bytes: number;
  width: number;
  height: number;
  sha256?: string;
  meta?: Record<string, any>;
}

export const PRESET_LIMITS: Record<ImageUploadPreset, { maxSizeMB: number; maxWidth: number; maxHeight: number }> = {
  avatar: { maxSizeMB: 2, maxWidth: 1024, maxHeight: 1024 },
  event_banner: { maxSizeMB: 8, maxWidth: 3840, maxHeight: 2160 },
  organizer_logo: { maxSizeMB: 4, maxWidth: 1500, maxHeight: 1500 },
  general: { maxSizeMB: 5, maxWidth: 4096, maxHeight: 4096 },
};

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validates file prior to upload to provide immediate, friendly client-side feedback.
 */
export const validateImageFile = (file: File, preset: ImageUploadPreset = 'general'): string | null => {
  // Disallow SVG explicitly to protect against stored XSS
  if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    return 'SVG vector files are not allowed for security reasons. Please upload JPG, PNG, or WebP images.';
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Invalid file format. Please upload a valid image (JPG, PNG, or WebP).';
  }

  const limit = PRESET_LIMITS[preset] || PRESET_LIMITS.general;
  if (file.size > limit.maxSizeMB * 1024 * 1024) {
    return `File size exceeds the ${limit.maxSizeMB}MB limit for this image type.`;
  }

  return null;
};

export const uploadApi = {
  /**
   * Upload an image file to the backend, sanitized and converted to secure WebP.
   */
  uploadImage: async (
    file: File,
    preset: ImageUploadPreset = 'general',
    onProgress?: (progressPercent: number) => void
  ): Promise<UploadedImageData> => {
    // Client-side pre-validation
    const validationError = validateImageFile(file, preset);
    if (validationError) {
      throw new Error(validationError);
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('preset', preset);

    try {
      const response = await apiClient.post<ApiResponse<UploadedImageData>>('/uploads/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      });

      const resData = response.data?.data || (response.data as any);
      const rawUrl = resData?.url || (resData as any)?.imageUrl || (resData as any)?.image_url || (resData?.path ? `/storage/${String(resData.path).replace(/^\//, '')}` : '');
      if (!rawUrl) {
        throw new Error('Upload succeeded but server did not return an image URL.');
      }

      const finalUrl = resolveImageUrl(rawUrl);

      return {
        ...resData,
        url: finalUrl,
      };
    } catch (err: any) {
      const errorMsg = getApiErrorMessage(err, 'Failed to upload image. Please try again.');
      throw new Error(errorMsg);
    }
  },

  /**
   * Delete an uploaded image by its storage path.
   */
  deleteImage: async (path: string): Promise<boolean> => {
    try {
      const response = await apiClient.delete<ApiResponse<any>>('/uploads/images', {
        data: { path },
      });
      return response.data?.success ?? true;
    } catch (err: any) {
      console.warn('Failed to delete image from storage:', getApiErrorMessage(err));
      return false;
    }
  },
};

export default uploadApi;
