/**
 * Supported file types for the browser file viewer
 */
export enum FileType {
  IMAGE = 'image',
  // Future: VIDEO, AUDIO, DOCUMENT, etc.
}

/**
 * Viewer configuration options
 */
export interface ViewerOptions {
  /** Container element to render the file in */
  container: HTMLElement;
  /** Maximum width for the viewer */
  maxWidth?: number;
  /** Maximum height for the viewer */
  maxHeight?: number;
  /** Whether to show file information */
  showFileInfo?: boolean;
  /** Custom CSS classes to apply */
  className?: string;
}

/**
 * File information interface
 */
export interface FileInfo {
  /** File name */
  name: string;
  /** File size in bytes */
  size: number;
  /** File type */
  type: string;
  /** Last modified date */
  lastModified?: Date;
}

/**
 * Viewer result interface
 */
export interface ViewerResult {
  /** Whether the file was successfully rendered */
  success: boolean;
  /** Error message if rendering failed */
  error?: string;
  /** The created viewer element */
  element?: HTMLElement;
}

/**
 * Base interface for file viewers
 */
export interface FileViewer {
  /** Check if this viewer can handle the given file */
  canHandle(file: File): boolean;
  /** Render the file in the provided container */
  render(file: File, options: ViewerOptions): Promise<ViewerResult>;
  /** Clean up resources */
  destroy?(): void;
}
