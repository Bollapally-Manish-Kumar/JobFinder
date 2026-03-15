/**
 * Profile Controller
 * Handles user profile management including resume upload
 */

import prisma from '../utils/prisma.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import { deleteFile } from '../middlewares/upload.js';
import fs from 'fs';

// Dynamically import pdf-parse (CommonJS module)
let pdfParse;
const loadPdfParse = async () => {
  if (!pdfParse) {
    const module = await import('pdf-parse/lib/pdf-parse.js');
    pdfParse = module.default;
  }
  return pdfParse;
};

const profileSelect = {
  id: true,
  email: true,
  name: true,
  plan: true,
  paymentVerified: true,
  expiresAt: true,
  resumeText: true,
  resumeUploadedAt: true,
  createdAt: true,
  phone: true,
  city: true,
  country: true,
  linkedin: true,
  portfolio: true,
  experienceYears: true,
  currentCompany: true,
  currentTitle: true,
  address: true,
  state: true,
  zipCode: true,
  gender: true,
  dateOfBirth: true,
  nationality: true,
  highestEducation: true,
  university: true,
  graduationYear: true,
  major: true,
  gpa: true,
  noticePeriod: true,
  expectedSalary: true,
  currentSalary: true,
  skills: true,
  workAuthorization: true,
  willingToRelocate: true,
  remotePreference: true,
  preferredLocations: true,
  preferredRoles: true,
  github: true,
  twitter: true,
  website: true
};

const serializeProfile = (user) => ({
  ...user,
  hasResume: !!user.resumeText,
  resumeTextPreview: user.resumeText ? user.resumeText.substring(0, 200) + '...' : null
});

/**
 * Get user profile
 * GET /api/profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: profileSelect
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    success: true,
    profile: serializeProfile(user)
  });
});

/**
 * Upload resume PDF and extract text
 * POST /api/profile/resume
 */
export const uploadResume = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({
      error: 'No file uploaded',
      message: 'Please upload a PDF resume file.'
    });
  }

  const filePath = req.file.path;

  try {
    console.log(`[Profile] Processing resume for user ${userId}`);

    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);
    
    // Parse PDF and extract text
    const pdf = await loadPdfParse();
    const pdfData = await pdf(dataBuffer);
    
    // Get extracted text
    let resumeText = pdfData.text || '';
    
    // Clean up the text
    resumeText = resumeText
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/\n{3,}/g, '\n\n')  // Remove excessive newlines
      .trim();

    if (resumeText.length < 50) {
      return res.status(400).json({
        error: 'Invalid resume',
        message: 'Could not extract enough text from the PDF. Please upload a text-based PDF (not scanned image).'
      });
    }

    // Limit text length to prevent database bloat (max ~50KB)
    if (resumeText.length > 50000) {
      resumeText = resumeText.substring(0, 50000);
    }

    // Update user with resume text
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        resumeText: resumeText,
        resumeUploadedAt: new Date()
      },
      select: {
        id: true,
        resumeUploadedAt: true
      }
    });

    console.log(`[Profile] ✅ Resume uploaded for user ${userId} (${resumeText.length} chars)`);

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeUploadedAt: updatedUser.resumeUploadedAt,
      textLength: resumeText.length,
      preview: resumeText.substring(0, 300) + '...'
    });

  } catch (error) {
    console.error('[Profile] Resume parsing error:', error);
    
    if (error.message?.includes('encrypted')) {
      return res.status(400).json({
        error: 'Encrypted PDF',
        message: 'The PDF is password protected. Please upload an unprotected PDF.'
      });
    }

    return res.status(500).json({
      error: 'Processing failed',
      message: 'Failed to process the resume PDF. Please try again with a different file.'
    });
  } finally {
    // Always delete the temporary file
    try {
      await deleteFile(filePath);
      console.log(`[Profile] Cleaned up temp file: ${filePath}`);
    } catch (e) {
      console.error('[Profile] Failed to delete temp file:', e);
    }
  }
});

/**
 * Delete user's resume
 * DELETE /api/profile/resume
 */
export const deleteResume = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await prisma.user.update({
    where: { id: userId },
    data: {
      resumeText: null,
      resumeUploadedAt: null
    }
  });

  console.log(`[Profile] Resume deleted for user ${userId}`);

  res.json({
    success: true,
    message: 'Resume deleted successfully'
  });
});

/**
 * Update user profile
 * PUT /api/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { 
    name, 
    phone, 
    city, 
    country, 
    linkedin, 
    portfolio,
    experienceYears,
    currentCompany,
    currentTitle,
    // Extended fields
    address,
    state,
    zipCode,
    gender,
    dateOfBirth,
    nationality,
    highestEducation,
    university,
    graduationYear,
    major,
    gpa,
    noticePeriod,
    expectedSalary,
    currentSalary,
    skills,
    workAuthorization,
    willingToRelocate,
    remotePreference,
    preferredLocations,
    preferredRoles,
    github,
    twitter,
    website
  } = req.body;

  const updateData = {};
  
  // String fields with length limits
  if (name !== undefined) {
    updateData.name = (name || '').trim().substring(0, 100) || null;
  }
  if (phone !== undefined) {
    updateData.phone = (phone || '').trim().substring(0, 20) || null;
  }
  if (city !== undefined) {
    updateData.city = (city || '').trim().substring(0, 100) || null;
  }
  if (country !== undefined) {
    updateData.country = (country || '').trim().substring(0, 100) || null;
  }
  if (linkedin !== undefined) {
    updateData.linkedin = (linkedin || '').trim().substring(0, 200) || null;
  }
  if (portfolio !== undefined) {
    updateData.portfolio = (portfolio || '').trim().substring(0, 200) || null;
  }
  if (currentCompany !== undefined) {
    updateData.currentCompany = (currentCompany || '').trim().substring(0, 100) || null;
  }
  if (currentTitle !== undefined) {
    updateData.currentTitle = (currentTitle || '').trim().substring(0, 100) || null;
  }
  
  // Integer fields
  if (experienceYears !== undefined) {
    const years = parseInt(experienceYears, 10);
    updateData.experienceYears = !isNaN(years) && years >= 0 && years <= 50 ? years : null;
  }
  if (graduationYear !== undefined) {
    const year = parseInt(graduationYear, 10);
    updateData.graduationYear = !isNaN(year) && year >= 1950 && year <= 2040 ? year : null;
  }

  // Boolean field
  if (willingToRelocate !== undefined) {
    updateData.willingToRelocate = willingToRelocate === true || willingToRelocate === 'true' ? true : willingToRelocate === false || willingToRelocate === 'false' ? false : null;
  }

  // Extended string fields
  const extendedStringFields = {
    address: 300, state: 100, zipCode: 20, gender: 30, dateOfBirth: 20,
    nationality: 100, highestEducation: 100, university: 200, major: 100,
    gpa: 20, noticePeriod: 50, expectedSalary: 50, currentSalary: 50,
    skills: 500, workAuthorization: 100, remotePreference: 50,
    preferredLocations: 300, preferredRoles: 300,
    github: 200, twitter: 200, website: 200
  };
  for (const [field, maxLen] of Object.entries(extendedStringFields)) {
    const val = req.body[field];
    if (val !== undefined) {
      updateData[field] = (val || '').toString().trim().substring(0, maxLen) || null;
    }
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      error: 'No valid fields to update'
    });
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: profileSelect
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    profile: serializeProfile(updatedUser)
  });
});

export default {
  getProfile,
  uploadResume,
  deleteResume,
  updateProfile
};
