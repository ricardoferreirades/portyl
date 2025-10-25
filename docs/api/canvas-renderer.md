# CanvasRenderer

Concrete implementation of Renderer that renders image pages to HTML canvas elements. This is the default renderer used by Portyl.

## Constructor

```typescript
new CanvasRenderer()
```

## Methods

### `render(page: ImagePage, target: RenderTarget, options?: RenderOptions): Promise<void>`

Renders an image page to a canvas element.

**Parameters:**
- `page` - The image page to render
- `target` - HTMLCanvasElement to render to
- `options` (optional) - Rendering options

**Returns:** `Promise<void>`

**Example:**
```typescript
const renderer = new CanvasRenderer();
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

await renderer.render(page, canvas, {
  maxWidth: 800,
  maxHeight: 600,
  preserveAspectRatio: true,
  backgroundColor: '#ffffff'
});
```

### `clear(target: RenderTarget): void`

Clears the canvas.

**Parameters:**
- `target` - HTMLCanvasElement to clear

**Example:**
```typescript
renderer.clear(canvas);
```

### `resize(target: RenderTarget, newWidth: number, newHeight: number): void`

Resizes the canvas.

**Parameters:**
- `target` - HTMLCanvasElement to resize
- `newWidth` - New width
- `newHeight` - New height

**Example:**
```typescript
renderer.resize(canvas, 1200, 800);
```

## Rendering Options

### Basic Options

```typescript
const options: RenderOptions = {
  maxWidth: 800,              // Maximum width
  maxHeight: 600,             // Maximum height
  preserveAspectRatio: true,   // Maintain aspect ratio
  backgroundColor: '#ffffff',  // Background color
  showFileInfo: false,        // Show file information overlay
  className: 'rendered-image' // CSS class name
};
```

### Advanced Options

```typescript
const advancedOptions: RenderOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  preserveAspectRatio: true,
  backgroundColor: 'transparent',
  showFileInfo: true,
  className: 'high-quality-image'
};
```

## Usage Examples

### Basic Rendering

```typescript
import { CanvasRenderer } from 'portyl';

const renderer = new CanvasRenderer();
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

// Render with default options
await renderer.render(page, canvas);
```

### Custom Dimensions

```typescript
await renderer.render(page, canvas, {
  maxWidth: 800,
  maxHeight: 600,
  preserveAspectRatio: true
});
```

### With Background Color

```typescript
await renderer.render(page, canvas, {
  backgroundColor: '#f5f5f5',
  maxWidth: 1000,
  maxHeight: 750
});
```

### With File Information Overlay

```typescript
await renderer.render(page, canvas, {
  showFileInfo: true,
  maxWidth: 1200,
  maxHeight: 900
});
```

## Performance Optimization

### High-DPI Support

```typescript
class OptimizedCanvasRenderer extends CanvasRenderer {
  async render(page: ImagePage, target: HTMLCanvasElement, options?: RenderOptions): Promise<void> {
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Set canvas size for high-DPI displays
    const rect = target.getBoundingClientRect();
    target.width = rect.width * devicePixelRatio;
    target.height = rect.height * devicePixelRatio;
    
    const ctx = target.getContext('2d')!;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // Continue with normal rendering
    await super.render(page, target, options);
  }
}
```

### Memory Management

```typescript
class MemoryOptimizedRenderer extends CanvasRenderer {
  private imageCache = new Map<string, HTMLImageElement>();
  
  async render(page: ImagePage, target: HTMLCanvasElement, options?: RenderOptions): Promise<void> {
    const cacheKey = `${page.index}-${page.imageData.width}-${page.imageData.height}`;
    
    if (this.imageCache.has(cacheKey)) {
      const cachedImage = this.imageCache.get(cacheKey)!;
      this.drawCachedImage(cachedImage, target, options);
    } else {
      const image = await this.createImage(page);
      this.imageCache.set(cacheKey, image);
      this.drawCachedImage(image, target, options);
    }
  }
  
  private async createImage(page: ImagePage): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = page.imageData.width;
      canvas.height = page.imageData.height;
      
      const imageData = new ImageData(
        page.imageData.data,
        page.imageData.width,
        page.imageData.height
      );
      ctx.putImageData(imageData, 0, 0);
      
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = canvas.toDataURL();
    });
  }
  
  private drawCachedImage(image: HTMLImageElement, target: HTMLCanvasElement, options?: RenderOptions): void {
    const ctx = target.getContext('2d')!;
    
    // Clear canvas
    ctx.clearRect(0, 0, target.width, target.height);
    
    // Set background
    if (options?.backgroundColor) {
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, target.width, target.height);
    }
    
    // Calculate dimensions
    const dimensions = this.calculateDimensions(
      image.width,
      image.height,
      options?.maxWidth || target.width,
      options?.maxHeight || target.height,
      options?.preserveAspectRatio ?? true
    );
    
    // Draw image
    ctx.drawImage(
      image,
      0, 0, image.width, image.height,
      0, 0, dimensions.width, dimensions.height
    );
  }
}
```

