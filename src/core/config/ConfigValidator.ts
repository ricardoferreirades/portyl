/**
 * Configuration validation system
 * Provides comprehensive validation for all configuration options
 */

import {
  PartialConfig,
  ConfigError,
  ValidationResult,
  PerformanceMode,
  CacheStrategy,
  RenderingEngine,
  FileType,
} from './ConfigTypes';

/**
 * Configuration validator with comprehensive validation rules
 */
export class ConfigValidator {
  private static readonly MIN_MEMORY_LIMIT = 64 * 1024 * 1024; // 64MB
  private static readonly MAX_MEMORY_LIMIT = 8 * 1024 * 1024 * 1024; // 8GB
  private static readonly MIN_FILE_SIZE = 1024; // 1KB
  private static readonly MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
  private static readonly MIN_DIMENSION = 1;
  private static readonly MAX_DIMENSION = 16384; // 16K resolution

  /**
   * Validate complete configuration
   */
  static validate(config: PartialConfig): ValidationResult {
    const errors: ConfigError[] = [];
    const warnings: ConfigError[] = [];

    try {
      // Validate core configuration
      if (config.core) {
        errors.push(...this.validateCore(config.core));
      }

      // Validate processing configuration
      if (config.processing) {
        errors.push(...this.validateProcessing(config.processing));
      }

      // Validate rendering configuration
      if (config.rendering) {
        errors.push(...this.validateRendering(config.rendering));
      }

      // Validate UI configuration
      if (config.ui) {
        errors.push(...this.validateUI(config.ui));
      }

      // Validate performance configuration
      if (config.performance) {
        const perfValidation = this.validatePerformance(config.performance);
        errors.push(...perfValidation.errors);
        warnings.push(...perfValidation.warnings);
      }

      // Validate state configuration
      if (config.state) {
        errors.push(...this.validateState(config.state));
      }

      // Cross-validation checks
      errors.push(...this.validateCrossReferences(config));
    } catch (error) {
      errors.push({
        path: 'root',
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'VALIDATION_ERROR',
        severity: 'error',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate a single configuration change
   */
  static validateChange(path: string, value: any): ValidationResult {
    const errors: ConfigError[] = [];

    try {
      const pathParts = path.split('.');
      const section = pathParts[0];
      const property = pathParts.slice(1).join('.');

      switch (section) {
        case 'core':
          errors.push(...this.validateCoreProperty(property, value));
          break;
        case 'processing':
          errors.push(...this.validateProcessingProperty(property, value));
          break;
        case 'rendering':
          errors.push(...this.validateRenderingProperty(property, value));
          break;
        case 'ui':
          errors.push(...this.validateUIProperty(property, value));
          break;
        case 'performance':
          errors.push(...this.validatePerformanceProperty(property, value));
          break;
        case 'state':
          errors.push(...this.validateStateProperty(property, value));
          break;
        default:
          errors.push({
            path,
            message: `Unknown configuration section: ${section}`,
            code: 'UNKNOWN_SECTION',
            severity: 'error',
          });
      }
    } catch (error) {
      errors.push({
        path,
        message: `Change validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'CHANGE_VALIDATION_ERROR',
        severity: 'error',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  private static validateCore(core: any): ConfigError[] {
    const errors: ConfigError[] = [];

    if (core.maxFileSize !== undefined) {
      if (typeof core.maxFileSize !== 'number' || core.maxFileSize <= 0) {
        errors.push({
          path: 'core.maxFileSize',
          message: 'Must be a positive number',
          code: 'INVALID_FILE_SIZE',
          severity: 'error',
        });
      } else if (core.maxFileSize < this.MIN_FILE_SIZE) {
        errors.push({
          path: 'core.maxFileSize',
          message: `Minimum file size is ${this.MIN_FILE_SIZE} bytes`,
          code: 'FILE_SIZE_TOO_SMALL',
          severity: 'error',
        });
      } else if (core.maxFileSize > this.MAX_FILE_SIZE) {
        errors.push({
          path: 'core.maxFileSize',
          message: `Maximum file size is ${this.MAX_FILE_SIZE} bytes`,
          code: 'FILE_SIZE_TOO_LARGE',
          severity: 'error',
        });
      }
    }

    if (core.supportedFormats !== undefined) {
      if (!Array.isArray(core.supportedFormats)) {
        errors.push({
          path: 'core.supportedFormats',
          message: 'Must be an array',
          code: 'INVALID_SUPPORTED_FORMATS',
          severity: 'error',
        });
      } else if (core.supportedFormats.length === 0) {
        errors.push({
          path: 'core.supportedFormats',
          message: 'Must include at least one format',
          code: 'EMPTY_SUPPORTED_FORMATS',
          severity: 'error',
        });
      } else {
        const validFormats = Object.values(FileType);
        core.supportedFormats.forEach((format: any, index: number) => {
          if (format !== undefined && !validFormats.includes(format)) {
            errors.push({
              path: `core.supportedFormats[${index}]`,
              message: `Invalid format: ${format}. Valid formats: ${validFormats.join(', ')}`,
              code: 'INVALID_FILE_FORMAT',
              severity: 'error',
            });
          }
        });
      }
    }

    if (core.performanceMode !== undefined) {
      const validModes: PerformanceMode[] = ['balanced', 'quality', 'speed'];
      if (!validModes.includes(core.performanceMode)) {
        errors.push({
          path: 'core.performanceMode',
          message: `Invalid performance mode. Valid modes: ${validModes.join(', ')}`,
          code: 'INVALID_PERFORMANCE_MODE',
          severity: 'error',
        });
      }
    }

    return errors;
  }

  private static validateProcessing(processing: any): ConfigError[] {
    const errors: ConfigError[] = [];

    if (processing.image) {
      const image = processing.image;

      if (image.maxResolution) {
        errors.push(
          ...this.validateDimensions(
            'processing.image.maxResolution',
            image.maxResolution
          )
        );
      }

      if (image.compressionQuality !== undefined) {
        if (
          typeof image.compressionQuality !== 'number' ||
          image.compressionQuality < 0 ||
          image.compressionQuality > 1
        ) {
          errors.push({
            path: 'processing.image.compressionQuality',
            message: 'Must be a number between 0 and 1',
            code: 'INVALID_COMPRESSION_QUALITY',
            severity: 'error',
          });
        }
      }

      if (image.thumbnailSize !== undefined) {
        if (
          typeof image.thumbnailSize !== 'number' ||
          image.thumbnailSize <= 0
        ) {
          errors.push({
            path: 'processing.image.thumbnailSize',
            message: 'Must be a positive number',
            code: 'INVALID_THUMBNAIL_SIZE',
            severity: 'error',
          });
        }
      }
    }

    return errors;
  }

  private static validateRendering(rendering: any): ConfigError[] {
    const errors: ConfigError[] = [];

    if (rendering.engine !== undefined) {
      const validEngines: RenderingEngine[] = ['canvas', 'webgl', 'svg'];
      if (!validEngines.includes(rendering.engine)) {
        errors.push({
          path: 'rendering.engine',
          message: `Invalid rendering engine. Valid engines: ${validEngines.join(', ')}`,
          code: 'INVALID_RENDERING_ENGINE',
          severity: 'error',
        });
      }
    }

    if (rendering.maxDimensions) {
      errors.push(
        ...this.validateDimensions(
          'rendering.maxDimensions',
          rendering.maxDimensions
        )
      );
    }

    if (rendering.quality !== undefined) {
      if (
        typeof rendering.quality !== 'number' ||
        rendering.quality < 0 ||
        rendering.quality > 1
      ) {
        errors.push({
          path: 'rendering.quality',
          message: 'Must be a number between 0 and 1',
          code: 'INVALID_RENDERING_QUALITY',
          severity: 'error',
        });
      }
    }

    if (rendering.pixelRatio !== undefined) {
      if (
        typeof rendering.pixelRatio !== 'number' ||
        rendering.pixelRatio <= 0
      ) {
        errors.push({
          path: 'rendering.pixelRatio',
          message: 'Must be a positive number',
          code: 'INVALID_PIXEL_RATIO',
          severity: 'error',
        });
      }
    }

    return errors;
  }

  private static validateUI(ui: any): ConfigError[] {
    const errors: ConfigError[] = [];

    if (ui.pagination) {
      const pagination = ui.pagination;
      if (pagination.position !== undefined) {
        const validPositions = ['top', 'bottom', 'both'];
        if (!validPositions.includes(pagination.position)) {
          errors.push({
            path: 'ui.pagination.position',
            message: `Invalid position. Valid positions: ${validPositions.join(', ')}`,
            code: 'INVALID_PAGINATION_POSITION',
            severity: 'error',
          });
        }
      }
    }

    if (ui.fileInfo) {
      const fileInfo = ui.fileInfo;
      if (fileInfo.position !== undefined) {
        const validPositions = ['overlay', 'separate', 'none'];
        if (!validPositions.includes(fileInfo.position)) {
          errors.push({
            path: 'ui.fileInfo.position',
            message: `Invalid position. Valid positions: ${validPositions.join(', ')}`,
            code: 'INVALID_FILEINFO_POSITION',
            severity: 'error',
          });
        }
      }
    }

    if (ui.animations) {
      const animations = ui.animations;
      if (animations.duration !== undefined) {
        if (
          typeof animations.duration !== 'number' ||
          animations.duration < 0
        ) {
          errors.push({
            path: 'ui.animations.duration',
            message: 'Must be a non-negative number',
            code: 'INVALID_ANIMATION_DURATION',
            severity: 'error',
          });
        }
      }
    }

    return errors;
  }

  private static validatePerformance(performance: any): {
    errors: ConfigError[];
    warnings: ConfigError[];
  } {
    const errors: ConfigError[] = [];
    const warnings: ConfigError[] = [];

    if (performance.memoryLimit !== undefined) {
      if (
        typeof performance.memoryLimit !== 'number' ||
        performance.memoryLimit <= 0
      ) {
        errors.push({
          path: 'performance.memoryLimit',
          message: 'Must be a positive number',
          code: 'INVALID_MEMORY_LIMIT',
          severity: 'error',
        });
      } else if (performance.memoryLimit < this.MIN_MEMORY_LIMIT) {
        warnings.push({
          path: 'performance.memoryLimit',
          message: `Memory limit is very low (${performance.memoryLimit} bytes). Minimum recommended: ${this.MIN_MEMORY_LIMIT} bytes`,
          code: 'LOW_MEMORY_LIMIT',
          severity: 'warning',
        });
      } else if (performance.memoryLimit > this.MAX_MEMORY_LIMIT) {
        warnings.push({
          path: 'performance.memoryLimit',
          message: `Memory limit is very high (${performance.memoryLimit} bytes). This may cause issues on some devices`,
          code: 'HIGH_MEMORY_LIMIT',
          severity: 'warning',
        });
      }
    }

    if (performance.preloadPages !== undefined) {
      if (
        typeof performance.preloadPages !== 'number' ||
        performance.preloadPages < 0
      ) {
        errors.push({
          path: 'performance.preloadPages',
          message: 'Must be a non-negative number',
          code: 'INVALID_PRELOAD_PAGES',
          severity: 'error',
        });
      } else if (performance.preloadPages > 10) {
        warnings.push({
          path: 'performance.preloadPages',
          message: 'High preload count may impact memory usage',
          code: 'HIGH_PRELOAD_PAGES',
          severity: 'warning',
        });
      }
    }

    if (performance.cacheStrategy !== undefined) {
      const validStrategies: CacheStrategy[] = [
        'aggressive',
        'moderate',
        'minimal',
      ];
      if (!validStrategies.includes(performance.cacheStrategy)) {
        errors.push({
          path: 'performance.cacheStrategy',
          message: `Invalid cache strategy. Valid strategies: ${validStrategies.join(', ')}`,
          code: 'INVALID_CACHE_STRATEGY',
          severity: 'error',
        });
      }
    }

    if (performance.maxConcurrentTasks !== undefined) {
      if (
        typeof performance.maxConcurrentTasks !== 'number' ||
        performance.maxConcurrentTasks <= 0
      ) {
        errors.push({
          path: 'performance.maxConcurrentTasks',
          message: 'Must be a positive number',
          code: 'INVALID_CONCURRENT_TASKS',
          severity: 'error',
        });
      } else if (performance.maxConcurrentTasks > 16) {
        warnings.push({
          path: 'performance.maxConcurrentTasks',
          message: 'High concurrent task count may impact performance',
          code: 'HIGH_CONCURRENT_TASKS',
          severity: 'warning',
        });
      }
    }

    return { errors, warnings };
  }

  private static validateState(state: any): ConfigError[] {
    const errors: ConfigError[] = [];

    if (state.historySize !== undefined) {
      if (typeof state.historySize !== 'number' || state.historySize < 0) {
        errors.push({
          path: 'state.historySize',
          message: 'Must be a non-negative number',
          code: 'INVALID_HISTORY_SIZE',
          severity: 'error',
        });
      }
    }

    if (state.debounceTime !== undefined) {
      if (typeof state.debounceTime !== 'number' || state.debounceTime < 0) {
        errors.push({
          path: 'state.debounceTime',
          message: 'Must be a non-negative number',
          code: 'INVALID_DEBOUNCE_TIME',
          severity: 'error',
        });
      }
    }

    return errors;
  }

  private static validateDimensions(
    path: string,
    dimensions: any
  ): ConfigError[] {
    const errors: ConfigError[] = [];

    if (dimensions.width !== undefined) {
      if (
        typeof dimensions.width !== 'number' ||
        dimensions.width < this.MIN_DIMENSION ||
        dimensions.width > this.MAX_DIMENSION
      ) {
        errors.push({
          path: `${path}.width`,
          message: `Width must be between ${this.MIN_DIMENSION} and ${this.MAX_DIMENSION}`,
          code: 'INVALID_DIMENSION',
          severity: 'error',
        });
      }
    }

    if (dimensions.height !== undefined) {
      if (
        typeof dimensions.height !== 'number' ||
        dimensions.height < this.MIN_DIMENSION ||
        dimensions.height > this.MAX_DIMENSION
      ) {
        errors.push({
          path: `${path}.height`,
          message: `Height must be between ${this.MIN_DIMENSION} and ${this.MAX_DIMENSION}`,
          code: 'INVALID_DIMENSION',
          severity: 'error',
        });
      }
    }

    return errors;
  }

  private static validateCrossReferences(config: PartialConfig): ConfigError[] {
    const errors: ConfigError[] = [];

    // Validate rendering dimensions vs processing dimensions
    if (
      config.rendering?.maxDimensions &&
      config.processing?.image?.maxResolution
    ) {
      const renderDims = config.rendering.maxDimensions;
      const processDims = config.processing.image.maxResolution;

      if (
        renderDims.width !== undefined &&
        processDims.width !== undefined &&
        renderDims.height !== undefined &&
        processDims.height !== undefined
      ) {
        if (
          renderDims.width > processDims.width ||
          renderDims.height > processDims.height
        ) {
          errors.push({
            path: 'rendering.maxDimensions',
            message:
              'Rendering dimensions should not exceed processing resolution',
            code: 'DIMENSION_MISMATCH',
            severity: 'warning',
          });
        }
      }
    }

    // Validate memory limits vs file sizes
    if (config.performance?.memoryLimit && config.core?.maxFileSize) {
      if (config.performance.memoryLimit < config.core.maxFileSize * 2) {
        errors.push({
          path: 'performance.memoryLimit',
          message: 'Memory limit should be at least 2x the maximum file size',
          code: 'INSUFFICIENT_MEMORY',
          severity: 'warning',
        });
      }
    }

    return errors;
  }

  // Individual property validation methods
  private static validateCoreProperty(
    property: string,
    value: any
  ): ConfigError[] {
    return this.validateCore({ [property]: value } as any);
  }

  private static validateProcessingProperty(
    property: string,
    value: any
  ): ConfigError[] {
    return this.validateProcessing({ [property]: value } as any);
  }

  private static validateRenderingProperty(
    property: string,
    value: any
  ): ConfigError[] {
    return this.validateRendering({ [property]: value } as any);
  }

  private static validateUIProperty(
    property: string,
    value: any
  ): ConfigError[] {
    return this.validateUI({ [property]: value } as any);
  }

  private static validatePerformanceProperty(
    property: string,
    value: any
  ): ConfigError[] {
    const result = this.validatePerformance({ [property]: value } as any);
    return [...result.errors, ...result.warnings];
  }

  private static validateStateProperty(
    property: string,
    value: any
  ): ConfigError[] {
    return this.validateState({ [property]: value } as any);
  }
}
