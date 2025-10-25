# RenderOptions

Interface for configuring rendering behavior. Used by renderers to customize how images are displayed.

## Interface

```typescript
interface RenderOptions {
  maxWidth?: number;
  maxHeight?: number;
  showFileInfo?: boolean;
  preserveAspectRatio?: boolean;
  backgroundColor?: string;
  className?: string;
}
```

## Properties

### `maxWidth?: number`

Maximum width for the rendered image in pixels.

**Default:** Canvas width or image width

**Example:**
```typescript
const options: RenderOptions = {
  maxWidth: 800
};
```

### `maxHeight?: number`

Maximum height for the rendered image in pixels.

**Default:** Canvas height or image height

**Example:**
```typescript
const options: RenderOptions = {
  maxHeight: 600
};
```

### `showFileInfo?: boolean`

Whether to display file information overlay on the rendered image.

**Default:** `false`

**Example:**
```typescript
const options: RenderOptions = {
  showFileInfo: true
};
```

### `preserveAspectRatio?: boolean`

Whether to maintain the original aspect ratio when scaling.

**Default:** `true`

**Example:**
```typescript
const options: RenderOptions = {
  preserveAspectRatio: true
};
```

### `backgroundColor?: string`

Background color for the rendered image.

**Default:** `'transparent'`

**Example:**
```typescript
const options: RenderOptions = {
  backgroundColor: '#ffffff'
};
```

### `className?: string`

CSS class name to apply to the rendered element.

**Default:** `undefined`

**Example:**
```typescript
const options: RenderOptions = {
  className: 'rendered-image'
};
```

## Usage Examples

### Basic Rendering

```typescript
import { BrowserFileViewer } from 'portyl';

const viewer = new BrowserFileViewer();
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

await viewer.renderToTarget(canvas, {
  maxWidth: 800,
  maxHeight: 600
});
```

### High-Quality Rendering

```typescript
await viewer.renderToTarget(canvas, {
  maxWidth: 1920,
  maxHeight: 1080,
  preserveAspectRatio: true,
  backgroundColor: '#ffffff',
  showFileInfo: true
});
```

### Thumbnail Rendering

```typescript
await viewer.renderToTarget(canvas, {
  maxWidth: 200,
  maxHeight: 200,
  preserveAspectRatio: true,
  backgroundColor: 'transparent'
});
```

### Custom Styling

```typescript
await viewer.renderToTarget(canvas, {
  maxWidth: 1200,
  maxHeight: 800,
  className: 'gallery-image',
  backgroundColor: '#f5f5f5'
});
```

## Advanced Usage

### Dynamic Options

```typescript
function createRenderOptions(width: number, height: number, showInfo: boolean): RenderOptions {
  return {
    maxWidth: width,
    maxHeight: height,
    showFileInfo: showInfo,
    preserveAspectRatio: true,
    backgroundColor: '#ffffff'
  };
}

const options = createRenderOptions(800, 600, true);
await viewer.renderToTarget(canvas, options);
```

### Responsive Options

```typescript
function getResponsiveOptions(containerWidth: number): RenderOptions {
  const aspectRatio = 16 / 9;
  const maxWidth = Math.min(containerWidth, 1920);
  const maxHeight = maxWidth / aspectRatio;

  return {
    maxWidth,
    maxHeight,
    preserveAspectRatio: true,
    backgroundColor: '#ffffff'
  };
}

const container = document.getElementById('container');
const containerWidth = container.clientWidth;
const options = getResponsiveOptions(containerWidth);
await viewer.renderToTarget(canvas, options);
```

### Performance-Optimized Options

```typescript
const performanceOptions: RenderOptions = {
  maxWidth: 800,
  maxHeight: 600,
  showFileInfo: false,
  preserveAspectRatio: true,
  backgroundColor: 'transparent'
};
```

## Framework Integration

### React Component

```typescript
import React, { useEffect, useRef } from 'react';
import { BrowserFileViewer } from 'portyl';

interface ImageViewerProps {
  file: File;
  maxWidth?: number;
  maxHeight?: number;
  showFileInfo?: boolean;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  file,
  maxWidth = 800,
  maxHeight = 600,
  showFileInfo = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<BrowserFileViewer>();

  useEffect(() => {
    viewerRef.current = new BrowserFileViewer();
    return () => viewerRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (file && viewerRef.current && canvasRef.current) {
      viewerRef.current.loadFile(file).then(result => {
        if (result.success) {
          viewerRef.current.renderToTarget(canvasRef.current, {
            maxWidth,
            maxHeight,
            showFileInfo,
            preserveAspectRatio: true,
            backgroundColor: '#ffffff'
          });
        }
      });
    }
  }, [file, maxWidth, maxHeight, showFileInfo]);

  return <canvas ref={canvasRef} />;
};
```

