/**
 * Configuration system exports
 * Provides comprehensive configuration management for the browser file viewer
 */

// Main configuration management
export {
  ConfigurationManager,
  getConfigManager,
  initializeConfigManager,
  resetConfigManager,
} from './ConfigurationManager';

// Configuration validation
export { ConfigValidator } from './ConfigValidator';

// Configuration presets
export { ConfigPresets, Themes } from './ConfigPresets';

// Configuration types
export type {
  BrowserFileViewerConfig,
  PartialConfig,
  DeepPartial,
  CoreConfig,
  ProcessingConfig,
  ImageProcessingConfig,
  RenderingConfig,
  UIConfig,
  PaginationConfig,
  FileInfoConfig,
  AccessibilityConfig,
  ThemeConfig,
  PerformanceConfig,
  StateConfig,
  ConfigError,
  ValidationResult,
  ConfigChangeListener,
  FileStats,
  Dimensions,
  PerformanceMode,
  CacheStrategy,
  RenderingEngine,
  FileType,
} from './ConfigTypes';
