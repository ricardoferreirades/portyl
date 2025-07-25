/**
 * Configuration presets for common use cases
 * Provides ready-to-use configurations for different scenarios
 */

import {
  BrowserFileViewerConfig,
  ThemeConfig,
  PerformanceMode,
  CacheStrategy,
  FileType,
} from './ConfigTypes';

/**
 * Default theme configurations
 */
export class Themes {
  static readonly LIGHT: ThemeConfig = {
    name: 'light',
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    borderColor: '#e5e7eb',
    errorColor: '#ef4444',
    successColor: '#10b981',
  };

  static readonly DARK: ThemeConfig = {
    name: 'dark',
    primaryColor: '#60a5fa',
    backgroundColor: '#1f2937',
    textColor: '#f9fafb',
    borderColor: '#374151',
    errorColor: '#f87171',
    successColor: '#34d399',
  };

  static readonly HIGH_CONTRAST: ThemeConfig = {
    name: 'high-contrast',
    primaryColor: '#000000',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderColor: '#000000',
    errorColor: '#ff0000',
    successColor: '#008000',
  };
}

/**
 * Configuration presets for different environments and use cases
 */
export class ConfigPresets {
  /**
   * Default configuration - balanced for most use cases
   */
  static readonly DEFAULT: BrowserFileViewerConfig = {
    core: {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      supportedFormats: [FileType.IMAGE],
      enableDebugMode: false,
      performanceMode: 'balanced' as PerformanceMode,
      enableAnalytics: false,
    },
    processing: {
      image: {
        maxResolution: { width: 4096, height: 4096 },
        compressionQuality: 0.9,
        enableThumbnails: true,
        thumbnailSize: 200,
        supportedFormats: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/svg+xml',
          'image/bmp',
          'image/tiff',
          'image/tif',
        ],
        enableExifParsing: true,
      },
    },
    rendering: {
      engine: 'canvas' as const,
      maxDimensions: { width: 1920, height: 1080 },
      preserveAspectRatio: true,
      backgroundColor: 'transparent',
      antiAliasing: true,
      quality: 0.9,
      enableSmoothing: true,
      pixelRatio:
        (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1,
    },
    ui: {
      theme: Themes.LIGHT,
      pagination: {
        enabled: true,
        showPageNumbers: true,
        showControls: true,
        autoHide: false,
        position: 'bottom' as const,
      },
      fileInfo: {
        enabled: false, // Don't render in canvas - expose via API
        showFileName: true,
        showFileSize: true,
        showFileType: true,
        showDimensions: true,
        showMetadata: false,
        position: 'separate' as const,
      },
      accessibility: {
        enableScreenReader: true,
        highContrast: false,
        keyboardNavigation: true,
        focusIndicators: true,
        reducedMotion: false,
      },
      animations: {
        enabled: true,
        duration: 300,
        easing: 'ease-in-out',
      },
    },
    performance: {
      preloadPages: 2,
      memoryLimit: 512 * 1024 * 1024, // 512MB
      cacheStrategy: 'moderate' as CacheStrategy,
      lazyLoading: true,
      enableWebWorkers: true,
      maxConcurrentTasks: 4,
    },
    state: {
      historySize: 50,
      enableTimeTravel: false,
      persistState: false,
      autoSave: false,
      debounceTime: 300,
    },
    environment: 'production' as const,
  };

