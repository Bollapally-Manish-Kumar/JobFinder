/**
 * File Upload Middleware
 * Handles file uploads with validation and security
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// QR code uploads directory
const qrUploadsDir = path.join(uploadsDir, 'qr');
if (!fs.existsSync(qrUploadsDir)) {
  fs.mkdirSync(qrUploadsDir, { recursive: true });
}

// Temp uploads directory for PDFs
const tempUploadsDir = path.join(uploadsDir, 'temp');
if (!fs.existsSync(tempUploadsDir)) {
  fs.mkdirSync(tempUploadsDir, { recursive: true });
}

/**
 * Sanitize filename to prevent path traversal attacks
 */
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 100);
};

/**
 * Storage configuration for QR code uploads
 */
const qrStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, qrUploadsDir);
  },
  filename: (req, file, cb) => {
    // Always save as admin-qr.png to overwrite
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `admin-qr${ext}`);
  }
});

/**
 * Storage configuration for temporary PDF uploads
 */
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempUploadsDir);
  },
  filename: (req, file, cb) => {
    // Unique filename with timestamp
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = sanitizeFilename(path.basename(file.originalname, ext));
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  }
});

/**
 * File filter for image uploads (QR codes)
 */
const imageFileFilter = (req, file, cb) => {
  // Check MIME type
  const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only PNG, JPG, and WebP images are allowed.'), false);
  }

  // Check extension
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.png', '.jpg', '.jpeg', '.webp'];
  
  if (!allowedExts.includes(ext)) {
    return cb(new Error('Invalid file extension.'), false);
  }

  cb(null, true);
};

/**
 * File filter for PDF uploads (resumes)
 */
const pdfFileFilter = (req, file, cb) => {
  // Check MIME type
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
  }

  // Check extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.pdf') {
    return cb(new Error('Invalid file extension. Only .pdf files are allowed.'), false);
  }

  cb(null, true);
};

/**
 * QR Code upload middleware
 * - Max size: 5MB
 * - Allowed: PNG, JPG, WebP
 */
export const uploadQR = multer({
  storage: qrStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: imageFileFilter
});

/**
 * PDF Resume upload middleware
 * - Max size: 2MB
 * - Allowed: PDF only
 */
export const uploadPDF = multer({
  storage: pdfStorage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: pdfFileFilter
});

/**
 * Delete a file safely
 */
export const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('[Upload] Error deleting file:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * Get uploads directory path
 */
export const getUploadsDir = () => uploadsDir;
export const getQrUploadsDir = () => qrUploadsDir;
export const getTempUploadsDir = () => tempUploadsDir;

/**
 * Multer error handler middleware
 */
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size exceeds the maximum allowed limit.'
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: error.message
    });
  }
  
  if (error.message) {
    return res.status(400).json({
      error: 'Invalid file',
      message: error.message
    });
  }
  
  next(error);
};

export default {
  uploadQR,
  uploadPDF,
  deleteFile,
  handleUploadError,
  getUploadsDir,
  getQrUploadsDir,
  getTempUploadsDir
};
