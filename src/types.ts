import { FileProcessor } from './core/processors/FileProcessor';
import { Renderer } from './core/renderers/Renderer';

/**
 * Supported file types for the browser file viewer
 */
export enum FileType {
  IMAGE = 'image',
  // Future: VIDEO, AUDIO, DOCUMENT, etc.
}

/**
 * New viewer configuration options (replaces ViewerOptions)
 */
export interface ViewerConfig {
  /** Maximum dimensions for rendering */
  maxDimensions?: { width: number; height: number };
  /** Whether to show file information overlay */
  showFileInfo?: boolean;
  /** Enable pagination for multi-page files */
  enablePagination?: boolean;
  /** Number of pages to preload */
  preloadPages?: number;
  /** Custom renderer implementation */
  renderer?: Renderer;
  /** Background color for rendering */
  backgroundColor?: string;
  /** Preserve aspect ratio when rendering */
  preserveAspectRatio?: boolean;
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
 * Load result for the new API
 */
export interface LoadResult {
  /** Whether the file was successfully loaded */
  success: boolean;
  /** Error message if loading failed */
  error?: string;
  /** Number of pages loaded */
  pageCount?: number;
  /** File information */
  fileInfo?: FileInfo;
}

/**
 * Render result for optional rendering
 */
export interface RenderResult {
  /** Whether rendering was successful */
  success: boolean;
  /** Error message if rendering failed */
  error?: string;
  /** The rendered element (if applicable) */
  element?: HTMLElement;
}

// Legacy interfaces (deprecated but kept for migration period)
/**
 * @deprecated Use ViewerConfig instead
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
 * @deprecated Use LoadResult instead
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
 * @deprecated Will be removed - processors are internal
 */
export interface FileViewer {
  /** Check if this viewer can handle the given file */
  canHandle(file: File): boolean;
  /** Render the file in the provided container */
  render(file: File, options: ViewerOptions): Promise<ViewerResult>;
  /** Clean up resources */
  destroy?(): void;
}
