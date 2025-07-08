
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a more reliable unique ID for applicants
export const generateUniqueId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `GIS-${timestamp}${randomPart}`.toUpperCase();
};

// Image handling utilities
export const handleImageUpload = (
  file: File,
  onSuccess: (result: string) => void,
  options: { maxSizeMB?: number } = {}
) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    onSuccess(result);
  };
  reader.readAsDataURL(file);
};

export const optimizeImage = async (imageDataUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions (optimize for ID card size)
      const maxWidth = 400;
      const maxHeight = 500;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        resolve(imageDataUrl);
      }
    };
    img.src = imageDataUrl;
  });
};