### Vue Component

```typescript
import { defineComponent, ref, onMounted, watch } from 'vue';
import { BrowserFileViewer } from 'portyl';

export default defineComponent({
  name: 'ImageViewer',
  props: {
    file: {
      type: File,
      required: true
    },
    maxWidth: {
      type: Number,
      default: 800
    },
    maxHeight: {
      type: Number,
      default: 600
    },
    showFileInfo: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const canvas = ref<HTMLCanvasElement>();
    let viewer: BrowserFileViewer;

    onMounted(() => {
      viewer = new BrowserFileViewer();
    });

    watch(() => props.file, async (newFile) => {
      if (newFile && canvas.value) {
        const result = await viewer.loadFile(newFile);
        if (result.success) {
          await viewer.renderToTarget(canvas.value, {
            maxWidth: props.maxWidth,
            maxHeight: props.maxHeight,
            showFileInfo: props.showFileInfo,
            preserveAspectRatio: true,
            backgroundColor: '#ffffff'
          });
        }
      }
    });

    return { canvas };
  }
});
```

## Custom Renderer Options

### Extending RenderOptions

```typescript
interface CustomRenderOptions extends RenderOptions {
  quality?: number;
  format?: 'png' | 'jpeg' | 'webp';
  compression?: number;
}

class CustomRenderer extends CanvasRenderer {
  async render(page: ImagePage, target: HTMLCanvasElement, options?: CustomRenderOptions): Promise<void> {
    // Use custom options
    const quality = options?.quality ?? 0.9;
    const format = options?.format ?? 'png';
    const compression = options?.compression ?? 0.8;

    // Custom rendering logic
    await super.render(page, target, options);
  }
}
```

### Quality-Based Options

```typescript
function getQualityOptions(quality: 'low' | 'medium' | 'high'): RenderOptions {
  switch (quality) {
    case 'low':
      return {
        maxWidth: 400,
        maxHeight: 300,
        showFileInfo: false,
        preserveAspectRatio: true
      };
    case 'medium':
      return {
        maxWidth: 800,
        maxHeight: 600,
        showFileInfo: true,
        preserveAspectRatio: true
      };
    case 'high':
      return {
        maxWidth: 1920,
        maxHeight: 1080,
        showFileInfo: true,
        preserveAspectRatio: true
      };
  }
}
```

## Error Handling

```typescript
try {
  await viewer.renderToTarget(canvas, {
    maxWidth: 800,
    maxHeight: 600,
    showFileInfo: true
  });
} catch (error) {
  console.error('Rendering failed:', error);
  
  // Fallback rendering with minimal options
  await viewer.renderToTarget(canvas, {
    maxWidth: 400,
    maxHeight: 300,
    showFileInfo: false
  });
}
```

## Performance Tips

### 1. Optimize for Different Use Cases

```typescript
// Gallery thumbnails
const thumbnailOptions: RenderOptions = {
  maxWidth: 200,
  maxHeight: 200,
  preserveAspectRatio: true,
  backgroundColor: 'transparent'
};

// Full-size viewing
const fullSizeOptions: RenderOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  preserveAspectRatio: true,
  backgroundColor: '#ffffff',
  showFileInfo: true
};
```

### 2. Progressive Loading

```typescript
async function progressiveRender(viewer: BrowserFileViewer, canvas: HTMLCanvasElement) {
  // Low quality first
  await viewer.renderToTarget(canvas, {
    maxWidth: 400,
    maxHeight: 300,
    showFileInfo: false
  });

  // High quality after
  await viewer.renderToTarget(canvas, {
    maxWidth: 1200,
    maxHeight: 900,
    showFileInfo: true
  });
}
```

## Related APIs

- [Renderer](/api/renderer) - Renderer interface
- [CanvasRenderer](/api/canvas-renderer) - Canvas renderer implementation
- [BrowserFileViewer](/api/browser-file-viewer) - Main viewer class
