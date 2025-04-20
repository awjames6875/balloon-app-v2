/**
 * File Upload Middleware Module
 * 
 * Provides middleware functions for handling file uploads.
 */

import { Express } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Configure multer for file uploads
 * @returns Multer middleware configured for the application's needs
 */
export function configureFileUpload() {
  // Set up multer for file uploads
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadsDir = path.join(process.cwd(), "uploads");
        
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        // Generate unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
      }
    }),
    fileFilter: (req, file, cb) => {
      // Validate file types
      const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const ext = path.extname(file.originalname).toLowerCase();
      
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type. Only ${allowedTypes.join(', ')} files are allowed.`) as any);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB file size limit
    }
  });
}

/**
 * Get the multer upload middleware
 * Configured for design image uploads
 */
export const uploadDesignImage = configureFileUpload().single('image');

/**
 * Get the multer upload middleware
 * Configured for multiple file uploads
 * @param fieldName The field name for the files
 * @param maxCount Maximum number of files allowed (default: 5)
 */
export function uploadFiles(fieldName: string, maxCount: number = 5) {
  return configureFileUpload().array(fieldName, maxCount);
}

/**
 * Helper function to create a URL for an uploaded file
 * @param filename The filename of the uploaded file
 * @returns Absolute URL to the file
 */
export function getUploadedFileUrl(filename: string): string {
  return `/uploads/${filename}`;
}