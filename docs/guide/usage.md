# Usage

## Basic Example

Here's a simple example of how to use Portyl:

```typescript
import { BrowserFileViewer } from 'portyl';

// Create a viewer instance
const viewer = new BrowserFileViewer({
  canvas: document.getElementById('myCanvas'),
  maxWidth: 800,
  maxHeight: 600
});

// Handle file input
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    await viewer.loadFile(file);
  }
});
```

## Configuration Options

You can configure the viewer with various options:

```typescript
const viewer = new BrowserFileViewer({
  canvas: myCanvas,
  maxWidth: 1920,
  maxHeight: 1080,
  maintainAspectRatio: true,
  backgroundColor: '#ffffff'
});
```

## Supported File Types

Portyl supports various file types including:

- Images (PNG, JPEG, GIF, WebP)
- TIFF files
- And more...

## Advanced Usage

For more advanced usage and customization options, check out the [API Reference](/api/reference).

