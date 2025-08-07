
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a short unique ID for applicants in format GIS-XXX
export const generateUniqueId = () => {
  // Generate a 3-digit number (100-999)
  const randomNumber = Math.floor(Math.random() * 900) + 100;
  return `GIS-${randomNumber}`;
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

// Backup and restore system functions
export const backupSystem = (): string => {
  try {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        applicants: localStorage.getItem('applicants') || '[]',
        systemLogo: localStorage.getItem('systemLogo') || null,
        companyName: localStorage.getItem('companyName') || 'Identity Management System',
        settings: {
          // Add any other settings that need to be backed up
        }
      }
    };
    
    return JSON.stringify(backup, null, 2);
  } catch (error) {
    throw new Error('Failed to create system backup');
  }
};

export const restoreSystem = (backupString: string): void => {
  try {
    const backup = JSON.parse(backupString);
    
    if (!backup.version || !backup.data) {
      throw new Error('Invalid backup file format');
    }
    
    // Restore applicants data
    if (backup.data.applicants) {
      localStorage.setItem('applicants', backup.data.applicants);
    }
    
    // Restore system logo
    if (backup.data.systemLogo) {
      localStorage.setItem('systemLogo', backup.data.systemLogo);
    }
    
    // Restore company name
    if (backup.data.companyName) {
      localStorage.setItem('companyName', backup.data.companyName);
    }
    
    console.log('System restored successfully from backup');
  } catch (error) {
    throw new Error('Failed to restore system from backup. Please check the backup file format.');
  }
};
