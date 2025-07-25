/**
 * File statistics and metadata exposed through the API
 * Allows library users to control how and where file information is displayed
 */

import { FileType } from './config/ConfigTypes';

/**
 * Comprehensive file statistics interface
 */
export interface FileStats {
  // Basic file information
  name: string;
  size: number;
  type: FileType;
  mimeType: string;
  lastModified?: Date;

  // Image-specific properties (when applicable)
  dimensions?: {
    width: number;
    height: number;
    aspectRatio: number;
  };

  // Processing information
  processing?: {
    loadTime: number;
    renderTime: number;
    memoryUsage: number;
    compressionRatio?: number;
  };

  // Display information
  display?: {
    scaleFactor: number;
    displayDimensions: {
      width: number;
      height: number;
    };
    fitMode: 'contain' | 'cover' | 'fill' | 'none';
  };

  // Technical metadata
  metadata?: {
    colorDepth?: number;
    colorProfile?: string;
    exifData?: Record<string, any>;
    format?: {
      compression?: string;
      progressive?: boolean;
      interlaced?: boolean;
    };
  };

  // Error information (if any)
  errors?: Array<{
    code: string;
    message: string;
    severity: 'warning' | 'error';
  }>;
}

/**
 * File statistics calculator
 */
export class FileStatsCalculator {
  /**
   * Calculate basic file statistics
   */
  static calculateBasic(file: File): Partial<FileStats> {
    return {
      name: file.name,
      size: file.size,
      type: this.determineFileType(file),
      mimeType: file.type,
      lastModified: new Date(file.lastModified),
    };
  }

  /**
   * Calculate image-specific statistics
   */
  static async calculateImageStats(
    file: File,
    imageElement: HTMLImageElement
  ): Promise<Partial<FileStats>> {
    const basicStats = this.calculateBasic(file);

    const dimensions = {
      width: imageElement.naturalWidth,
      height: imageElement.naturalHeight,
      aspectRatio: imageElement.naturalWidth / imageElement.naturalHeight,
    };

    return {
      ...basicStats,
      dimensions,
      metadata: await this.extractImageMetadata(file, imageElement),
    };
  }

  /**
   * Add processing statistics
   */
  static addProcessingStats(
    stats: Partial<FileStats>,
    loadTime: number,
    renderTime: number,
    memoryUsage: number
  ): Partial<FileStats> {
    return {
      ...stats,
      processing: {
        loadTime,
        renderTime,
        memoryUsage,
        compressionRatio: stats.size ? memoryUsage / stats.size : undefined,
      },
    };
  }

  /**
   * Add display statistics
   */
  static addDisplayStats(
    stats: Partial<FileStats>,
    scaleFactor: number,
    displayDimensions: { width: number; height: number },
    fitMode: 'contain' | 'cover' | 'fill' | 'none'
  ): Partial<FileStats> {
    return {
      ...stats,
      display: {
        scaleFactor,
        displayDimensions,
        fitMode,
      },
    };
  }

  /**
   * Add error information
   */
  static addError(
    stats: Partial<FileStats>,
    code: string,
    message: string,
    severity: 'warning' | 'error' = 'error'
  ): Partial<FileStats> {
    const errors = stats.errors || [];
    errors.push({ code, message, severity });

    return {
      ...stats,
      errors,
    };
  }

  /**
   * Format file size for display
   */
  static formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }

  /**
   * Format dimensions for display
   */
  static formatDimensions(dimensions?: {
    width: number;
    height: number;
  }): string {
    if (!dimensions) {
      return 'Unknown';
    }
    return `${dimensions.width} × ${dimensions.height}`;
  }

  /**
   * Format aspect ratio for display
   */
  static formatAspectRatio(aspectRatio?: number): string {
    if (!aspectRatio) {
      return 'Unknown';
    }

    // Common aspect ratios
    const commonRatios = [
      { ratio: 16 / 9, display: '16:9' },
      { ratio: 4 / 3, display: '4:3' },
      { ratio: 3 / 2, display: '3:2' },
      { ratio: 1 / 1, display: '1:1' },
      { ratio: 21 / 9, display: '21:9' },
    ];

    for (const common of commonRatios) {
      if (Math.abs(aspectRatio - common.ratio) < 0.01) {
        return common.display;
      }
    }

    return `${aspectRatio.toFixed(2)}:1`;
  }

  /**
   * Get a summary string of file information
   */
  static getSummary(stats: FileStats): string {
    const parts: string[] = [];

    if (stats.dimensions) {
      parts.push(this.formatDimensions(stats.dimensions));
    }

    parts.push(this.formatSize(stats.size));

    if (stats.processing?.loadTime) {
      parts.push(`${stats.processing.loadTime.toFixed(0)}ms`);
    }

    return parts.join(' • ');
  }

  private static determineFileType(file: File): FileType {
    const mimeType = file.type.toLowerCase();

    if (mimeType.startsWith('image/')) {
      return FileType.IMAGE;
    }

    // Add other file types as they are supported
    return FileType.IMAGE; // Default for now
  }

  private static async extractImageMetadata(
    file: File,
    imageElement: HTMLImageElement
  ): Promise<Partial<FileStats['metadata']>> {
    const metadata: Partial<FileStats['metadata']> = {};

    // Try to determine color depth (simplified)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (ctx) {
      canvas.width = Math.min(imageElement.naturalWidth, 1);
      canvas.height = Math.min(imageElement.naturalHeight, 1);

      try {
        ctx.drawImage(imageElement, 0, 0, 1, 1);
        const imageData = ctx.getImageData(0, 0, 1, 1);
        metadata.colorDepth = (imageData.data.length * 8) / 4; // Approximate
      } catch (error) {
        // Ignore canvas security errors
      }
    }

    // Format detection based on file extension and MIME type
    const extension = file.name.split('.').pop()?.toLowerCase();

    metadata.format = {
      compression: this.getCompressionType(file.type, extension),
      progressive: this.isProgressiveFormat(file.type, extension),
      interlaced: this.isInterlacedFormat(file.type, extension),
    };

    return metadata;
  }

  private static getCompressionType(
    mimeType: string,
    extension?: string
  ): string {
    if (
      mimeType.includes('jpeg') ||
      extension === 'jpg' ||
      extension === 'jpeg'
    ) {
      return 'JPEG';
    }
    if (mimeType.includes('png') || extension === 'png') {
      return 'PNG';
    }
    if (mimeType.includes('webp') || extension === 'webp') {
      return 'WebP';
    }
    if (mimeType.includes('gif') || extension === 'gif') {
      return 'GIF';
    }
    return 'Unknown';
  }

  private static isProgressiveFormat(
    mimeType: string,
    extension?: string
  ): boolean {
    // Only JPEG can be progressive in common formats
    return (
      mimeType.includes('jpeg') || extension === 'jpg' || extension === 'jpeg'
    );
  }

  private static isInterlacedFormat(
    mimeType: string,
    extension?: string
  ): boolean {
    // PNG and GIF can be interlaced
    return (
      mimeType.includes('png') ||
      mimeType.includes('gif') ||
      extension === 'png' ||
      extension === 'gif'
    );
  }
}
