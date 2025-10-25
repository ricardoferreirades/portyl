# DOMFileViewer

A DOM adapter for BrowserFileViewer that provides simple DOM integration while maintaining the framework-agnostic core. This class handles DOM manipulation, canvas rendering, and pagination controls automatically.

## Constructor

```typescript
new DOMFileViewer(container: HTMLElement, config?: ViewerConfig)
```

### Parameters

- `container` - HTML element that will contain the viewer
- `config` (optional) - Configuration object for the viewer

## Properties

### `container: HTMLElement`
The container element

### `canvas: HTMLCanvasElement | undefined`
The canvas element (created automatically)

### `paginationContainer: HTMLElement | undefined`
The pagination controls container (created automatically)

## Methods

### `loadFile(file: File): Promise<RenderResult>`

Loads and displays a file in the DOM.

**Parameters:**
- `file` - The file to load and display

**Returns:** `Promise<RenderResult>` - Result object containing success status

**Example:**
```typescript
const container = document.getElementById('viewer');
const viewer = new DOMFileViewer(container);

const result = await viewer.loadFile(file);
if (result.success) {
  console.log('File displayed successfully');
} else {
  console.error('Display failed:', result.error);
}
```

### `nextPage(): Promise<void>`

Navigates to the next page and re-renders.

**Example:**
```typescript
await viewer.nextPage();
```

### `previousPage(): Promise<void>`

Navigates to the previous page and re-renders.

**Example:**
```typescript
await viewer.previousPage();
```

### `jumpToPage(pageNumber: number): Promise<void>`

Jumps to a specific page (1-based) and re-renders.

**Parameters:**
- `pageNumber` - Page number (1-based)

**Example:**
```typescript
// Jump to page 3
await viewer.jumpToPage(3);
```

### `getPaginationInfo(): PaginationInfo | null`

Gets pagination information.

**Returns:** `PaginationInfo | null` - Pagination info or `null` if no file is loaded

**Example:**
```typescript
const pagination = viewer.getPaginationInfo();
if (pagination) {
  console.log(`Page ${pagination.currentPage} of ${pagination.totalPages}`);
}
```

### `canHandle(file: File): boolean`

Checks if a file can be handled.

**Parameters:**
- `file` - The file to check

**Returns:** `boolean` - `true` if the file can be handled

**Example:**
```typescript
const canHandle = viewer.canHandle(file);
if (canHandle) {
  await viewer.loadFile(file);
}
```

### `getSupportedTypes(): string[]`

Gets list of supported MIME types.

**Returns:** `string[]` - Array of supported MIME types

**Example:**
```typescript
const supportedTypes = viewer.getSupportedTypes();
console.log('Supported types:', supportedTypes);
```

### `destroy(): void`

Cleans up resources and removes DOM elements.

**Example:**
```typescript
// Clean up when done
viewer.destroy();
```

## DOM Structure

The DOMFileViewer automatically creates the following DOM structure:

```html
<div class="portyl-container">
  <canvas class="portyl-canvas"></canvas>
  <div class="pagination-controls" style="display: none;">
    <button id="prev-btn">◀ Previous</button>
    <span>Page 1 of 5</span>
    <input type="number" id="page-input" min="1" max="5" value="1">
    <button id="next-btn">Next ▶</button>
  </div>
</div>
```

## Styling

The viewer applies basic styling to elements. You can override these styles:

```css
.portyl-container {
  /* Container styles */
}

.portyl-canvas {
  display: block;
  max-width: 100%;
  max-height: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.pagination-controls {
  margin-top: 10px;
  text-align: center;
}

.pagination-controls button {
  margin: 0 5px;
  padding: 5px 10px;
}

.pagination-controls input {
  width: 60px;
  margin: 0 10px;
}
```

## Configuration

The DOMFileViewer uses sensible defaults but can be configured:

```typescript
const viewer = new DOMFileViewer(container, {
  maxDimensions: { width: 1200, height: 800 },
  showFileInfo: true,
  enablePagination: true,
  preserveAspectRatio: true,
  backgroundColor: '#ffffff'
});
```

## Event Handling

The DOMFileViewer automatically handles:

- **Window resize** - Automatically resizes canvas and re-renders
- **Pagination controls** - Previous/Next buttons and page input
- **Error display** - Shows error messages in the container

## Complete Example

```typescript
import { DOMFileViewer } from 'portyl';

// Get container element
const container = document.getElementById('viewer');

// Create viewer with configuration
const viewer = new DOMFileViewer(container, {
  maxDimensions: { width: 1200, height: 800 },
  showFileInfo: true,
  enablePagination: true
});

// Handle file input
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (file) {
    const result = await viewer.loadFile(file);
    if (!result.success) {
      console.error('Failed to load file:', result.error);
    }
  }
});

// Clean up when needed
window.addEventListener('beforeunload', () => {
  viewer.destroy();
});
```

## HTML Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Portyl DOM Viewer</title>
  <style>
    .viewer-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .file-input {
      margin-bottom: 20px;
    }
    
    #viewer {
      border: 2px dashed #ccc;
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div class="viewer-container">
    <input type="file" id="fileInput" class="file-input" accept="image/*">
    <div id="viewer">
      <p>Select an image file to view</p>
    </div>
  </div>

  <script type="module">
    import { DOMFileViewer } from 'portyl';
    
    const container = document.getElementById('viewer');
    const fileInput = document.getElementById('fileInput');
    
    const viewer = new DOMFileViewer(container);
    
    fileInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (file) {
        await viewer.loadFile(file);
      }
    });
  </script>
</body>
</html>
```

## React Integration Example

```typescript
import React, { useEffect, useRef } from 'react';
import { DOMFileViewer } from 'portyl';

interface FileViewerProps {
  file: File | null;
}

export const FileViewer: React.FC<FileViewerProps> = ({ file }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<DOMFileViewer>();

  useEffect(() => {
    if (containerRef.current) {
      viewerRef.current = new DOMFileViewer(containerRef.current);
    }

    return () => {
      viewerRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (file && viewerRef.current) {
      viewerRef.current.loadFile(file);
    }
  }, [file]);

  return <div ref={containerRef} style={{ minHeight: '400px' }} />;
};
```

## Vue Integration Example

```typescript
import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue';
import { DOMFileViewer } from 'portyl';

export default defineComponent({
  name: 'FileViewer',
  props: {
    file: {
      type: File,
      default: null
    }
  },
  setup(props) {
    const container = ref<HTMLDivElement>();
    let viewer: DOMFileViewer;

    onMounted(() => {
      if (container.value) {
        viewer = new DOMFileViewer(container.value);
      }
    });

    onUnmounted(() => {
      viewer?.destroy();
    });

    watch(() => props.file, async (newFile) => {
      if (newFile && viewer) {
        await viewer.loadFile(newFile);
      }
    });

    return { container };
  }
});
```

## Error Handling

The DOMFileViewer automatically displays errors in the container:

```typescript
// Errors are automatically displayed in the container
const result = await viewer.loadFile(invalidFile);
if (!result.success) {
  // Error message is already shown in the DOM
  console.log('Error displayed to user:', result.error);
}
```

## Performance Considerations

- **Automatic canvas resizing** - Canvas is resized to fit the container
- **Memory management** - Resources are cleaned up on destroy
- **Event cleanup** - Event listeners are properly removed
- **Responsive design** - Handles window resize events

## Related APIs

- [BrowserFileViewer](/api/browser-file-viewer) - Core viewer class
- [ViewerConfig](/api/viewer-config) - Configuration interface
- [RenderResult](/api/types) - Render result interface
