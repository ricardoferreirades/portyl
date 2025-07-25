import { ViewerConfig, LoadResult, RenderResult, FileInfo } from './types';
import { FileUtils } from './utils';
import { FileProcessor, ProcessorState, ImagePage } from './core/processors/FileProcessor';
import { ImageProcessor } from './core/processors/ImageProcessor';
import { Renderer, RenderOptions, RenderTarget } from './core/renderers/Renderer';
import { CanvasRenderer } from './core/renderers/CanvasRenderer';

/**
 * Main browser file viewer class - Framework agnostic, pure data processing
 * Breaking changes: New API focused on data processing with optional rendering
 */
export class BrowserFileViewer extends EventTarget {
  private processor?: FileProcessor;
  private config: ViewerConfig;
  private defaultRenderer: Renderer;

  constructor(config: ViewerConfig = {}) {
    super();
    this.config = {
      maxDimensions: { width: 1920, height: 1080 },
      showFileInfo: false,
      enablePagination: true,
      preloadPages: 1,
      preserveAspectRatio: true,
      backgroundColor: 'transparent',
      ...config
    };
    
    // Create default renderer
    this.defaultRenderer = config.renderer || new CanvasRenderer();
    
    // Set up processor event forwarding
    this.setupEventForwarding();
  }

  /**
   * Check if a file can be processed
   */
  canHandle(file: File): boolean {
    const processor = this.createProcessor(file);
    return processor ? processor.canHandle(file) : false;
  }

  /**
   * Load and process a file (pure data processing, no rendering)
   */
  async loadFile(file: File): Promise<LoadResult> {
    try {
      // Clean up previous processor
      this.destroy();

      // Validate file
      if (!file) {
        throw new Error('File is required');
      }

      // Get appropriate processor
      const processor = this.createProcessor(file);
      if (!processor) {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      this.processor = processor;

      // Set up event forwarding for this processor
      this.setupProcessorEvents(this.processor);

      // Load the file
      await this.processor.loadFile(file);

      const state = this.processor.getState();
      const fileInfo = FileUtils.getFileInfo(file);

      return {
        success: true,
        pageCount: state.totalPages,
        fileInfo
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Dispatch error event
      this.dispatchEvent(new CustomEvent('error', { 
        detail: { error: errorMessage } 
      }));

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get current processor state
   */
  getState(): ProcessorState | null {
    return this.processor?.getState() || null;
  }

  /**
   * Get all pages
   */
  getPages(): ImagePage[] {
    return this.processor?.getPages() || [];
  }

  /**
   * Get current page
   */
  getCurrentPage(): ImagePage | null {
    return this.processor?.getCurrentPage() || null;
  }

  /**
   * Navigate to specific page (0-based index)
   */
  async navigateToPage(index: number): Promise<void> {
    if (!this.processor) {
      throw new Error('No file loaded');
    }
    await this.processor.navigateToPage(index);
  }

  /**
   * Navigate to next page
   */
  async nextPage(): Promise<void> {
    if (!this.processor) {
      throw new Error('No file loaded');
    }
    await this.processor.nextPage();
  }

  /**
   * Navigate to previous page
   */
  async previousPage(): Promise<void> {
    if (!this.processor) {
      throw new Error('No file loaded');
    }
    await this.processor.previousPage();
  }

  /**
   * Jump to specific page (1-based index for UI)
   */
  async jumpToPage(pageNumber: number): Promise<void> {
    await this.navigateToPage(pageNumber - 1); // Convert to 0-based
  }

  /**
   * Get pagination information
   */
  getPaginationInfo(): { currentPage: number; totalPages: number; canGoNext: boolean; canGoPrevious: boolean } | null {
    return this.processor?.getPaginationInfo() || null;
  }

  /**
   * Render current page to a target (optional rendering)
   */
  async renderToTarget<T extends RenderTarget>(
    target: T, 
    options?: RenderOptions,
    renderer?: Renderer
  ): Promise<RenderResult> {
    try {
      const currentPage = this.getCurrentPage();
      if (!currentPage) {
        throw new Error('No page to render');
      }

      const activeRenderer = renderer || this.defaultRenderer;
      const renderOptions: RenderOptions = {
        maxWidth: this.config.maxDimensions?.width,
        maxHeight: this.config.maxDimensions?.height,
        showFileInfo: this.config.showFileInfo,
        preserveAspectRatio: this.config.preserveAspectRatio,
        backgroundColor: this.config.backgroundColor,
        ...options
      };

      await activeRenderer.render(currentPage, target, renderOptions);

      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown rendering error';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get supported file types
   */
  getSupportedTypes(): string[] {
    return [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/tiff',
      'image/tif'
    ];
  }

  /**
   * Get file information (utility method)
   */
  getFileInfo(file: File): FileInfo {
    return FileUtils.getFileInfo(file);
  }

  /**
   * Format file size (utility method)
   */
  formatFileSize(bytes: number): string {
    return FileUtils.formatFileSize(bytes);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ViewerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.renderer) {
      this.defaultRenderer = newConfig.renderer;
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.processor) {
      this.processor.destroy();
      this.processor = undefined;
    }
  }

  /**
   * Create appropriate processor for file type
   */
  private createProcessor(file: File): FileProcessor | null {
    if (file.type.startsWith('image/') || this.isTiffFile(file)) {
      return new ImageProcessor();
    }
    
    // Future: Add other processors
    // if (file.type.startsWith('video/')) return new VideoProcessor();
    // if (file.type === 'application/pdf') return new PDFProcessor();
    
    return null;
  }

  /**
   * Set up event forwarding from processor to main viewer
   */
  private setupEventForwarding(): void {
    // This will be called for each new processor
  }

  /**
   * Set up events for specific processor instance
   */
  private setupProcessorEvents(processor: FileProcessor): void {
    // Set up the processor to forward events to our EventTarget
    processor.setEventTarget(this);
    
    // Also subscribe to state changes for additional handling
    processor.subscribe((current, previous) => {
      // Additional custom logic can be added here if needed
      // The processor already forwards events via setEventTarget
    });
  }

  /**
   * Check if file is TIFF
   */
  private isTiffFile(file: File): boolean {
    return file.type === 'image/tiff' || 
           file.type === 'image/tif' || 
           file.name.toLowerCase().endsWith('.tiff') || 
           file.name.toLowerCase().endsWith('.tif');
  }

  /**
   * Create a new instance with configuration
   */
  static create(config?: ViewerConfig): BrowserFileViewer {
    return new BrowserFileViewer(config);
  }
}
