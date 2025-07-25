import { FileProcessor, ImagePage } from './FileProcessor';
import { ProcessorStateManager } from '../state/ProcessorStateManager';
import * as UTIF from 'utif';

/**
 * Image file processor - handles all image formats including TIFF
 * Pure data processing with immutable state management
 */
export class ImageProcessor extends FileProcessor {
  private pages: ImagePage[] = [];
  private originalFile?: File;

  constructor(stateManager?: ProcessorStateManager) {
    super(stateManager);
  }

  canHandle(file: File): boolean {
    return file.type.startsWith('image/') || this.isTiffFile(file);
  }

  async loadFile(file: File): Promise<void> {
    // Start loading state
    this.stateManager.startLoading({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    try {
      this.originalFile = file;
      this.pages = [];

      if (this.isTiffFile(file)) {
        await this.loadTiffFile(file);
      } else {
        await this.loadRegularImage(file);
      }

      // Finish loading state
      this.stateManager.finishLoading(this.pages.length);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.stateManager.setError(errorMessage);
      throw error;
    }
  }

  getPages(): ImagePage[] {
    return [...this.pages];
  }

  getCurrentPage(): ImagePage | null {
    const state = this.stateManager.getState();
    return this.pages[state.currentPage] || null;
  }

  async goToPage(index: number): Promise<void> {
    const state = this.stateManager.getState();
    if (index < 0 || index >= state.totalPages) {
      throw new Error(
        `Page index ${index} out of range (0-${state.totalPages - 1})`
      );
    }

    this.stateManager.navigateToPage(index);
  }

  async navigateToPage(index: number): Promise<void> {
    await this.goToPage(index);
  }

  /**
   * Load TIFF file with multiple pages
   */
  private async loadTiffFile(file: File): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    const ifds = UTIF.decode(arrayBuffer);

    if (!ifds || ifds.length === 0) {
      throw new Error('No valid TIFF pages found');
    }

    // Decode all pages
    ifds.forEach((page) => UTIF.decodeImage(arrayBuffer, page));

    // Convert to our format
    this.pages = ifds.map((ifd, index) => ({
      index,
      imageData: {
        width: ifd.width,
        height: ifd.height,
        data: new Uint8ClampedArray(UTIF.toRGBA8(ifd)),
        format: 'rgba' as const,
      },
      metadata: {
        colorSpace: ifd.colorSpace,
        compression: ifd.compression,
        photometric: ifd.photometric,
        bitsPerSample: ifd.bitsPerSample,
      },
    }));
  }

  /**
   * Load regular image (JPEG, PNG, etc.)
   */
  private async loadRegularImage(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        try {
          // Create canvas to extract ImageData
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Cannot get canvas context');
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, img.width, img.height);

          this.pages = [
            {
              index: 0,
              imageData: {
                width: img.width,
                height: img.height,
                data: imageData.data,
                format: 'rgba' as const,
              },
              metadata: {
                originalType: file.type,
                fileName: file.name,
              },
            },
          ];

          resolve();
        } catch (error) {
          reject(error);
        } finally {
          URL.revokeObjectURL(img.src);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Check if file is a TIFF
   */
  private isTiffFile(file: File): boolean {
    return (
      file.type === 'image/tiff' ||
      file.type === 'image/tif' ||
      file.name.toLowerCase().endsWith('.tiff') ||
      file.name.toLowerCase().endsWith('.tif')
    );
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.pages = [];
    this.originalFile = undefined;
    this.stateManager.resetState();
  }
}
