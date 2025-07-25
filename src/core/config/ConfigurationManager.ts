/**
 * Configuration management system
 * Handles runtime configuration with validation, change detection, and event notifications
 */

import {
  BrowserFileViewerConfig,
  PartialConfig,
  ValidationResult,
  ConfigChangeListener,
} from './ConfigTypes';
import { ConfigValidator } from './ConfigValidator';
import { ConfigPresets } from './ConfigPresets';

/**
 * Central configuration manager with immutable state and event system
 */
export class ConfigurationManager {
  private _config: BrowserFileViewerConfig;
  private readonly _listeners: Map<string, ConfigChangeListener> = new Map();
  private readonly _history: BrowserFileViewerConfig[] = [];
  private readonly _maxHistorySize: number = 50;

  constructor(initialConfig?: PartialConfig) {
    // Start with default configuration
    this._config = this.createDefaultConfig();

    // Apply initial configuration if provided
    if (initialConfig) {
      const result = this.updateConfig(initialConfig);
      if (!result.isValid) {
        throw new Error(
          `Invalid initial configuration: ${result.errors.map((e) => e.message).join(', ')}`
        );
      }
    }
  }

  /**
   * Get current configuration (immutable)
   */
  get config(): Readonly<BrowserFileViewerConfig> {
    return Object.freeze(structuredClone(this._config));
  }

  /**
   * Update configuration with validation
   */
  updateConfig(updates: PartialConfig): ValidationResult {
    const validation = ConfigValidator.validate(updates);

    if (!validation.isValid) {
      return validation;
    }

    const previousConfig = structuredClone(this._config);
    const newConfig = this.mergeConfigs(this._config, updates);

    // Store in history
    this.addToHistory(previousConfig);

    // Update current config
    this._config = newConfig;

    // Notify listeners
    this.notifyListeners(previousConfig, newConfig, updates);

    return validation;
  }

  /**
   * Update a single configuration value
   */
  updateConfigValue(path: string, value: any): ValidationResult {
    const validation = ConfigValidator.validateChange(path, value);

    if (!validation.isValid) {
      return validation;
    }

    const previousConfig = structuredClone(this._config);
    const newConfig = structuredClone(this._config);

    // Set the value at the specified path
    this.setValueAtPath(newConfig, path, value);

    // Store in history
    this.addToHistory(previousConfig);

    // Update current config
    this._config = newConfig;

    // Create a partial config for notification
    const partialUpdate = this.createPartialFromPath(path, value);

    // Notify listeners
    this.notifyListeners(previousConfig, newConfig, partialUpdate);

    return validation;
  }

  /**
   * Load a preset configuration
   */
  loadPreset(presetName: string): ValidationResult {
    const preset = ConfigPresets.getPreset(presetName);
    if (!preset) {
      return {
        isValid: false,
        errors: [
          {
            path: 'preset',
            message: `Unknown preset: ${presetName}`,
            code: 'UNKNOWN_PRESET',
            severity: 'error',
          },
        ],
        warnings: [],
      };
    }

    return this.updateConfig(preset);
  }

  /**
   * Reset to default configuration
   */
  reset(): void {
    const previousConfig = structuredClone(this._config);
    const defaultConfig = this.createDefaultConfig();

    this.addToHistory(previousConfig);
    this._config = defaultConfig;

    this.notifyListeners(previousConfig, defaultConfig, defaultConfig);
  }

  /**
   * Revert to previous configuration
   */
  revert(): boolean {
    if (this._history.length === 0) {
      return false;
    }

    const previousConfig = structuredClone(this._config);
    const revertConfig = this._history.pop()!;

    this._config = revertConfig;

    this.notifyListeners(previousConfig, revertConfig, revertConfig);

    return true;
  }

  /**
   * Add configuration change listener
   */
  addListener(id: string, listener: ConfigChangeListener): void {
    this._listeners.set(id, listener);
  }

  /**
   * Remove configuration change listener
   */
  removeListener(id: string): boolean {
    return this._listeners.delete(id);
  }

  /**
   * Get configuration value at path
   */
  getValue(path: string): any {
    return this.getValueAtPath(this._config, path);
  }

