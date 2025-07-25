/**
 * Comprehensive configuration types for Browser File Viewer
 * Type-safe, hierarchical configuration system
 */

import { Renderer } from '../renderers/Renderer';

/**
 * Supported file types enum
 */
export enum FileType {
  IMAGE = 'image',
  // Future extensions
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

/**
 * Performance modes for different use cases
 */
export type PerformanceMode = 'balanced' | 'quality' | 'speed';

/**
 * Cache strategies for memory management
 */
export type CacheStrategy = 'aggressive' | 'moderate' | 'minimal';

/**
 * Rendering engines
 */
export type RenderingEngine = 'canvas' | 'webgl' | 'svg';

/**
 * Theme configuration
 */
export interface ThemeConfig {
  name: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  errorColor: string;
  successColor: string;
}

/**
 * Accessibility configuration
 */
export interface AccessibilityConfig {
  enableScreenReader: boolean;
  highContrast: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  reducedMotion: boolean;
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  enabled: boolean;
  showPageNumbers: boolean;
  showControls: boolean;
  autoHide: boolean;
  position: 'top' | 'bottom' | 'both';
}

/**
 * File information display configuration
 */
export interface FileInfoConfig {
  enabled: boolean;
  showFileName: boolean;
  showFileSize: boolean;
  showFileType: boolean;
  showDimensions: boolean;
  showMetadata: boolean;
  position: 'overlay' | 'separate' | 'none';
}

/**
 * Image processing specific configuration
 */
export interface ImageProcessingConfig {
  maxResolution: { width: number; height: number };
  compressionQuality: number; // 0-1
  enableThumbnails: boolean;
  thumbnailSize: number;
  supportedFormats: string[];
  enableExifParsing: boolean;
}

/**
 * Dimensions interface
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Core system configuration
 */
export interface CoreConfig {
  maxFileSize: number; // bytes
  supportedFormats: FileType[];
  enableDebugMode: boolean;
  performanceMode: PerformanceMode;
  enableAnalytics: boolean;
}

/**
 * Processing configuration for different file types
 */
export interface ProcessingConfig {
  image: ImageProcessingConfig;
  // Future extensions
  // video: VideoProcessingConfig;
  // document: DocumentProcessingConfig;
}

/**
 * Rendering configuration
 */
export interface RenderingConfig {
  engine: RenderingEngine;
  maxDimensions: Dimensions;
  preserveAspectRatio: boolean;
  backgroundColor: string;
  antiAliasing: boolean;
  quality: number; // 0-1
  enableSmoothing: boolean;
  pixelRatio: number;
}

/**
 * UI/UX configuration
 */
export interface UIConfig {
  theme: ThemeConfig;
  pagination: PaginationConfig;
  fileInfo: FileInfoConfig;
  accessibility: AccessibilityConfig;
  animations: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
}

/**
 * Performance configuration
 */
export interface PerformanceConfig {
  preloadPages: number;
  memoryLimit: number; // bytes
  cacheStrategy: CacheStrategy;
  lazyLoading: boolean;
  enableWebWorkers: boolean;
  maxConcurrentTasks: number;
}

/**
 * State management configuration
 */
export interface StateConfig {
  historySize: number;
  enableTimeTravel: boolean;
  persistState: boolean;
  autoSave: boolean;
  debounceTime: number;
}

/**
 * Main configuration interface - hierarchical and comprehensive
 */
export interface BrowserFileViewerConfig {
  core: CoreConfig;
  processing: ProcessingConfig;
  rendering: RenderingConfig;
  ui: UIConfig;
  performance: PerformanceConfig;
  state: StateConfig;

  // Custom renderer override
  customRenderer?: Renderer;

  // Environment-specific overrides
  environment?: 'development' | 'production' | 'testing';
}

/**
 * Partial configuration for updates
 */
export type PartialConfig = DeepPartial<BrowserFileViewerConfig>;

/**
 * Deep partial utility type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Configuration validation error
 */
export interface ConfigError {
  path: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

/**
 * Configuration validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ConfigError[];
  warnings: ConfigError[];
}

/**
 * Configuration update result
 */
export interface ConfigUpdateResult {
  success: boolean;
  errors?: ConfigError[];
  previousValue?: any;
  newValue?: any;
}

/**
 * Configuration change listener
 */
export type ConfigChangeListener = (
  path: string,
  newValue: any,
  oldValue: any,
  config: BrowserFileViewerConfig
) => void;

/**
 * File statistics interface - exposed to library users
 */
export interface FileStats {
  // Basic file information
  name: string;
  size: number;
  type: string;
  lastModified?: Date;

  // Processing information
  processingTime?: number;
  totalPages?: number;
  currentPage?: number;

  // Image-specific stats
  dimensions?: Dimensions;
  colorDepth?: number;
  hasAlpha?: boolean;
  format?: string;
  compression?: string;

  // EXIF/Metadata (if available)
  metadata?: Record<string, any>;
  exif?: {
    camera?: string;
    lens?: string;
    focalLength?: string;
    aperture?: string;
    iso?: string;
    shutterSpeed?: string;
    dateTime?: Date;
    gps?: {
      latitude?: number;
      longitude?: number;
    };
  };

  // Performance metrics
  loadTime?: number;
  memoryUsage?: number;
  renderTime?: number;
}
