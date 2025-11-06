# ConfigurationManager

Advanced configuration management system with validation, change detection, and event notifications. Provides runtime configuration updates and preset management.

## Constructor

```typescript
new ConfigurationManager(initialConfig?: PartialConfig)
```

### Parameters

- `initialConfig` (optional) - Initial configuration to apply

## Properties

### `config: Readonly<BrowserFileViewerConfig>`

Current configuration (read-only, immutable)

## Methods

### `updateConfig(updates: PartialConfig): ValidationResult`

Updates configuration with validation.

**Parameters:**
- `updates` - Partial configuration updates

**Returns:** `ValidationResult` - Validation result with errors/warnings

**Example:**
```typescript
const configManager = new ConfigurationManager();
const result = configManager.updateConfig({
  maxDimensions: { width: 1200, height: 800 },
  showFileInfo: true
});

if (!result.isValid) {
  console.error('Configuration errors:', result.errors);
}
```

### `updateConfigValue(path: string, value: any): ValidationResult`

Updates a single configuration value by path.

**Parameters:**
- `path` - Dot-notation path to the configuration value
- `value` - New value

**Returns:** `ValidationResult` - Validation result

**Example:**
```typescript
// Update specific nested values
configManager.updateConfigValue('ui.pagination.enabled', true);
configManager.updateConfigValue('performance.memoryLimit', 256 * 1024 * 1024);
```

### `loadPreset(presetName: string): ValidationResult`

Loads a preset configuration.

**Parameters:**
- `presetName` - Name of the preset to load

**Returns:** `ValidationResult` - Validation result

**Example:**
```typescript
const result = configManager.loadPreset('gallery');
if (!result.isValid) {
  console.error('Failed to load preset:', result.errors);
}
```

### `reset(): void`

Resets configuration to defaults.

**Example:**
```typescript
configManager.reset();
```

### `revert(): boolean`

Reverts to the previous configuration.

**Returns:** `boolean` - `true` if reverted successfully

**Example:**
```typescript
if (configManager.revert()) {
  console.log('Configuration reverted');
} else {
  console.log('No previous configuration to revert to');
}
```

### `addListener(id: string, listener: ConfigChangeListener): void`

Adds a configuration change listener.

**Parameters:**
- `id` - Unique listener identifier
- `listener` - Change listener function

**Example:**
```typescript
configManager.addListener('ui-updates', (path, newValue, oldValue, config) => {
  console.log(`Configuration changed: ${path} = ${newValue}`);
});
```

### `removeListener(id: string): boolean`

Removes a configuration change listener.

**Parameters:**
- `id` - Listener identifier

**Returns:** `boolean` - `true` if listener was removed

**Example:**
```typescript
configManager.removeListener('ui-updates');
```

### `getValue(path: string): any`

Gets a configuration value by path.

**Parameters:**
- `path` - Dot-notation path to the value

**Returns:** `any` - Configuration value

**Example:**
```typescript
const maxWidth = configManager.getValue('maxDimensions.width');
const isPaginationEnabled = configManager.getValue('ui.pagination.enabled');
```

### `isFeatureEnabled(feature: string): boolean`

Checks if a specific feature is enabled.

**Parameters:**
- `feature` - Feature name

**Returns:** `boolean` - `true` if feature is enabled

**Example:**
```typescript
if (configManager.isFeatureEnabled('pagination')) {
  console.log('Pagination is enabled');
}
```

### `getPerformanceRecommendations(): string[]`

Gets performance recommendations based on current configuration.

**Returns:** `string[]` - Array of recommendation messages

**Example:**
```typescript
const recommendations = configManager.getPerformanceRecommendations();
recommendations.forEach(rec => console.log(`Recommendation: ${rec}`));
```

### `export(): BrowserFileViewerConfig`

Exports current configuration.

**Returns:** `BrowserFileViewerConfig` - Current configuration

**Example:**
```typescript
const config = configManager.export();
console.log('Current configuration:', config);
```

### `import(config: PartialConfig): ValidationResult`

Imports configuration from external source.

**Parameters:**
- `config` - Configuration to import

**Returns:** `ValidationResult` - Validation result

**Example:**
```typescript
const result = configManager.import(externalConfig);
if (result.isValid) {
  console.log('Configuration imported successfully');
}
```

## Configuration Structure

### `BrowserFileViewerConfig`

```typescript
interface BrowserFileViewerConfig {
  maxDimensions: { width: number; height: number };
  ui: {
    pagination: { enabled: boolean };
    fileInfo: { enabled: boolean };
    animations: { enabled: boolean };
  };
  performance: {
    memoryLimit: number;
    cacheStrategy: 'minimal' | 'aggressive' | 'balanced';
    preloadPages: number;
  };
  rendering: {
    engine: 'canvas' | 'webgl';
    pixelRatio: number;
  };
  state: {
    historySize: number;
  };
}
```

## Usage Examples

### Basic Configuration Management

```typescript
import { ConfigurationManager } from 'portyl';

// Create configuration manager
const configManager = new ConfigurationManager();

// Update configuration
configManager.updateConfig({
  maxDimensions: { width: 1200, height: 800 },
  ui: {
    pagination: { enabled: true },
    fileInfo: { enabled: true }
  }
});

// Listen for changes
configManager.addListener('ui-changes', (path, newValue, oldValue) => {
  console.log(`UI setting changed: ${path} = ${newValue}`);
});
```

