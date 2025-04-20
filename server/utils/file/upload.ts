/**
 * File Upload Utility Module
 * 
 * This module provides multer configuration for handling file uploads.
 */

import multer from "multer";
import path from "path";
import fs from "fs";
import { env } from "../../config/environment";

// Configure allowed file types
const ALLOWED_IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

/**
 * Creates the uploads directory if it doesn't exist
 * @returns Path to the uploads directory
 */
function ensureUploadsDirectory(): string {
  const uploadsDir = path.join(process.cwd(), env.UPLOAD_DIR);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

/**
 * Generates a unique filename for uploaded files
 * @param originalName Original filename
 * @returns Unique filename with original extension
 */
export function generateUniqueFilename(originalName: string): string {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  
  return `${baseName}-${uniqueSuffix}${extension}`;
}

/**
 * Validates if a file type is allowed
 * @param filename Filename to validate
 * @returns True if the file type is allowed
 */
export function isAllowedImageType(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_IMAGE_TYPES.includes(ext);
}

/**
 * Multer configuration for handling file uploads
 */
export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, ensureUploadsDirectory());
    },
    filename: (req, file, cb) => {
      const uniqueFilename = generateUniqueFilename(file.originalname);
      cb(null, uniqueFilename);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (isAllowedImageType(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only ${ALLOWED_IMAGE_TYPES.join(', ')} files are allowed.`) as any);
    }
  },
  limits: {
    fileSize: env.MAX_FILE_SIZE // Max file size in bytes (default: 10MB)
  }
});