import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

/**
 * Configure multer for file uploads
 * Creates a middleware for handling multipart/form-data
 */
export const configureFileUpload = () => {
  // Ensure uploads directory exists
  const createUploadsDir = () => {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    return uploadsDir;
  };

  // Create and return multer instance with configuration
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, createUploadsDir());
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WebP files are allowed.') as any);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    }
  });
};

/**
 * Middleware for uploading design images
 * @param fieldName Form field name containing the image
 */
export function uploadDesignImage(fieldName: string = 'image') {
  const upload = configureFileUpload();
  
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      
      // If no file was uploaded, continue without error
      if (!req.file) {
        return next();
      }
      
      // Add file path to request for route handlers
      const filePath = `/uploads/${req.file.filename}`;
      req.body.imageUrl = filePath;
      
      next();
    });
  };
}