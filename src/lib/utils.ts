
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
