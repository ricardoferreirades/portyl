import { FileViewer, ViewerOptions, ViewerResult, FileType } from './types';
import { FileUtils } from './utils';
import { ImageViewer } from './viewers/ImageViewer';

/**
 * Main browser file viewer class
 */
export class BrowserFileViewer extends EventTarget {
  private viewers: Map<FileType, FileViewer>;
  private currentViewer?: FileViewer;

  constructor() {
    super();
    this.viewers = new Map();
    this.initializeViewers();
  }

  /**
   * Initialize all available file viewers
   */
  private initializeViewers(): void {
    // Register image viewer
    this.viewers.set(FileType.IMAGE, new ImageViewer(this));
    
    // Future: Register other viewers
    // this.viewers.set(FileType.VIDEO, new VideoViewer());
    // this.viewers.set(FileType.AUDIO, new AudioViewer());
  }

  /**
   * Check if a file can be viewed
   */
  canView(file: File): boolean {
    const fileType = FileUtils.getFileType(file);
    if (!fileType) return false;

    const viewer = this.viewers.get(fileType);
    return viewer ? viewer.canHandle(file) : false;
  }

  /**
   * View a file in the specified container
   */
  async view(file: File, options: ViewerOptions): Promise<ViewerResult> {
    try {
      // Clean up previous viewer
      this.destroy();

      // Validate inputs
      if (!file) {
        throw new Error('File is required');
      }

      if (!options.container) {
        throw new Error('Container element is required');
      }

      // Check if file can be viewed
      if (!this.canView(file)) {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      // Get the appropriate viewer
      const fileType = FileUtils.getFileType(file)!;
      const viewer = this.viewers.get(fileType)!;

      // Render the file
      const result = await viewer.render(file, options);
      
      if (result.success) {
        this.currentViewer = viewer;
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get supported file types
   */
  getSupportedTypes(): string[] {
    const supportedTypes: string[] = [];
    
    // Add image types
    if (this.viewers.has(FileType.IMAGE)) {
      supportedTypes.push(
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'image/bmp',
        'image/tiff',
        'image/tif'
      );
    }

    return supportedTypes;
  }

  /**
   * Get file information
   */
  getFileInfo(file: File) {
    return FileUtils.getFileInfo(file);
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    return FileUtils.formatFileSize(bytes);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.currentViewer && this.currentViewer.destroy) {
      this.currentViewer.destroy();
    }
    this.currentViewer = undefined;
  }

  /**
   * Create a new instance with default options
   */
  static create(): BrowserFileViewer {
    return new BrowserFileViewer();
  }
}