  /**
   * Mobile-optimized configuration
   */
  static readonly MOBILE: BrowserFileViewerConfig = {
    ...ConfigPresets.DEFAULT,
    core: {
      ...ConfigPresets.DEFAULT.core,
      performanceMode: 'speed' as PerformanceMode,
      maxFileSize: 50 * 1024 * 1024, // 50MB
    },
    processing: {
      ...ConfigPresets.DEFAULT.processing,
      image: {
        ...ConfigPresets.DEFAULT.processing.image,
        maxResolution: { width: 2048, height: 2048 },
        compressionQuality: 0.8,
        thumbnailSize: 150,
      },
    },
    rendering: {
      ...ConfigPresets.DEFAULT.rendering,
      maxDimensions: { width: 800, height: 600 },
      quality: 0.8,
      antiAliasing: false,
    },
    performance: {
      ...ConfigPresets.DEFAULT.performance,
      preloadPages: 1,
      memoryLimit: 256 * 1024 * 1024, // 256MB
      cacheStrategy: 'minimal' as CacheStrategy,
      enableWebWorkers: false,
      maxConcurrentTasks: 2,
    },
    ui: {
      ...ConfigPresets.DEFAULT.ui,
      animations: {
        enabled: false,
        duration: 0,
        easing: 'none',
      },
      accessibility: {
        ...ConfigPresets.DEFAULT.ui.accessibility,
        reducedMotion: true,
      },
    },
  };

  /**
   * Desktop high-performance configuration
   */
  static readonly DESKTOP_HQ: BrowserFileViewerConfig = {
    ...ConfigPresets.DEFAULT,
    core: {
      ...ConfigPresets.DEFAULT.core,
      performanceMode: 'quality' as PerformanceMode,
      maxFileSize: 500 * 1024 * 1024, // 500MB
    },
    processing: {
      ...ConfigPresets.DEFAULT.processing,
      image: {
        ...ConfigPresets.DEFAULT.processing.image,
        maxResolution: { width: 8192, height: 8192 },
        compressionQuality: 1.0,
        thumbnailSize: 300,
      },
    },
    rendering: {
      ...ConfigPresets.DEFAULT.rendering,
      engine: 'webgl' as const,
      maxDimensions: { width: 3840, height: 2160 }, // 4K
      quality: 1.0,
      antiAliasing: true,
      enableSmoothing: true,
    },
    performance: {
      ...ConfigPresets.DEFAULT.performance,
      preloadPages: 5,
      memoryLimit: 2 * 1024 * 1024 * 1024, // 2GB
      cacheStrategy: 'aggressive' as CacheStrategy,
      enableWebWorkers: true,
      maxConcurrentTasks: 8,
    },
  };

  /**
   * Development configuration with debugging enabled
   */
  static readonly DEVELOPMENT: BrowserFileViewerConfig = {
    ...ConfigPresets.DEFAULT,
    core: {
      ...ConfigPresets.DEFAULT.core,
      enableDebugMode: true,
      enableAnalytics: true,
    },
    state: {
      ...ConfigPresets.DEFAULT.state,
      enableTimeTravel: true,
      historySize: 100,
      persistState: true,
    },
    environment: 'development' as const,
  };

  /**
   * Performance-focused configuration for low-end devices
   */
  static readonly PERFORMANCE: BrowserFileViewerConfig = {
    ...ConfigPresets.DEFAULT,
    core: {
      ...ConfigPresets.DEFAULT.core,
      performanceMode: 'speed' as PerformanceMode,
      maxFileSize: 25 * 1024 * 1024, // 25MB
    },
    processing: {
      ...ConfigPresets.DEFAULT.processing,
      image: {
        ...ConfigPresets.DEFAULT.processing.image,
        maxResolution: { width: 1024, height: 1024 },
        compressionQuality: 0.7,
        enableThumbnails: false,
        enableExifParsing: false,
      },
    },
    rendering: {
      ...ConfigPresets.DEFAULT.rendering,
      maxDimensions: { width: 800, height: 600 },
      quality: 0.7,
      antiAliasing: false,
      enableSmoothing: false,
    },
    performance: {
      ...ConfigPresets.DEFAULT.performance,
      preloadPages: 0,
      memoryLimit: 128 * 1024 * 1024, // 128MB
      cacheStrategy: 'minimal' as CacheStrategy,
      lazyLoading: true,
      enableWebWorkers: false,
      maxConcurrentTasks: 1,
    },
    ui: {
      ...ConfigPresets.DEFAULT.ui,
      animations: {
        enabled: false,
        duration: 0,
        easing: 'none',
      },
    },
  };

