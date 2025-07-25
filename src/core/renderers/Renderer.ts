import { ImagePage } from '../processors/FileProcessor';

/**
 * Rendering options for all renderers
 */
export interface RenderOptions {
  maxWidth?: number;
  maxHeight?: number;
  showFileInfo?: boolean;
  preserveAspectRatio?: boolean;
  backgroundColor?: string;
  className?: string;
}

/**
 * Generic render target interface
 */
export interface RenderTarget {
  width: number;
  height: number;
}

/**
 * Abstract renderer interface
 * Defines contract for rendering image pages to different targets
 */
export abstract class Renderer {
  abstract render(page: ImagePage, target: RenderTarget, options?: RenderOptions): Promise<void>;
  abstract clear(target: RenderTarget): void;
  abstract resize(target: RenderTarget, newWidth: number, newHeight: number): void;
  
  /**
   * Calculate dimensions maintaining aspect ratio
   */
  protected calculateDimensions(
    imageWidth: number,
    imageHeight: number,
    maxWidth: number,
    maxHeight: number,
    preserveAspectRatio: boolean = true
  ): { width: number; height: number } {
    if (!preserveAspectRatio) {
      return { width: maxWidth, height: maxHeight };
    }

    const aspectRatio = imageWidth / imageHeight;
    const maxAspectRatio = maxWidth / maxHeight;

    let width, height;

    if (aspectRatio > maxAspectRatio) {
      // Image is wider than container
      width = Math.min(imageWidth, maxWidth);
      height = width / aspectRatio;
    } else {
      // Image is taller than container
      height = Math.min(imageHeight, maxHeight);
      width = height * aspectRatio;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }
}
