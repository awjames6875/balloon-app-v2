import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Configure multer storage for file uploads
 * - Stores files in the /uploads directory
 * - Generates unique filenames with timestamps
 * - Validates file types (image files only)
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    cb(null, uploadsDir);
  },
  
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExt);
  }
});

/**
 * File filter to only allow image files
 */
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedFileTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedFileTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, GIF, WebP, and SVG files are allowed.'));
  }
};

/**
 * Upload configuration for design images
 * Accepts a single file with field name 'image'
 * Maximum file size: 10MB
 */
export const uploadDesignImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max file size
}).single('image');

/**
 * Upload configuration for multiple design images
 * Accepts up to 10 files with field name 'images'
 * Maximum file size: 10MB each
 */
export const uploadMultipleImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max file size
}).array('images', 10); // Allow up to 10 images

/**
 * Upload configuration for other file types
 * Used for importing/exporting data files etc.
 * Accepts a single file with field name 'file'
 * Maximum file size: 5MB
 */
export const uploadFile = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExt = path.extname(file.originalname).toLowerCase();
      cb(null, file.fieldname + '-' + uniqueSuffix + fileExt);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max file size
}).single('file');

/**
 * Error handler middleware for file upload errors
 */
export const uploadErrorHandler = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File is too large',
        details: 'The maximum file size is 10MB for images and 5MB for other files.'
      });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    // An unknown error occurred
    return res.status(500).json({ message: err.message || 'An error occurred during file upload' });
  }
  
  // If no error, continue
  next();
};