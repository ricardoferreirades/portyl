# Browser File Viewer

A lightweight, framework-agnostic TypeScript library for viewing files directly in the browser. Currently supports image files with plans to extend to other file types.

## Features

- 🖼️ **Image Support**: View JPEG, PNG, GIF, WebP, SVG, BMP, and TIFF files
- 🎨 **Canvas-based Rendering**: High-performance rendering with full control
- 📄 **TIFF Support**: Single and multi-page TIFF files (framework for future enhancement)
- 🎯 **Framework Agnostic**: Works with any frontend framework or vanilla JavaScript
- 📱 **Responsive**: Automatically adapts to container size
- 🔧 **TypeScript**: Full type support and IntelliSense
- 🎨 **Customizable**: Configurable options for styling and behavior
- 📊 **File Information**: Optional display of file metadata
- 🔄 **Error Handling**: Graceful error handling with detailed messages

## Installation

```bash
npm install browser-file-viewer
```

## Quick Start

### ES Modules
```typescript
import { BrowserFileViewer } from 'browser-file-viewer';

const viewer = new BrowserFileViewer();
const container = document.getElementById('viewer-container');

// View a file
const fileInput = document.getElementById('file-input') as HTMLInputElement;
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (file) {
    const result = await viewer.view(file, {
      container,
      showFileInfo: true,
      maxWidth: 800,
      maxHeight: 600
    });
    
    if (!result.success) {
      console.error('Error viewing file:', result.error);
    }
  }
});
```

### CommonJS
```javascript
const { BrowserFileViewer } = require('browser-file-viewer');
```

### Browser Script Tag
```html
<script src="node_modules/browser-file-viewer/dist/index.umd.js"></script>
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
import { BrowserFileViewer } from 'browser-file-viewer';

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
.browser-file-viewer {
  /* Main viewer container */
}

.browser-file-viewer.image-viewer {
  /* Image viewer specific styles */
}

.browser-file-viewer .file-info {
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

## Development

### Build
```bash
npm run build
```

### Test
```bash
npm test
npm run test:watch
npm run test:coverage
```

### Lint
```bash
npm run lint
npm run lint:fix
```

### Format
```bash
npm run format
npm run format:check
```

### Example Development
```bash
npm run dev:example
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Roadmap

- 📹 Video file support (MP4, WebM, AVI)
- 🎵 Audio file support (MP3, WAV, OGG)
- 📄 Document support (PDF)
- 📊 Data visualization (CSV, JSON)
- 🎨 Advanced image features (zoom, rotate)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
