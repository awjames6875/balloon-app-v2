/**
 * File Upload Utility Module
 * 
 * Provides utility functions for handling file uploads.
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { environment } from '../../config/environment';

// Promisify file system operations
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

/**
 * Ensure uploads directory exists
 * @param directory Directory path to ensure exists
 * @returns Path to the directory
 */
export async function ensureUploadsDirectory(directory: string = environment.UPLOAD_DIR): Promise<string> {
  const fullPath = path.resolve(process.cwd(), directory);
  
  try {
    await mkdir(fullPath, { recursive: true });
    return fullPath;
  } catch (error) {
    // If directory already exists, that's fine
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
    return fullPath;
  }
}

/**
 * Save a file from a base64 string
 * @param base64Data Base64 encoded file data
 * @param filename Filename to save as
 * @param mimeType MIME type of the file
 * @returns Path to the saved file
 */
export async function saveBase64File(
  base64Data: string,
  filename: string,
  mimeType: string = 'image/jpeg'
): Promise<string> {
  // Remove MIME type prefix if present
  const data = base64Data.includes('base64,')
    ? base64Data.split('base64,')[1]
    : base64Data;
  
  // Ensure uploads directory exists
  const uploadsDir = await ensureUploadsDirectory();
  
  // Generate unique filename
  const uniqueFilename = `${Date.now()}-${filename}`;
  const filePath = path.join(uploadsDir, uniqueFilename);
  
  // Save file
  const buffer = Buffer.from(data, 'base64');
  await writeFile(filePath, buffer);
  
  // Return the URL path (not filesystem path)
  return `/uploads/${uniqueFilename}`;
}

/**
 * Delete a file
 * @param fileUrl URL path of the file to delete
 * @returns True if the file was deleted successfully
 */
export async function deleteFile(fileUrl: string): Promise<boolean> {
  // Extract filename from URL
  const filename = path.basename(fileUrl);
  const filePath = path.join(process.cwd(), environment.UPLOAD_DIR, filename);
  
  try {
    await unlink(filePath);
    return true;
  } catch (error) {
    console.error('Failed to delete file:', error);
    return false;
  }
}

/**
 * Check if a file exists
 * @param filePath Path to the file
 * @returns True if the file exists
 */
export function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    console.error('Error checking if file exists:', error);
    return false;
  }
}