### Advanced Configuration Management

```typescript
class AdvancedViewer {
  private configManager: ConfigurationManager;
  private viewer: BrowserFileViewer;

  constructor() {
    this.configManager = new ConfigurationManager();
    this.viewer = new BrowserFileViewer();
    
    this.setupConfigurationListeners();
  }

  private setupConfigurationListeners() {
    this.configManager.addListener('dimensions', (path, newValue) => {
      if (path === 'maxDimensions') {
        this.viewer.updateConfig({ maxDimensions: newValue });
      }
    });

    this.configManager.addListener('ui', (path, newValue) => {
      if (path.startsWith('ui.')) {
        this.updateUI(newValue);
      }
    });
  }

  updateMaxDimensions(width: number, height: number) {
    this.configManager.updateConfigValue('maxDimensions', { width, height });
  }

  togglePagination() {
    const current = this.configManager.getValue('ui.pagination.enabled');
    this.configManager.updateConfigValue('ui.pagination.enabled', !current);
  }

  loadPreset(presetName: string) {
    const result = this.configManager.loadPreset(presetName);
    if (result.isValid) {
      this.applyConfiguration();
    } else {
      console.error('Failed to load preset:', result.errors);
    }
  }

  private applyConfiguration() {
    const config = this.configManager.export();
    this.viewer.updateConfig(config);
  }
}
```

### Preset Management

```typescript
// Load different presets
const presets = {
  gallery: 'gallery',
  thumbnail: 'thumbnail',
  fullscreen: 'fullscreen',
  performance: 'performance'
};

function loadPreset(presetName: string) {
  const result = configManager.loadPreset(presetName);
  if (result.isValid) {
    console.log(`Loaded preset: ${presetName}`);
  } else {
    console.error(`Failed to load preset ${presetName}:`, result.errors);
  }
}

// Load preset based on user selection
document.getElementById('preset-select').addEventListener('change', (event) => {
  const presetName = event.target.value;
  loadPreset(presetName);
});
```

### Configuration Validation

```typescript
function validateAndUpdateConfig(updates: PartialConfig) {
  const result = configManager.updateConfig(updates);
  
  if (!result.isValid) {
    console.error('Configuration validation failed:');
    result.errors.forEach(error => {
      console.error(`- ${error.path}: ${error.message}`);
    });
    return false;
  }
  
  if (result.warnings.length > 0) {
    console.warn('Configuration warnings:');
    result.warnings.forEach(warning => {
      console.warn(`- ${warning.path}: ${warning.message}`);
    });
  }
  
  return true;
}
```

### Performance Monitoring

```typescript
function setupPerformanceMonitoring(configManager: ConfigurationManager) {
  // Get performance recommendations
  const recommendations = configManager.getPerformanceRecommendations();
  if (recommendations.length > 0) {
    console.log('Performance recommendations:');
    recommendations.forEach(rec => console.log(`- ${rec}`));
  }

  // Monitor configuration changes for performance impact
  configManager.addListener('performance', (path, newValue, oldValue) => {
    if (path.startsWith('performance.')) {
      console.log(`Performance setting changed: ${path}`);
      
      // Re-evaluate recommendations
      const newRecommendations = configManager.getPerformanceRecommendations();
      if (newRecommendations.length > 0) {
        console.log('New recommendations:', newRecommendations);
      }
    }
  });
}
```

## Global Configuration Manager

### `getConfigManager(): ConfigurationManager`

Gets the global configuration manager instance.

**Returns:** `ConfigurationManager` - Global configuration manager

**Example:**
```typescript
import { getConfigManager } from 'portyl';

const globalConfig = getConfigManager();
globalConfig.updateConfig({ maxDimensions: { width: 1600, height: 1200 } });
```

### `initializeConfigManager(initialConfig?: PartialConfig): ConfigurationManager`

Initializes the global configuration manager.

**Parameters:**
- `initialConfig` (optional) - Initial configuration

**Returns:** `ConfigurationManager` - Initialized configuration manager

**Example:**
```typescript
import { initializeConfigManager } from 'portyl';

const configManager = initializeConfigManager({
  maxDimensions: { width: 1920, height: 1080 },
  ui: { pagination: { enabled: true } }
});
```

### `resetConfigManager(): void`

Resets the global configuration manager.

**Example:**
```typescript
import { resetConfigManager } from 'portyl';

resetConfigManager();
```

## Event System

### Configuration Change Events

```typescript
interface ConfigChangeListener {
  (path: string, newValue: any, oldValue: any, config: BrowserFileViewerConfig): void;
}
```

### Event Handling Example

```typescript
const configManager = new ConfigurationManager();

// Listen for all changes
configManager.addListener('all-changes', (path, newValue, oldValue, config) => {
  console.log(`Configuration changed: ${path}`);
  console.log(`Old value: ${oldValue}`);
  console.log(`New value: ${newValue}`);
});

// Listen for specific changes
configManager.addListener('ui-changes', (path, newValue) => {
  if (path.startsWith('ui.')) {
    updateUI(newValue);
  }
});

// Listen for performance changes
configManager.addListener('performance-changes', (path, newValue) => {
  if (path.startsWith('performance.')) {
    updatePerformanceSettings(newValue);
  }
});
```

## Related APIs

- [ViewerConfig](/api/viewer-config) - Basic configuration interface
- [BrowserFileViewer](/api/browser-file-viewer) - Main viewer class