  /**
   * Check if a specific feature is enabled
   */
  isFeatureEnabled(feature: string): boolean {
    switch (feature) {
      case 'pagination':
        return this._config.ui.pagination?.enabled ?? true;
      case 'fileInfo':
        return this._config.ui.fileInfo?.enabled ?? true;
      case 'animations':
        return this._config.ui.animations?.enabled ?? true;
      case 'preloading':
        return this._config.performance.preloadPages > 0;
      case 'stateHistory':
        return this._config.state.historySize > 0;
      default:
        return false;
    }
  }

  /**
   * Get performance recommendations based on current config
   */
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const config = this._config;

    // Memory recommendations
    if (config.performance.memoryLimit < 128 * 1024 * 1024) {
      recommendations.push(
        'Consider increasing memory limit for better performance'
      );
    }

    // Cache recommendations
    if (config.performance.cacheStrategy === 'minimal') {
      recommendations.push(
        'Enable more aggressive caching for better response times'
      );
    }

    // Preloading recommendations
    if (config.performance.preloadPages === 0) {
      recommendations.push('Enable preloading for smoother navigation');
    }

    // Rendering recommendations
    if (
      config.rendering.engine === 'canvas' &&
      config.rendering.pixelRatio > 2
    ) {
      recommendations.push(
        'Consider reducing pixel ratio or using WebGL for high-DPI displays'
      );
    }

    return recommendations;
  }

  /**
   * Export current configuration
   */
  export(): BrowserFileViewerConfig {
    return structuredClone(this._config);
  }

  /**
   * Import configuration from external source
   */
  import(config: PartialConfig): ValidationResult {
    return this.updateConfig(config);
  }

  private createDefaultConfig(): BrowserFileViewerConfig {
    return ConfigPresets.getPreset('default')!;
  }

  private mergeConfigs(
    base: BrowserFileViewerConfig,
    updates: PartialConfig
  ): BrowserFileViewerConfig {
    return this.deepMerge(
      structuredClone(base),
      updates
    ) as BrowserFileViewerConfig;
  }

  private deepMerge(target: any, source: any): any {
    for (const key in source) {
      if (
        source[key] !== null &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        if (!target[key]) {
          target[key] = {};
        }
        this.deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  private setValueAtPath(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  private getValueAtPath(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return undefined;
      }
      current = current[key];
    }

    return current;
  }

  private createPartialFromPath(path: string, value: any): PartialConfig {
    const keys = path.split('.');
    const result: any = {};
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = {};
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;

    return result;
  }

  private addToHistory(config: BrowserFileViewerConfig): void {
    this._history.push(config);

    // Maintain history size limit
    if (this._history.length > this._maxHistorySize) {
      this._history.shift();
    }
  }

  private notifyListeners(
    previousConfig: BrowserFileViewerConfig,
    newConfig: BrowserFileViewerConfig,
    changes: PartialConfig
  ): void {
    // Convert changes to individual path notifications
    this.notifyChangesRecursively('', changes, previousConfig, newConfig);
  }

  private notifyChangesRecursively(
    basePath: string,
    changes: any,
    previousConfig: BrowserFileViewerConfig,
    newConfig: BrowserFileViewerConfig
  ): void {
    for (const [key, value] of Object.entries(changes)) {
      const path = basePath ? `${basePath}.${key}` : key;

      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
      ) {
        // Recursively handle nested objects
        this.notifyChangesRecursively(path, value, previousConfig, newConfig);
      } else {
        // Notify listeners for this specific change
        const oldValue = this.getValueAtPath(previousConfig, path);
        this._listeners.forEach((listener) => {
          try {
            listener(path, value, oldValue, newConfig);
          } catch (error) {
            console.error('Error in configuration change listener:', error);
          }
        });
      }
    }
  }
}

/**
 * Global configuration manager instance
 */
let globalConfigManager: ConfigurationManager | null = null;

/**
 * Get the global configuration manager instance
 */
export function getConfigManager(): ConfigurationManager {
  if (!globalConfigManager) {
    globalConfigManager = new ConfigurationManager();
  }
  return globalConfigManager;
}

/**
 * Initialize the global configuration manager with initial config
 */
export function initializeConfigManager(
  initialConfig?: PartialConfig
): ConfigurationManager {
  globalConfigManager = new ConfigurationManager(initialConfig);
  return globalConfigManager;
}

/**
 * Reset the global configuration manager
 */
export function resetConfigManager(): void {
  globalConfigManager = null;
}
