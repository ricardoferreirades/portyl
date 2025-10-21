# Desktop Integration

Portyl is perfect for desktop applications that need to display local files from the file system. It works seamlessly with Electron and Electron-like frameworks.

## Electron Integration

Electron applications can use Portyl to create powerful file viewers with access to the local file system.

### Renderer Process (renderer.js)

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

// Setup button to open file
document.getElementById('open-btn').addEventListener('click', openFile);
```

### Main Process (main.js)

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

### File Watcher Example

Monitor files for changes and automatically update the view:

```javascript
// Main Process
const chokidar = require('chokidar');

let currentWatcher = null;

ipcMain.handle('fs:watchFile', (event, filePath) => {
  if (currentWatcher) {
    currentWatcher.close();
  }
  
  currentWatcher = chokidar.watch(filePath, {
    persistent: true,
    ignoreInitial: true
  });
  
  currentWatcher.on('change', (path) => {
    event.sender.send('file:changed', { path });
  });
});
```

## Tauri Integration

Tauri is a modern alternative to Electron with a smaller bundle size and better performance.

### Basic File Opening

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

### Multiple Files

```typescript
async function openMultipleFiles() {
  const selected = await open({
    multiple: true,
    filters: [{
      name: 'Images',
      extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tiff']
    }]
  });
  
  if (Array.isArray(selected)) {
    for (const filePath of selected) {
      const contents = await readBinaryFile(filePath);
      const blob = new Blob([contents]);
      const fileName = filePath.split('/').pop();
      const file = new File([blob], fileName);
      
      await viewer.view(file, {
        container: document.getElementById('viewer'),
        showFileInfo: true
      });
    }
  }
}
```

### Directory Selection

```typescript
import { open } from '@tauri-apps/api/dialog';
import { readDir, readBinaryFile } from '@tauri-apps/api/fs';

async function openDirectory() {
  const selected = await open({
    directory: true
  });
  
  if (selected) {
    const entries = await readDir(selected);
    
    // Filter for image files
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tiff'];
    const imageFiles = entries.filter(entry => 
      entry.name && imageExtensions.some(ext => 
        entry.name.toLowerCase().endsWith(`.${ext}`)
      )
    );
    
    // Display first image
    if (imageFiles.length > 0) {
      const firstFile = imageFiles[0];
      const contents = await readBinaryFile(firstFile.path);
      const blob = new Blob([contents]);
      const file = new File([blob], firstFile.name);
      
      await viewer.view(file, {
        container: document.getElementById('viewer')
      });
    }
  }
}
```

## NW.js Integration

NW.js (formerly node-webkit) provides direct file system access.

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

// Using NW.js native APIs
function openFileNative() {
  const chooser = document.getElementById('fileDialog');
  chooser.addEventListener('change', async (evt) => {
    const files = evt.target.files;
    if (files.length > 0) {
      await viewer.view(files[0], {
        container: document.getElementById('viewer')
      });
    }
  });
  
  chooser.click();
}
```

## Neutralino Integration

Neutralino is a lightweight alternative to Electron with minimal resource usage.

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

// Save current view
async function saveFile() {
  const savePath = await Neutralino.os.showSaveDialog('Save file', {
    filters: [
      { name: 'PNG Image', extensions: ['png'] }
    ]
  });
  
  if (savePath) {
    // Get canvas data and save
    const canvas = document.querySelector('canvas');
    canvas.toBlob(async (blob) => {
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      await Neutralino.filesystem.writeBinaryFile(savePath, uint8Array);
    });
  }
}
```

## Benefits for Desktop Applications

Using Portyl in desktop applications provides several advantages:

### Performance
- **Canvas-based rendering** ensures smooth performance even with large files
- **Memory efficient** processing optimized for handling multiple files
- **Hardware acceleration** leverages GPU for better performance

### Cross-Platform Consistency
- **Same rendering engine** across Windows, macOS, and Linux
- **Consistent behavior** regardless of the desktop framework
- **Unified API** simplifies development and maintenance

### File System Integration
- **Direct file access** from the local file system
- **Real-time updates** can refresh views when files change on disk
- **Batch processing** handle multiple files efficiently

### Developer Experience
- **TypeScript support** with full type definitions
- **Framework agnostic** use the same code across different frameworks
- **Extensible** add custom processors and renderers as needed

### Production Ready
- **Comprehensive error handling** for robust applications
- **File validation** ensures supported formats
- **Offline first** no internet connection required

## Best Practices

### Memory Management

```typescript
// Clean up when closing files
function closeFile() {
  viewer.destroy();
  // Clear any references
}

// Handle multiple files
let currentViewer = null;

async function displayFile(file) {
  // Destroy previous viewer
  if (currentViewer) {
    currentViewer.destroy();
  }
  
  currentViewer = new BrowserFileViewer();
  await currentViewer.view(file, { container });
}
```

### Error Handling

```typescript
async function safeOpenFile(filePath) {
  try {
    const buffer = await ipcRenderer.invoke('fs:readFile', filePath);
    const blob = new Blob([buffer]);
    const file = new File([blob], path.basename(filePath));
    
    const result = await viewer.view(file, { container });
    
    if (!result.success) {
      showError(`Failed to display file: ${result.error}`);
    }
  } catch (error) {
    showError(`Error opening file: ${error.message}`);
  }
}
```

### Security Considerations

```typescript
// Validate file paths
function isValidPath(filePath) {
  const normalized = path.normalize(filePath);
  const allowedDir = path.normalize('/home/user/documents');
  
  return normalized.startsWith(allowedDir);
}

// Validate file types
function isAllowedFileType(file) {
  const allowedTypes = viewer.getSupportedTypes();
  return allowedTypes.includes(file.type);
}
```

## Next Steps

- Check out the [API Reference](/api/reference) for detailed documentation
- Explore more [Usage Examples](/guide/usage)
- Learn about [Installation](/guide/installation) options

