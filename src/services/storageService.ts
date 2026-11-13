import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

/**
 * Compresses an image file on the client before upload to save bandwidth and speed up uploads on mobile.
 */
export async function compressImage(file: File, maxDimension = 1280, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Uploads an image to Firebase Storage with progress tracking.
 * Falls back to high-quality compressed data URL if storage bucket is unreachable.
 */
export async function uploadPropertyImage(
  file: File,
  propertyId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const compressedBlob = await compressImage(file);
  const safePropId = propertyId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = Date.now();
  const filename = `${safePropId}_${timestamp}_${Math.random().toString(36).substring(2, 7)}.jpg`;
  const storagePath = `properties/${safePropId}/${filename}`;

  try {
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, compressedBlob, {
      contentType: 'image/jpeg',
    });

    return await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        },
        async (error) => {
          console.warn('Firebase Storage upload failed or bucket permissions restricted, using inline data URL fallback:', error);
          // Convert to base64 data URL fallback
          const reader = new FileReader();
          reader.onloadend = () => {
            if (onProgress) onProgress(100);
            resolve(reader.result as string);
          };
          reader.onerror = () => reject(error);
          reader.readAsDataURL(compressedBlob);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve(downloadUrl);
          } catch (e) {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(compressedBlob);
          }
        }
      );
    });
  } catch (err) {
    console.warn('Storage initialisation error, falling back to data URL:', err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(compressedBlob);
    });
  }
}
