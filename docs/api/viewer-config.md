# ViewerConfig

Configuration interface for BrowserFileViewer. Defines all available options for customizing the viewer behavior.

## Interface

```typescript
interface ViewerConfig {
  maxDimensions?: { width: number; height: number };
  showFileInfo?: boolean;
  enablePagination?: boolean;
  preloadPages?: number;
  renderer?: Renderer;
  backgroundColor?: string;
  preserveAspectRatio?: boolean;
}
```

## Properties

### `maxDimensions?: { width: number; height: number }`

Maximum dimensions for rendering. Images will be scaled to fit within these dimensions.

**Default:** `{ width: 1920, height: 1080 }`

**Example:**
```typescript
const config: ViewerConfig = {
  maxDimensions: { width: 1200, height: 800 }
};
```

### `showFileInfo?: boolean`

Whether to show file information overlay during rendering.

**Default:** `false`

**Example:**
```typescript
const config: ViewerConfig = {
  showFileInfo: true
};
```

### `enablePagination?: boolean`

Whether to enable pagination for multi-page files.

**Default:** `true`

**Example:**
```typescript
const config: ViewerConfig = {
  enablePagination: true
};
```

### `preloadPages?: number`

Number of pages to preload for better performance.

**Default:** `1`

**Example:**
```typescript
const config: ViewerConfig = {
  preloadPages: 3 // Preload current page + 2 adjacent pages
};
```

### `renderer?: Renderer`

Custom renderer implementation.

**Default:** `new CanvasRenderer()`

**Example:**
```typescript
import { CanvasRenderer, WebGLRenderer } from 'portyl';

const config: ViewerConfig = {
  renderer: new CanvasRenderer()
  // or
  // renderer: new WebGLRenderer()
};
```

### `backgroundColor?: string`

Background color for rendering.

**Default:** `'transparent'`

**Example:**
```typescript
const config: ViewerConfig = {
  backgroundColor: '#ffffff'
};
```

### `preserveAspectRatio?: boolean`

Whether to preserve the aspect ratio when scaling images.

**Default:** `true`

**Example:**
```typescript
const config: ViewerConfig = {
  preserveAspectRatio: true
};
```

## Configuration Examples

### Basic Configuration

```typescript
const basicConfig: ViewerConfig = {
  maxDimensions: { width: 800, height: 600 },
  showFileInfo: true,
  enablePagination: true
};
```

### High-Quality Configuration

```typescript
const highQualityConfig: ViewerConfig = {
  maxDimensions: { width: 1920, height: 1080 },
  showFileInfo: true,
  enablePagination: true,
  preloadPages: 3,
  backgroundColor: '#ffffff',
  preserveAspectRatio: true
};
```

### Performance-Optimized Configuration

```typescript
const performanceConfig: ViewerConfig = {
  maxDimensions: { width: 1200, height: 800 },
  showFileInfo: false,
  enablePagination: true,
  preloadPages: 1,
  backgroundColor: 'transparent'
};
```

### Custom Renderer Configuration

```typescript
import { CanvasRenderer } from 'portyl';

class CustomRenderer extends CanvasRenderer {
  // Custom rendering logic
}

const customConfig: ViewerConfig = {
  maxDimensions: { width: 1600, height: 1200 },
  renderer: new CustomRenderer(),
  showFileInfo: true
};
```

## Runtime Configuration Updates

### Updating Configuration

```typescript
const viewer = new BrowserFileViewer(initialConfig);

// Update specific properties
viewer.updateConfig({
  maxDimensions: { width: 1600, height: 1200 },
  showFileInfo: true
});

// Update single property
viewer.updateConfig({
  backgroundColor: '#f5f5f5'
});
```

### Configuration Validation

```typescript
const config: ViewerConfig = {
  maxDimensions: { width: -100, height: 200 }, // Invalid width
  preloadPages: 1000 // Excessive preload
};

// Configuration is validated internally
const viewer = new BrowserFileViewer(config);
// Invalid values are corrected to defaults
```

## Framework-Specific Examples

### React Configuration

