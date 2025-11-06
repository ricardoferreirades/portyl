# API Reference

This page provides a quick overview of the Portyl API. For detailed documentation, see the individual API pages.

## Quick Reference

### Main Classes

- **[BrowserFileViewer](/api/browser-file-viewer)** - Main viewer class
- **[DOMFileViewer](/api/dom-file-viewer)** - DOM adapter for easy integration

### Processors

- **[FileProcessor](/api/file-processor)** - Abstract base for file processing
- **[ImageProcessor](/api/image-processor)** - Image file processor

### Renderers

- **[Renderer](/api/renderer)** - Abstract base for rendering
- **[CanvasRenderer](/api/canvas-renderer)** - Canvas-based renderer

### Configuration

- **[ViewerConfig](/api/viewer-config)** - Basic configuration
- **[ConfigurationManager](/api/configuration-manager)** - Advanced configuration management
- **[RenderOptions](/api/render-options)** - Rendering options

### Utilities

- **[FileUtils](/api/file-utils)** - File utility functions
- **[StateManager](/api/state-manager)** - State management
- **[Types](/api/types)** - TypeScript type definitions

## Quick Start

```typescript
import { BrowserFileViewer } from 'portyl';

// Create viewer
const viewer = new BrowserFileViewer({
  maxDimensions: { width: 1920, height: 1080 },
  showFileInfo: true,
  enablePagination: true
});

// Load and render file
const result = await viewer.loadFile(file);
if (result.success) {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  await viewer.renderToTarget(canvas);
}
```

## DOM Integration

```typescript
import { DOMFileViewer } from 'portyl';

// Simple DOM integration
const container = document.getElementById('viewer');
const viewer = new DOMFileViewer(container);
await viewer.loadFile(file);
```

## Framework Integration

### React
```typescript
import { BrowserFileViewer } from 'portyl';

function FileViewer({ file }) {
  const viewer = useRef(new BrowserFileViewer());
  // ... implementation
}
```

### Vue
```typescript
import { BrowserFileViewer } from 'portyl';

export default {
  setup() {
    const viewer = new BrowserFileViewer();
    // ... implementation
  }
}
```

## Examples

See the [example projects](https://github.com/ricardoferreirades/portyl/tree/main/example) in the repository for practical implementations.

