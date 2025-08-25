
# Portyl

Portyl is a lightweight, framework-agnostic TypeScript library for rendering files in the browser through a unified canvas-based viewer.

## Features

- View JPEG, PNG, GIF, WebP, SVG, BMP, TIFF
- High-performance canvas rendering
- Framework-agnostic & TypeScript support
- Responsive and customizable
- File info & error handling

## Installation

```bash
npm install portyl
```


## Quick Start

```typescript
import { BrowserFileViewer } from 'portyl';

const viewer = new BrowserFileViewer();
const container = document.getElementById('viewer-container');

const fileInput = document.getElementById('file-input') as HTMLInputElement;
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (file) {
    await viewer.view(file, { container });
  }
});
```

### CommonJS
```javascript
const { BrowserFileViewer } = require('portyl');
```

### Browser Script Tag
```html
<script src="node_modules/portyl/dist/index.umd.js"></script>
<script>
  const viewer = new BrowserFileViewer.BrowserFileViewer();
</script>
```

## API Reference

### BrowserFileViewer

#### Constructor
```typescript
new BrowserFileViewer()
```

#### Methods

##### `canView(file: File): boolean`
Check if a file can be viewed by the library.

##### `view(file: File, options: ViewerOptions): Promise<ViewerResult>`
View a file in the specified container.

**Parameters:**
- `file`: The file to view
- `options`: Viewer configuration options

**Returns:** Promise resolving to a `ViewerResult`

##### `getSupportedTypes(): string[]`
Get an array of supported MIME types.

##### `getFileInfo(file: File): FileInfo`
Extract file information from a File object.

##### `formatFileSize(bytes: number): string`
Format file size in human-readable format.

##### `destroy(): void`
Clean up resources and event listeners.

### ViewerOptions

```typescript
interface ViewerOptions {
  container: HTMLElement;    // Required: Container element to render in
  maxWidth?: number;         // Optional: Maximum width in pixels
  maxHeight?: number;        // Optional: Maximum height in pixels
  showFileInfo?: boolean;    // Optional: Show file information
  className?: string;        // Optional: Custom CSS class
}
```

### ViewerResult

```typescript
interface ViewerResult {
  success: boolean;          // Whether viewing was successful
  error?: string;           // Error message if unsuccessful
  element?: HTMLElement;    // The created viewer element
}
```

## Examples

### Basic Image Viewer
```typescript
import { BrowserFileViewer } from 'portyl';

const viewer = new BrowserFileViewer();
const container = document.getElementById('image-container');

async function viewImage(file: File) {
  const result = await viewer.view(file, {
    container,
    showFileInfo: true
  });
  
  if (result.success) {
    console.log('Image loaded successfully');
  } else {
    console.error('Failed to load image:', result.error);
  }
}
```

### Drag and Drop Support
```typescript
const dropZone = document.getElementById('drop-zone');

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
});

dropZone.addEventListener('drop', async (e) => {
  e.preventDefault();
  
  const files = Array.from(e.dataTransfer.files);
  const file = files[0];
  
  if (file && viewer.canView(file)) {
    await viewImage(file);
  } else {
    console.log('Unsupported file type');
  }
});
```

### File Type Validation
```typescript
const supportedTypes = viewer.getSupportedTypes();
console.log('Supported types:', supportedTypes);

// Check if specific file is supported
if (viewer.canView(file)) {
  // File can be viewed
} else {
  // Show error or alternative action
}
```

## Styling

The library adds CSS classes that you can style:

```css
.portyl {
  /* Main viewer container */
}

.portyl.image-viewer {
  /* Image viewer specific styles */
}

.portyl .file-info {
  /* File information panel */
}
```

## Supported File Types

### Images
- JPEG (image/jpeg)
- PNG (image/png)
- GIF (image/gif)
- WebP (image/webp)
- SVG (image/svg+xml)
- BMP (image/bmp)
- TIFF (image/tiff, image/tif) - Single and multi-page support*

*Multi-page TIFF navigation is ready for enhancement with advanced TIFF parsing


## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request


## License

MIT License - see LICENSE file for details.
