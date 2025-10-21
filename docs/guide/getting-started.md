# Getting Started

Welcome to Portyl! This guide will help you get started with using Portyl in your web applications and desktop projects.

## What is Portyl?

**Portyl** is a lightweight, framework-agnostic TypeScript library for rendering files in the browser through a unified canvas-based viewer. Designed with flexibility and performance in mind, Portyl provides a powerful solution for web applications, Electron apps, and desktop frameworks that need to display local files from the file system.

### Perfect For

- **Web Applications**: Handle file uploads and preview images directly in the browser
- **Electron & Desktop Apps**: Display local files from the file system with native-like performance
- **Cross-Platform Tools**: Build consistent file viewing experiences across web and desktop
- **File Management Systems**: Create powerful file browsers with preview capabilities
- **Content Management**: Integrate file previews into your CMS or document management system

Whether you're building a web-based image gallery, an Electron file manager, a Tauri desktop application, or any project that needs robust file viewing capabilities, Portyl provides a simple yet powerful API to handle it all.

## Quick Start

### Installation

```bash
npm install portyl
```

### Web Application Example

```typescript
import { BrowserFileViewer } from 'portyl';

const viewer = new BrowserFileViewer();
const container = document.getElementById('viewer-container');

const fileInput = document.getElementById('file-input') as HTMLInputElement;
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (file) {
    await viewer.view(file, { container, showFileInfo: true });
  }
});
```

### Electron Application Example

```typescript
import { BrowserFileViewer } from 'portyl';
import { ipcRenderer } from 'electron';

const viewer = new BrowserFileViewer();
const container = document.getElementById('viewer-container');

// Using Electron's dialog to select local files
async function openFile() {
  const result = await ipcRenderer.invoke('dialog:openFile');
  
  if (result.filePath) {
    const buffer = await ipcRenderer.invoke('fs:readFile', result.filePath);
    const blob = new Blob([buffer]);
    const file = new File([blob], result.fileName, { type: result.mimeType });
    
    await viewer.view(file, { container, showFileInfo: true });
  }
}
```

### Tauri Application Example

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

## Key Features

- 🎨 **Canvas-based rendering** for high performance
- 📦 **Framework agnostic** - works with any JavaScript framework
- 🖥️ **Desktop ready** - perfect for Electron, Tauri, NW.js, and Neutralino
- 📘 **TypeScript first** with comprehensive type definitions
- 🔧 **Extensible architecture** for custom processors
- 🚀 **Production ready** with comprehensive error handling

## Supported File Types

- **Images**: JPEG, PNG, GIF, WebP, SVG, BMP
- **TIFF**: Single and multi-page TIFF support
- More formats coming soon!

## Next Steps

- Learn more about [Installation](/guide/installation)
- Explore detailed [Usage Examples](/guide/usage)
- Check out the [API Reference](/api/reference)
- See [Desktop Integration](/guide/desktop-integration) for Electron, Tauri, and more

