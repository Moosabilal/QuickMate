// src/utils/cloudinaryUpload.ts
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'; // Node.js file system module for deleting local files

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  timeout: 60000, // Use HTTPS
});

/**
 * Uploads a file to Cloudinary and returns its secure URL.
 * Also deletes the local file after successful upload.
 * @param filePath The local path to the file to upload.
 * @returns The secure URL of the uploaded image.
 */
export const uploadToCloudinary = async (filePath: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'quickmate_images', // Optional: specific folder for category icons
      transformation: [{ width: 200, height: 200, crop: "fill" }], // Example: resize image
      timeout: 60000,
    });

    // Delete the local file after successful upload
    fs.unlinkSync(filePath);

    return result.secure_url; // Returns the URL of the uploaded image
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // Ensure the local file is still deleted even if Cloudinary upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error('Failed to upload image to Cloudinary.');
  }
};

/**
 * Deletes an image from Cloudinary by its public ID.
 * @param publicId The public ID of the image to delete.
 */
export const deleteFromCloudinary = async (publicId: string): Promise<any> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw new Error('Failed to delete image from Cloudinary.');
  }
};