```typescript
import React, { useState } from 'react';
import { BrowserFileViewer } from 'portyl';

const FileViewer: React.FC = () => {
  const [viewer] = useState(() => new BrowserFileViewer({
    maxDimensions: { width: 1200, height: 800 },
    showFileInfo: true,
    enablePagination: true,
    backgroundColor: '#ffffff'
  }));

  return <div>File Viewer Component</div>;
};
```

### Vue Configuration

```typescript
import { defineComponent, ref } from 'vue';
import { BrowserFileViewer } from 'portyl';

export default defineComponent({
  setup() {
    const viewer = ref(new BrowserFileViewer({
      maxDimensions: { width: 1000, height: 750 },
      showFileInfo: true,
      enablePagination: true
    }));

    return { viewer };
  }
});
```

### Angular Configuration

```typescript
import { Component, OnInit } from '@angular/core';
import { BrowserFileViewer } from 'portyl';

@Component({
  selector: 'app-file-viewer',
  template: '<div></div>'
})
export class FileViewerComponent implements OnInit {
  private viewer: BrowserFileViewer;

  ngOnInit() {
    this.viewer = new BrowserFileViewer({
      maxDimensions: { width: 1400, height: 1000 },
      showFileInfo: true,
      enablePagination: true,
      preloadPages: 2
    });
  }
}
```

## Configuration Presets

### Default Preset

```typescript
const defaultConfig: ViewerConfig = {
  maxDimensions: { width: 1920, height: 1080 },
  showFileInfo: false,
  enablePagination: true,
  preloadPages: 1,
  backgroundColor: 'transparent',
  preserveAspectRatio: true
};
```

### Gallery Preset

```typescript
const galleryConfig: ViewerConfig = {
  maxDimensions: { width: 800, height: 600 },
  showFileInfo: true,
  enablePagination: true,
  preloadPages: 2,
  backgroundColor: '#ffffff',
  preserveAspectRatio: true
};
```

### Thumbnail Preset

```typescript
const thumbnailConfig: ViewerConfig = {
  maxDimensions: { width: 200, height: 200 },
  showFileInfo: false,
  enablePagination: false,
  preloadPages: 0,
  backgroundColor: 'transparent',
  preserveAspectRatio: true
};
```

### Full-Screen Preset

```typescript
const fullScreenConfig: ViewerConfig = {
  maxDimensions: { width: 1920, height: 1080 },
  showFileInfo: true,
  enablePagination: true,
  preloadPages: 3,
  backgroundColor: '#000000',
  preserveAspectRatio: true
};
```

## Advanced Configuration

### Dynamic Configuration

```typescript
class DynamicViewer {
  private viewer: BrowserFileViewer;
  private config: ViewerConfig;

  constructor(initialConfig: ViewerConfig) {
    this.config = { ...initialConfig };
    this.viewer = new BrowserFileViewer(this.config);
  }

  updateMaxDimensions(width: number, height: number) {
    this.config.maxDimensions = { width, height };
    this.viewer.updateConfig({ maxDimensions: this.config.maxDimensions });
  }

  toggleFileInfo() {
    this.config.showFileInfo = !this.config.showFileInfo;
    this.viewer.updateConfig({ showFileInfo: this.config.showFileInfo });
  }

  setBackgroundColor(color: string) {
    this.config.backgroundColor = color;
    this.viewer.updateConfig({ backgroundColor: color });
  }
}
```

### Configuration Validation

```typescript
function validateConfig(config: ViewerConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.maxDimensions) {
    if (config.maxDimensions.width <= 0) {
      errors.push('maxDimensions.width must be positive');
    }
    if (config.maxDimensions.height <= 0) {
      errors.push('maxDimensions.height must be positive');
    }
  }

  if (config.preloadPages !== undefined && config.preloadPages < 0) {
    errors.push('preloadPages must be non-negative');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Usage
const config: ViewerConfig = {
  maxDimensions: { width: 800, height: 600 },
  preloadPages: 2
};

const validation = validateConfig(config);
if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
}
```

## Related APIs

- [BrowserFileViewer](/api/browser-file-viewer) - Main viewer class
- [Renderer](/api/renderer) - Renderer interface
- [ConfigurationManager](/api/configuration-manager) - Advanced configuration management
