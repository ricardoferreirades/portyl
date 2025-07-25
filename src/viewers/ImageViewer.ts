import { FileViewer, ViewerOptions, ViewerResult } from '../types';
import { FileUtils } from '../utils';

interface ImageViewerState {
  currentPage: number;
  totalPages: number;
  imageData: ImageData | null;
  canvas: HTMLCanvasElement | null;
  originalImage: HTMLImageElement | null;
}

/**
 * Canvas-based image file viewer implementation with TIFF support
 */
export class ImageViewer implements FileViewer {
  private currentElement?: HTMLElement;
  private state: ImageViewerState = {
    currentPage: 0,
    totalPages: 1,
    imageData: null,
    canvas: null,
    originalImage: null,
  };

  /**
   * Check if this viewer can handle the given file
   */
  canHandle(file: File): boolean {
    return FileUtils.isImageFile(file);
  }

  /**
   * Render the image file in the provided container
   */
  async render(file: File, options: ViewerOptions): Promise<ViewerResult> {
    try {
      // Clean up any existing viewer
      this.destroy();

      const fileInfo = FileUtils.getFileInfo(file);
      const isTiff = this.isTiffFile(file);

      // Create the main viewer container
      const viewerContainer = document.createElement('div');
      viewerContainer.className = `browser-file-viewer image-viewer ${options.className || ''}`;
      
      // Apply container styles
      this.applyContainerStyles(viewerContainer, options);

      // Create canvas for rendering
      const canvas = document.createElement('canvas');
      canvas.style.display = 'block';
      canvas.style.border = '1px solid #ddd';
      canvas.style.borderRadius = '4px';
      canvas.style.maxWidth = 'none'; // Remove CSS scaling constraints
      canvas.style.maxHeight = 'none'; // Remove CSS scaling constraints

      this.state.canvas = canvas;

      // Load and render the image
      if (isTiff) {
        await this.renderTiffToCanvas(file, canvas, fileInfo, options.showFileInfo || false);
      } else {
        await this.renderImageToCanvas(file, canvas, fileInfo, options.showFileInfo || false);
      }

      viewerContainer.appendChild(canvas);

      // Resize canvas to fit container and redraw with proper scaling
      if (this.state.originalImage) {
        this.resizeCanvasToContainer(canvas, this.state.originalImage, fileInfo, options.showFileInfo || false);
      }

      // Add file info overlay if needed (this is now handled in resizeCanvasToContainer)
      // No need for setTimeout since we're calling resizeCanvasToContainer after DOM insertion

      // Remove HTML file info since it's now rendered on canvas
      // Add page navigation for multi-page TIFFs (position it after info)
      if (isTiff && this.state.totalPages > 1) {
        const pageControls = this.createPageControls();
        viewerContainer.appendChild(pageControls);
      }

      // Clear the container and add our viewer
      options.container.innerHTML = '';
      options.container.appendChild(viewerContainer);

      this.currentElement = viewerContainer;

      return {
        success: true,
        element: viewerContainer,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Check if file is TIFF
   */
  private isTiffFile(file: File): boolean {
    return file.type === 'image/tiff' || 
           file.type === 'image/tif' || 
           FileUtils.isTiffByExtension(file.name);
  }

  /**
   * Render regular image to canvas
   */
  private async renderImageToCanvas(file: File, canvas: HTMLCanvasElement, fileInfo?: any, showFileInfo: boolean = false): Promise<void> {
    const dataURL = await FileUtils.createDataURL(file);
    const img = new Image();
    
    return new Promise<void>((resolve, reject) => {
      img.onload = () => {
        this.state.originalImage = img;
        this.drawImageToCanvas(img, canvas, fileInfo, false); // Don't draw info here, do it later
        resolve();
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataURL;
    });
  }

  /**
   * Render TIFF to canvas (using browser's native support)
   */
  private async renderTiffToCanvas(file: File, canvas: HTMLCanvasElement, fileInfo?: any, showFileInfo: boolean = false): Promise<void> {
    try {
      // For now, treat TIFF like regular images and let the browser handle it
      // In the future, we could implement proper TIFF parsing for multi-page support
      await this.renderImageToCanvas(file, canvas, fileInfo, false); // Don't draw info here, do it later
      this.state.totalPages = 1; // For now, assume single page
    } catch (error) {
      throw new Error(`TIFF rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Draw image to canvas with proper scaling
   */
  private drawImageToCanvas(img: HTMLImageElement, canvas: HTMLCanvasElement, fileInfo?: any, showFileInfo: boolean = false): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // For now, set canvas to image natural size - we'll resize it later when it's in the DOM
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image at natural size
    ctx.drawImage(img, 0, 0);

    // Store image data for potential manipulation
    this.state.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Note: File info overlay will be drawn later after canvas is properly sized
  }

  /**
   * Resize canvas to fit container and redraw image with proper scaling
   */
  private resizeCanvasToContainer(canvas: HTMLCanvasElement, img: HTMLImageElement, fileInfo?: any, showFileInfo: boolean = false): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Get container dimensions
    const container = canvas.parentElement;
    if (!container) {
      console.warn('Canvas has no parent container, using default dimensions');
      return;
    }

    // Get available container dimensions
    const containerRect = container.getBoundingClientRect();
    const containerWidth = Math.max(containerRect.width || 800, 400);
    const containerHeight = Math.max(containerRect.height || 600, 300);
    
    // Make canvas fill the entire parent container
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    
    // Set canvas internal resolution to match container size
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate how to center and scale the image within the canvas
    const imageAspectRatio = img.naturalWidth / img.naturalHeight;
    const canvasAspectRatio = canvas.width / canvas.height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imageAspectRatio > canvasAspectRatio) {
      // Image is wider than canvas - fit to width, center vertically
      drawWidth = canvas.width;
      drawHeight = canvas.width / imageAspectRatio;
      drawX = 0;
      drawY = (canvas.height - drawHeight) / 2;
    } else {
      // Image is taller than canvas - fit to height, center horizontally
      drawHeight = canvas.height;
      drawWidth = canvas.height * imageAspectRatio;
      drawX = (canvas.width - drawWidth) / 2;
      drawY = 0;
    }

    // Draw image centered and scaled to fit within canvas
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    // Draw file info overlay on canvas if requested
    if (showFileInfo && fileInfo) {
      this.drawFileInfoOnCanvas(ctx, canvas, fileInfo);
    }
  }
  private drawFileInfoOnCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, fileInfo: any): void {
    // Since canvas internal size now matches display size, no complex scaling needed
    const scale = 1; // Canvas pixels = display pixels
    
    // Fixed dimensions for readable text
    const basePadding = 12;
    const baseLineHeight = 18;
    const baseFontSize = 13;
    const baseBorderRadius = 6;
    const baseMargin = 16;
    
    // Apply minimal scaling (mostly 1:1 now)
    const padding = basePadding * scale;
    const lineHeight = baseLineHeight * scale;
    const fontSize = baseFontSize * scale;
    const borderRadius = baseBorderRadius * scale;
    const margin = baseMargin * scale;
    
    // Info text data (separate labels and values for different styling)
    const infoData = [
      { label: 'Name:', value: fileInfo.name },
      { label: 'Size:', value: FileUtils.formatFileSize(fileInfo.size) },
      { label: 'Type:', value: fileInfo.type }
    ];
    
    // Set font for measuring text
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    const labelWidths = infoData.map(item => ctx.measureText(item.label).width);
    
    ctx.font = `${fontSize}px Arial, sans-serif`;
    const valueWidths = infoData.map(item => ctx.measureText(item.value).width);
    
    // Calculate max width (label + space + value)
    const spaceWidth = ctx.measureText(' ').width;
    const maxTextWidth = Math.max(...infoData.map((item, index) => 
      labelWidths[index] + spaceWidth + valueWidths[index]
    ));
    
    const boxWidth = maxTextWidth + (padding * 2);
    const boxHeight = (infoData.length * lineHeight) + (padding * 2);
    
    // Position at bottom-left with margin - ALWAYS visible on canvas
    const x = margin;
    const y = canvas.height - boxHeight - margin;
    
    // Ensure the box is always within canvas bounds
    const finalX = Math.max(margin, Math.min(x, canvas.width - boxWidth - margin));
    const finalY = Math.max(margin, Math.min(y, canvas.height - boxHeight - margin));
    
    // Draw rounded rectangle background (white with black border)
    this.drawRoundedRect(ctx, finalX, finalY, boxWidth, boxHeight, borderRadius, 'white', 'black', 2);
    
    // Draw text with bold labels
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    infoData.forEach((item, index) => {
      const textY = finalY + padding + (index * lineHeight);
      
      // Draw bold label
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = 'black';
      ctx.fillText(item.label, finalX + padding, textY);
      
      // Draw regular value
      const labelWidth = ctx.measureText(item.label).width;
      ctx.font = `${fontSize}px Arial, sans-serif`;
      ctx.fillText(` ${item.value}`, finalX + padding + labelWidth, textY);
    });
  }

  /**
   * Draw a rounded rectangle on canvas
   */
  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fillColor?: string,
    strokeColor?: string,
    strokeWidth?: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }

    if (strokeColor && strokeWidth) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
  }
  private createPageControls(): HTMLElement {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'page-controls';
    
    // Position fixed at bottom center, but offset to avoid file info
    controlsContainer.style.position = 'absolute';
    controlsContainer.style.bottom = '10px';
    controlsContainer.style.left = '50%';
    controlsContainer.style.transform = 'translateX(-50%)';
    controlsContainer.style.zIndex = '10';
    
    // Layout and styling
    controlsContainer.style.display = 'flex';
    controlsContainer.style.alignItems = 'center';
    controlsContainer.style.justifyContent = 'center';
    controlsContainer.style.gap = '10px';
    controlsContainer.style.padding = '8px 16px';
    controlsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    controlsContainer.style.borderRadius = '6px';
    controlsContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
    controlsContainer.style.backdropFilter = 'blur(4px)';

    const prevButton = document.createElement('button');
    prevButton.textContent = '◀ Previous';
    prevButton.style.padding = '6px 12px';
    prevButton.style.backgroundColor = '#007bff';
    prevButton.style.color = 'white';
    prevButton.style.border = 'none';
    prevButton.style.borderRadius = '4px';
    prevButton.style.cursor = 'pointer';
    prevButton.style.fontSize = '12px';
    prevButton.disabled = this.state.currentPage === 0;

    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${this.state.currentPage + 1} of ${this.state.totalPages}`;
    pageInfo.style.fontWeight = 'bold';
    pageInfo.style.color = 'white';
    pageInfo.style.fontSize = '13px';

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next ▶';
    nextButton.style.padding = '6px 12px';
    nextButton.style.backgroundColor = '#007bff';
    nextButton.style.color = 'white';
    nextButton.style.border = 'none';
    nextButton.style.borderRadius = '4px';
    nextButton.style.cursor = 'pointer';
    nextButton.style.fontSize = '12px';
    nextButton.disabled = this.state.currentPage === this.state.totalPages - 1;

    // Event listeners for navigation
    prevButton.addEventListener('click', () => this.goToPreviousPage());
    nextButton.addEventListener('click', () => this.goToNextPage());

    controlsContainer.appendChild(prevButton);
    controlsContainer.appendChild(pageInfo);
    controlsContainer.appendChild(nextButton);

    return controlsContainer;
  }

  /**
   * Navigate to previous page
   */
  private goToPreviousPage(): void {
    if (this.state.currentPage > 0) {
      this.state.currentPage--;
      this.refreshCurrentPage();
    }
  }

  /**
   * Navigate to next page
   */
  private goToNextPage(): void {
    if (this.state.currentPage < this.state.totalPages - 1) {
      this.state.currentPage++;
      this.refreshCurrentPage();
    }
  }

  /**
   * Refresh the current page display
   */
  private refreshCurrentPage(): void {
    // For now, this is a placeholder for multi-page TIFF support
    // In a full implementation, this would load and render the specific page
    console.log(`Showing page ${this.state.currentPage + 1} of ${this.state.totalPages}`);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.currentElement) {
      // Clean up canvas context
      if (this.state.canvas) {
        const ctx = this.state.canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, this.state.canvas.width, this.state.canvas.height);
        }
      }

      // Clean up image
      if (this.state.originalImage) {
        this.state.originalImage.onload = null;
        this.state.originalImage.onerror = null;
        // Revoke object URL if it was created
        if (this.state.originalImage.src.startsWith('blob:')) {
          URL.revokeObjectURL(this.state.originalImage.src);
        }
      }

      // Reset state
      this.state = {
        currentPage: 0,
        totalPages: 1,
        imageData: null,
        canvas: null,
        originalImage: null,
      };

      this.currentElement = undefined;
    }
  }

  /**
   * Apply styles to the container
   */
  private applyContainerStyles(container: HTMLElement, options: ViewerOptions): void {
    container.style.position = 'relative';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.minHeight = '400px'; // Ensure minimum height for positioning
    
    if (options.maxWidth) {
      container.style.maxWidth = `${options.maxWidth}px`;
    }
    
    if (options.maxHeight) {
      container.style.maxHeight = `${options.maxHeight}px`;
    }
  }

}