## Custom Styling

### CSS Classes

```css
.rendered-image {
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.high-quality-image {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}
```

### Dynamic Styling

```typescript
const renderer = new CanvasRenderer();
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

// Apply custom styling
canvas.style.border = '2px solid #007bff';
canvas.style.borderRadius = '8px';
canvas.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';

await renderer.render(page, canvas);
```

## Error Handling

```typescript
try {
  await renderer.render(page, canvas, options);
} catch (error) {
  console.error('Canvas rendering error:', error);
  
  // Fallback rendering
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffebee';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#d32f2f';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Rendering Error', canvas.width / 2, canvas.height / 2);
}
```

## Complete Example

```typescript
import { CanvasRenderer, BrowserFileViewer } from 'portyl';

// Create viewer with custom renderer
const renderer = new CanvasRenderer();
const viewer = new BrowserFileViewer({
  renderer: renderer,
  maxDimensions: { width: 1920, height: 1080 }
});

// Load and render a file
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (file) {
    const result = await viewer.loadFile(file);
    if (result.success) {
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      await viewer.renderToTarget(canvas, {
        maxWidth: 800,
        maxHeight: 600,
        preserveAspectRatio: true,
        backgroundColor: '#ffffff',
        showFileInfo: true
      });
    }
  }
});
```

## React Integration

```typescript
import React, { useEffect, useRef } from 'react';
import { CanvasRenderer } from 'portyl';

interface CanvasViewerProps {
  page: ImagePage | null;
  options?: RenderOptions;
}

export const CanvasViewer: React.FC<CanvasViewerProps> = ({ page, options }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer>();

  useEffect(() => {
    rendererRef.current = new CanvasRenderer();
  }, []);

  useEffect(() => {
    if (page && canvasRef.current && rendererRef.current) {
      rendererRef.current.render(page, canvasRef.current, options);
    }
  }, [page, options]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        border: '1px solid #ddd',
        borderRadius: '4px',
        maxWidth: '100%',
        height: 'auto'
      }}
    />
  );
};
```

## Vue Integration

```typescript
import { defineComponent, ref, onMounted, watch } from 'vue';
import { CanvasRenderer } from 'portyl';

export default defineComponent({
  name: 'CanvasViewer',
  props: {
    page: {
      type: Object as PropType<ImagePage | null>,
      default: null
    },
    options: {
      type: Object as PropType<RenderOptions>,
      default: () => ({})
    }
  },
  setup(props) {
    const canvas = ref<HTMLCanvasElement>();
    let renderer: CanvasRenderer;

    onMounted(() => {
      renderer = new CanvasRenderer();
    });

    watch(() => props.page, async (newPage) => {
      if (newPage && canvas.value) {
        await renderer.render(newPage, canvas.value, props.options);
      }
    });

    return { canvas };
  }
});
```

## Performance Tips

### 1. Use Offscreen Canvas for Heavy Processing

```typescript
class OffscreenCanvasRenderer extends CanvasRenderer {
  private offscreenCanvas = new OffscreenCanvas(0, 0);
  
  async render(page: ImagePage, target: HTMLCanvasElement, options?: RenderOptions): Promise<void> {
    // Use offscreen canvas for processing
    this.offscreenCanvas.width = page.imageData.width;
    this.offscreenCanvas.height = page.imageData.height;
    
    const offscreenCtx = this.offscreenCanvas.getContext('2d')!;
    const imageData = new ImageData(
      page.imageData.data,
      page.imageData.width,
      page.imageData.height
    );
    offscreenCtx.putImageData(imageData, 0, 0);
    
    // Transfer to main canvas
    const ctx = target.getContext('2d')!;
    ctx.drawImage(this.offscreenCanvas, 0, 0);
  }
}
```

### 2. Implement Image Caching

```typescript
class CachedCanvasRenderer extends CanvasRenderer {
  private cache = new Map<string, ImageData>();
  
  async render(page: ImagePage, target: HTMLCanvasElement, options?: RenderOptions): Promise<void> {
    const cacheKey = `${page.index}-${page.imageData.width}-${page.imageData.height}`;
    
    if (this.cache.has(cacheKey)) {
      const cachedData = this.cache.get(cacheKey)!;
      this.drawImageData(cachedData, target, options);
    } else {
      await super.render(page, target, options);
      this.cache.set(cacheKey, page.imageData);
    }
  }
}
```

## Related APIs

- [Renderer](/api/renderer) - Abstract base class
- [BrowserFileViewer](/api/browser-file-viewer) - Main viewer class
- [ImagePage](/api/types) - Page interface
- [RenderOptions](/api/types) - Render options interface
