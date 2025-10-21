

# Portyl

**Portyl** is a lightweight, framework-agnostic TypeScript library for rendering files in the browser through a unified canvas-based viewer. Designed with flexibility and performance in mind, Portyl provides a powerful solution for web applications, Electron apps, and desktop frameworks that need to display local files from the file system.

## Overview

Portyl bridges the gap between file system access and browser-based rendering, making it an ideal choice for:

- **Web Applications**: Handle file uploads and preview images directly in the browser
- **Electron & Desktop Apps**: Display local files from the file system with native-like performance
- **Cross-Platform Tools**: Build consistent file viewing experiences across web and desktop
- **File Management Systems**: Create powerful file browsers with preview capabilities
- **Content Management**: Integrate file previews into your CMS or document management system

Whether you're building a web-based image gallery, an Electron file manager, a Tauri desktop application, or any project that needs robust file viewing capabilities, Portyl provides a simple yet powerful API to handle it all.

## Live Example

[View the Portyl demo on GitHub Pages](https://ricardoferreirades.github.io/portyl/)

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

## Desktop Applications & Electron

Portyl is perfect for desktop applications that need to display local files from the file system. It works seamlessly with Electron and Electron-like frameworks.

### Electron Integration

Electron applications can use Portyl to create powerful file viewers with access to the local file system:

```typescript
import { BrowserFileViewer } from 'portyl';
import { ipcRenderer } from 'electron';

const viewer = new BrowserFileViewer();
const container = document.getElementById('viewer-container');

// Using Electron's dialog to select local files
async function openFile() {
  const result = await ipcRenderer.invoke('dialog:openFile');
  
  if (result.filePath) {
    // Read file from file system
    const buffer = await ipcRenderer.invoke('fs:readFile', result.filePath);
    const blob = new Blob([buffer]);
    const file = new File([blob], result.fileName, { type: result.mimeType });
    
    await viewer.view(file, { container, showFileInfo: true });
  }
}

// Watch for file changes in the file system
ipcRenderer.on('file:changed', async (event, data) => {
  // Automatically refresh the view when file changes
  const file = await loadFileFromPath(data.path);
  await viewer.view(file, { container });
});
```

#### Electron Main Process (main.js)

```javascript
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const mime = require('mime-types');

ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    return {
      filePath,
      fileName: path.basename(filePath),
      mimeType: mime.lookup(filePath) || 'application/octet-stream'
    };
  }
  
  return null;
});

ipcMain.handle('fs:readFile', async (event, filePath) => {
  return await fs.readFile(filePath);
});
```

### Tauri Integration

Tauri is a modern alternative to Electron. Portyl works great with Tauri applications:

```typescript
import { BrowserFileViewer } from 'portyl';
import { open } from '@tauri-apps/api/dialog';
import { readBinaryFile } from '@tauri-apps/api/fs';

const viewer = new BrowserFileViewer();

async function openFile() {
  const selected = await open({
    multiple: false,
    filters: [{
      name: 'Image',
      extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'tiff']
    }]
  });
  
  if (selected) {
    const contents = await readBinaryFile(selected);
    const blob = new Blob([contents]);
    const fileName = selected.split('/').pop();
    const file = new File([blob], fileName);
    
    await viewer.view(file, {
      container: document.getElementById('viewer'),
      showFileInfo: true
    });
  }
}
```

### NW.js Integration

NW.js (formerly node-webkit) can also leverage Portyl for file viewing:

```typescript
import { BrowserFileViewer } from 'portyl';

const viewer = new BrowserFileViewer();

// NW.js provides direct file system access
function setupFileInput() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.setAttribute('nwdirectory', ''); // For directory selection
  fileInput.setAttribute('nwworkingdir', '/home'); // Set working directory
  
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      await viewer.view(file, {
        container: document.getElementById('viewer'),
        maxWidth: 1920,
        maxHeight: 1080
      });
    }
  });
  
  return fileInput;
}
```

### Neutralino Integration

Neutralino is a lightweight alternative to Electron:

```typescript
import { BrowserFileViewer } from 'portyl';

const viewer = new BrowserFileViewer();

async function openFile() {
  const entry = await Neutralino.os.showOpenDialog('Select an image file', {
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'gif', 'webp', 'bmp', 'tiff'] }
    ]
  });
  
  if (entry) {
    const data = await Neutralino.filesystem.readBinaryFile(entry);
    const blob = new Blob([data]);
    const fileName = entry.split('/').pop();
    const file = new File([blob], fileName);
    
    await viewer.view(file, {
      container: document.getElementById('viewer')
    });
  }
}
```

### Benefits for Desktop Applications

Using Portyl in desktop applications provides several advantages:

- **Consistent Rendering**: Same rendering engine across all platforms (Windows, macOS, Linux)
- **Performance**: Canvas-based rendering for smooth performance even with large files
- **File System Integration**: Works seamlessly with native file system APIs
- **Cross-Framework**: Use the same code across Electron, Tauri, NW.js, and Neutralino
- **No External Dependencies**: Self-contained viewer with no need for external viewers or plugins
- **Memory Efficient**: Optimized for handling multiple files without memory bloat
- **Real-time Updates**: Can refresh views when files change on disk
- **Offline First**: No internet connection required, perfect for desktop apps

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request


## License

MIT License - see LICENSE file for details.
