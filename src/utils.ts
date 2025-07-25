import { FileInfo, FileType } from './types';

/**
 * Utility functions for file operations
 */
export class FileUtils {
  /**
   * Extract file information from a File object
   */
  static getFileInfo(file: File): FileInfo {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified),
    };
  }

  /**
   * Determine the file type category
   */
  static getFileType(file: File): FileType | null {
    const mimeType = file.type.toLowerCase();

    if (mimeType.startsWith('image/')) {
      return FileType.IMAGE;
    }

    // Future extensions for other file types
    // if (mimeType.startsWith('video/')) return FileType.VIDEO;
    // if (mimeType.startsWith('audio/')) return FileType.AUDIO;

    return null;
  }

  /**
   * Check if a file is a supported image type
   */
  static isImageFile(file: File): boolean {
    const supportedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/tiff',
      'image/tif',
    ];
    return (
      supportedTypes.includes(file.type.toLowerCase()) ||
      this.isTiffByExtension(file.name)
    );
  }

  /**
   * Check if file is TIFF by extension (fallback for when MIME type is not set correctly)
   */
  static isTiffByExtension(fileName: string): boolean {
    const extension = fileName.toLowerCase().split('.').pop();
    return extension === 'tiff' || extension === 'tif';
  }

  /**
   * Format file size in human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Create a data URL from a file
   */
  static createDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsDataURL(file);
    });
  }
}
