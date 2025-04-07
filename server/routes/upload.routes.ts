import { Router, Request, Response } from 'express';
import { isAuthenticated, AuthenticatedRequest } from '../middleware/auth.middleware';
import { uploadDesignImage, uploadFile, uploadErrorHandler } from '../middleware/upload.middleware';
import { analyzeDesignImage } from '../ai';
import fs from 'fs';
import path from 'path';

const router = Router();

/**
 * Upload a design image
 * POST /api/upload/design
 * Requires authentication
 * Returns the URL of the uploaded image
 */
router.post('/design', isAuthenticated, (req: Request, res: Response) => {
  uploadDesignImage(req, res, (err) => {
    if (err) {
      return uploadErrorHandler(err, req, res, () => {});
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const filePath = `/uploads/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      imageUrl: filePath,
      filename: req.file.filename,
      originalname: req.file.originalname
    });
  });
});

/**
 * Upload and analyze a design image
 * POST /api/upload/analyze
 * Requires authentication
 * Uses AI to analyze the design for balloon requirements
 */
router.post('/analyze', isAuthenticated, (req: Request, res: Response) => {
  uploadDesignImage(req, res, async (err) => {
    if (err) {
      return uploadErrorHandler(err, req, res, () => {});
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    try {
      // Analyze the uploaded image
      const analysis = await analyzeDesignImage(req.file.path);
      
      // Return both the file information and the analysis
      res.json({
        success: true,
        imageUrl: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
        originalname: req.file.originalname,
        analysis
      });
    } catch (error) {
      console.error('Design analysis error:', error);
      res.status(500).json({ 
        message: 'Failed to analyze design image',
        error: (error as Error).message 
      });
    }
  });
});

/**
 * Delete a file
 * DELETE /api/upload/:filename
 * Requires authentication
 */
router.delete('/:filename', isAuthenticated, (req: Request, res: Response) => {
  const filename = req.params.filename;
  
  // Simple security check to prevent path traversal
  if (filename.includes('../') || filename.includes('/')) {
    return res.status(400).json({ message: 'Invalid filename' });
  }
  
  const filePath = path.join(process.cwd(), 'uploads', filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }
  
  // Delete the file
  try {
    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ 
      message: 'Failed to delete file',
      error: (error as Error).message 
    });
  }
});

export default router;