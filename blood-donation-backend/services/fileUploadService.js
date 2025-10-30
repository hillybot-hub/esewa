// services/fileUploadService.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FileUploadService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../uploads');
    this.init();
  }

  async init() {
    try {
      await fs.access(this.uploadDir);
    } catch (error) {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'avatars'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'medical-records'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'temp'), { recursive: true });
    }
  }

  async uploadFile(file, options = {}) {
    const {
      folder = 'general',
      allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
      maxSize = 5 * 1024 * 1024, // 5MB
      useCloudinary = true
    } = options;

    // Validate file size
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
    }

    // Validate file type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} is not allowed`);
    }

    if (useCloudinary && process.env.CLOUDINARY_CLOUD_NAME) {
      return await this.uploadToCloudinary(file, folder);
    } else {
      return await this.uploadToLocal(file, folder);
    }
  }

  async uploadToCloudinary(file, folder) {
    try {
      const result = await uploadToCloudinary(file.path, `blood-donation/${folder}`);
      
      // Clean up local file after upload
      await this.deleteLocalFile(file.path);
      
      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        resourceType: result.resource_type
      };
    } catch (error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  async uploadToLocal(file, folder) {
    try {
      const uploadFolder = path.join(this.uploadDir, folder);
      await fs.mkdir(uploadFolder, { recursive: true });

      const fileExtension = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
      const filePath = path.join(uploadFolder, fileName);

      // Move file to destination
      await fs.rename(file.path, filePath);

      return {
        url: `/uploads/${folder}/${fileName}`,
        fileName: fileName,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: filePath
      };
    } catch (error) {
      throw new Error(`Local file upload failed: ${error.message}`);
    }
  }

  async deleteFile(fileData) {
    try {
      if (fileData.publicId) {
        // Delete from Cloudinary
        await deleteFromCloudinary(fileData.publicId);
      } else if (fileData.path) {
        // Delete local file
        await this.deleteLocalFile(fileData.path);
      }
    } catch (error) {
      console.error('File deletion error:', error);
      // Don't throw error for deletion failures
    }
  }

  async deleteLocalFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Local file deletion error:', error);
      }
    }
  }

  async cleanupTempFiles(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    try {
      const tempDir = path.join(this.uploadDir, 'temp');
      const files = await fs.readdir(tempDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await this.deleteLocalFile(filePath);
        }
      }
    } catch (error) {
      console.error('Temp files cleanup error:', error);
    }
  }

  validateMedicalFile(file) {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain'
    ];
    
    const maxSize = 10 * 1024 * 1024; // 10MB for medical files

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type for medical records');
    }

    if (file.size > maxSize) {
      throw new Error('Medical file size must be less than 10MB');
    }

    return true;
  }

  validateAvatar(file) {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    const maxSize = 2 * 1024 * 1024; // 2MB for avatars

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Avatar must be an image file (JPEG, PNG, GIF, WebP)');
    }

    if (file.size > maxSize) {
      throw new Error('Avatar size must be less than 2MB');
    }

    return true;
  }

  async getFileStats() {
    try {
      const stats = {
        totalSize: 0,
        fileCount: 0,
        byFolder: {}
      };

      const folders = ['avatars', 'medical-records', 'temp'];
      
      for (const folder of folders) {
        const folderPath = path.join(this.uploadDir, folder);
        try {
          const files = await fs.readdir(folderPath);
          let folderSize = 0;
          let folderCount = 0;

          for (const file of files) {
            const filePath = path.join(folderPath, file);
            const fileStats = await fs.stat(filePath);
            folderSize += fileStats.size;
            folderCount++;
          }

          stats.byFolder[folder] = {
            fileCount: folderCount,
            totalSize: folderSize,
            readableSize: this.formatFileSize(folderSize)
          };

          stats.totalSize += folderSize;
          stats.fileCount += folderCount;
        } catch (error) {
          if (error.code !== 'ENOENT') {
            console.error(`Error reading folder ${folder}:`, error);
          }
        }
      }

      stats.readableSize = this.formatFileSize(stats.totalSize);
      return stats;
    } catch (error) {
      console.error('File stats error:', error);
      return null;
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default new FileUploadService();