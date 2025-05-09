
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a unique ID with GIS prefix
export function generateUniqueId(): string {
  // Create a random number string
  const randomPart = Math.floor(100000000 + Math.random() * 900000000).toString();
  
  // Return the ID with GIS prefix
  return `GIS-${randomPart}`;
}

// Validate and process image uploads
export function handleImageUpload(
  file: File, 
  callback: (result: string) => void, 
  options = { maxSizeMB: 2 }
): void {
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    throw new Error("Please upload an image file");
  }
  
  // Check file size (default limit to 2MB)
  if (file.size > options.maxSizeMB * 1024 * 1024) {
    throw new Error(`Image size should be less than ${options.maxSizeMB}MB`);
  }
  
  const reader = new FileReader();
  
  reader.onloadend = () => {
    const result = reader.result as string;
    if (result) {
      callback(result);
    }
  };
  
  reader.readAsDataURL(file);
}