  /**
   * Accessibility-first configuration
   */
  static readonly ACCESSIBILITY: BrowserFileViewerConfig = {
    ...ConfigPresets.DEFAULT,
    ui: {
      ...ConfigPresets.DEFAULT.ui,
      theme: Themes.HIGH_CONTRAST,
      accessibility: {
        enableScreenReader: true,
        highContrast: true,
        keyboardNavigation: true,
        focusIndicators: true,
        reducedMotion: true,
      },
      animations: {
        enabled: false,
        duration: 0,
        easing: 'none',
      },
      pagination: {
        ...ConfigPresets.DEFAULT.ui.pagination,
        showPageNumbers: true,
        showControls: true,
      },
    },
  };

  /**
   * Gallery/portfolio configuration for image showcase
   */
  static readonly GALLERY: BrowserFileViewerConfig = {
    ...ConfigPresets.DESKTOP_HQ,
    ui: {
      ...ConfigPresets.DESKTOP_HQ.ui,
      fileInfo: {
        enabled: false, // User handles file info display
        showFileName: true,
        showFileSize: false,
        showFileType: false,
        showDimensions: true,
        showMetadata: true,
        position: 'separate' as const,
      },
      pagination: {
        enabled: true,
        showPageNumbers: false,
        showControls: true,
        autoHide: true,
        position: 'bottom' as const,
      },
    },
    processing: {
      ...ConfigPresets.DESKTOP_HQ.processing,
      image: {
        ...ConfigPresets.DESKTOP_HQ.processing.image,
        enableThumbnails: true,
        thumbnailSize: 400,
        enableExifParsing: true,
      },
    },
  };

  /**
   * Server-side/headless configuration
   */
  static readonly HEADLESS: BrowserFileViewerConfig = {
    ...ConfigPresets.DEFAULT,
    rendering: {
      ...ConfigPresets.DEFAULT.rendering,
      engine: 'canvas' as const, // Use OffscreenCanvas in server environments
      maxDimensions: { width: 2048, height: 2048 },
      backgroundColor: 'transparent',
    },
    ui: {
      ...ConfigPresets.DEFAULT.ui,
      fileInfo: {
        enabled: false,
        showFileName: false,
        showFileSize: false,
        showFileType: false,
        showDimensions: false,
        showMetadata: false,
        position: 'none' as const,
      },
      pagination: {
        enabled: false,
        showPageNumbers: false,
        showControls: false,
        autoHide: true,
        position: 'bottom' as const,
      },
      animations: {
        enabled: false,
        duration: 0,
        easing: 'none',
      },
    },
    performance: {
      ...ConfigPresets.DEFAULT.performance,
      enableWebWorkers: false, // May not be available in server environments
      lazyLoading: false,
    },
  };

  /**
   * Get configuration by preset name
   */
  static getPreset(name: string): BrowserFileViewerConfig | null {
    const presets: Record<string, BrowserFileViewerConfig> = {
      default: ConfigPresets.DEFAULT,
      mobile: ConfigPresets.MOBILE,
      'desktop-hq': ConfigPresets.DESKTOP_HQ,
      development: ConfigPresets.DEVELOPMENT,
      performance: ConfigPresets.PERFORMANCE,
      accessibility: ConfigPresets.ACCESSIBILITY,
      gallery: ConfigPresets.GALLERY,
      headless: ConfigPresets.HEADLESS,
    };

    return presets[name] || null;
  }

  /**
   * Get all available preset names
   */
  static getAvailablePresets(): string[] {
    return [
      'default',
      'mobile',
      'desktop-hq',
      'development',
      'performance',
      'accessibility',
      'gallery',
      'headless',
    ];
  }
}
