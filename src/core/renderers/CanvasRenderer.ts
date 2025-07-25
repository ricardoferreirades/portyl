import { Renderer, RenderOptions } from './Renderer';
import { ImagePage } from '../processors/FileProcessor';

/**
 * Canvas-based renderer
 * Renders image pages to HTML5 Canvas elements
 */
export class CanvasRenderer extends Renderer {
  async render(page: ImagePage, target: HTMLCanvasElement, options: RenderOptions = {}): Promise<void> {
    const ctx = target.getContext('2d');
    if (!ctx) {
      throw new Error('Cannot get canvas 2D context');
    }

    const { imageData } = page;
    const {
      maxWidth = target.width,
      maxHeight = target.height,
      preserveAspectRatio = true,
      backgroundColor = 'transparent'
    } = options;

    // Calculate display dimensions
    const { width, height } = this.calculateDimensions(
      imageData.width,
      imageData.height,
      maxWidth,
      maxHeight,
      preserveAspectRatio
    );

    // Update canvas size if needed
    if (target.width !== maxWidth || target.height !== maxHeight) {
      target.width = maxWidth;
      target.height = maxHeight;
    }

    // Clear canvas
    this.clear(target);

    // Fill background if specified
    if (backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, target.width, target.height);
    }

    // Create ImageData object
    const canvasImageData = new ImageData(imageData.data, imageData.width, imageData.height);
    
    // Create temporary canvas for the image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    tempCtx.putImageData(canvasImageData, 0, 0);

    // Calculate position to center the image
    const x = (target.width - width) / 2;
    const y = (target.height - height) / 2;

    // Draw scaled image
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(tempCanvas, x, y, width, height);

    // Add file info if requested
    if (options.showFileInfo && page.metadata) {
      this.renderFileInfo(ctx, page, target.width, target.height);
    }
  }

  clear(target: HTMLCanvasElement): void {
    const ctx = target.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, target.width, target.height);
    }
  }

  resize(target: HTMLCanvasElement, newWidth: number, newHeight: number): void {
    target.width = newWidth;
    target.height = newHeight;
  }

  /**
   * Render file information overlay
   */
  private renderFileInfo(
    ctx: CanvasRenderingContext2D, 
    page: ImagePage, 
    canvasWidth: number, 
    canvasHeight: number
  ): void {
    const { imageData, metadata } = page;
    
    // Prepare info text
    const info = [
      `Dimensions: ${imageData.width} × ${imageData.height}`,
      `Format: ${imageData.format.toUpperCase()}`,
      metadata?.originalType && `Type: ${metadata.originalType}`,
      metadata?.fileName && `File: ${metadata.fileName}`
    ].filter(Boolean);

    if (info.length === 0) return;

    // Style
    const fontSize = 12;
    const padding = 8;
    const lineHeight = fontSize + 2;
    const boxHeight = info.length * lineHeight + padding * 2;
    const boxWidth = Math.max(...info.map(text => ctx.measureText(text).width)) + padding * 2;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, boxWidth, boxHeight);

    // Text
    ctx.fillStyle = 'white';
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = 'top';

    info.forEach((text, index) => {
      ctx.fillText(text, 10 + padding, 10 + padding + index * lineHeight);
    });
  }
}
