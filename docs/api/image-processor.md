# ImageProcessor

Concrete implementation of FileProcessor for handling image files. Supports JPEG, PNG, GIF, WebP, SVG, BMP, and TIFF formats including multi-page TIFF files.

## Constructor

```typescript
new ImageProcessor(stateManager?: ProcessorStateManager)
```

### Parameters

- `stateManager` (optional) - Custom state manager instance

## Supported Formats

- **JPEG** - `.jpg`, `.jpeg`
- **PNG** - `.png`
- **GIF** - `.gif` (including animated GIFs)
- **WebP** - `.webp`
- **SVG** - `.svg`
- **BMP** - `.bmp`
- **TIFF** - `.tiff`, `.tif` (including multi-page TIFF)

## Methods

### `canHandle(file: File): boolean`

Checks if the file is a supported image format.

**Parameters:**
- `file` - The file to check

**Returns:** `boolean` - `true` if the file can be processed

**Example:**
```typescript
const processor = new ImageProcessor();
const canProcess = processor.canHandle(file);
if (canProcess) {
  await processor.loadFile(file);
}
```

### `loadFile(file: File): Promise<void>`

Loads and processes an image file.

**Parameters:**
- `file` - The image file to load

**Throws:** `Error` if loading fails

**Example:**
```typescript
const processor = new ImageProcessor();
try {
  await processor.loadFile(file);
  console.log('Image loaded successfully');
} catch (error) {
  console.error('Failed to load image:', error.message);
}
```

### `getPages(): ImagePage[]`

Gets all loaded image pages.

**Returns:** `ImagePage[]` - Array of image pages

**Example:**
```typescript
const pages = processor.getPages();
console.log(`Loaded ${pages.length} pages`);
pages.forEach((page, index) => {
  console.log(`Page ${index + 1}: ${page.imageData.width}x${page.imageData.height}`);
});
```

### `getCurrentPage(): ImagePage | null`

Gets the currently active page.

**Returns:** `ImagePage | null` - Current page or `null` if no pages

**Example:**
```typescript
const currentPage = processor.getCurrentPage();
if (currentPage) {
  console.log(`Current page: ${currentPage.index + 1}`);
  console.log(`Dimensions: ${currentPage.imageData.width}x${currentPage.imageData.height}`);
}
```

### `navigateToPage(index: number): Promise<void>`

Navigates to a specific page.

**Parameters:**
- `index` - Page index (0-based)

**Throws:** `Error` if navigation fails

**Example:**
```typescript
// Navigate to first page
await processor.navigateToPage(0);

// Navigate to last page
const state = processor.getState();
await processor.navigateToPage(state.totalPages - 1);
```

## Multi-page Support

### TIFF Files

The ImageProcessor supports multi-page TIFF files:

```typescript
const processor = new ImageProcessor();
await processor.loadFile(tiffFile);

const pages = processor.getPages();
console.log(`TIFF has ${pages.length} pages`);

// Navigate through pages
for (let i = 0; i < pages.length; i++) {
  await processor.navigateToPage(i);
  const page = processor.getCurrentPage();
  console.log(`Page ${i + 1}: ${page.imageData.width}x${page.imageData.height}`);
}
```

### Animated GIFs

Animated GIFs are treated as multi-page images:

```typescript
const processor = new ImageProcessor();
await processor.loadFile(animatedGifFile);

const pages = processor.getPages();
console.log(`GIF has ${pages.length} frames`);

// Navigate through frames
await processor.navigateToPage(0); // First frame
await processor.navigateToPage(pages.length - 1); // Last frame
```

## Image Data Format

The processor converts all images to a standardized format:

```typescript
interface ImageData {
  width: number;           // Image width in pixels
  height: number;          // Image height in pixels
  data: Uint8ClampedArray; // RGBA pixel data
  format: 'rgba' | 'rgb';  // Color format
}
```

## Metadata

Each page includes metadata:

```typescript
interface ImagePage {
  index: number;
  imageData: ImageData;
  metadata?: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    // Additional format-specific metadata
  };
}
```

## Error Handling

The processor provides detailed error information:

```typescript
try {
  await processor.loadFile(file);
} catch (error) {
  console.error('Image processing error:', error.message);
  
  // Check state for additional error details
  const state = processor.getState();
  if (state.error) {
    console.error('State error:', state.error);
  }
}
```

## Performance Considerations

### Memory Management

The processor automatically manages memory for large images:

```typescript
// Large images are processed efficiently
const processor = new ImageProcessor();
await processor.loadFile(largeImageFile);

// Memory is cleaned up on destroy
processor.destroy();
```

### Lazy Loading

For multi-page images, pages are loaded on demand:

```typescript
const processor = new ImageProcessor();
await processor.loadFile(multiPageTiff);

// Only current page is fully loaded
const currentPage = processor.getCurrentPage();

// Navigate to load other pages
await processor.navigateToPage(1);
```

## Event Handling

The processor dispatches events for state changes:

```typescript
const processor = new ImageProcessor();

// Listen for loading events
processor.subscribe((current, previous) => {
  if (current.isLoading !== previous.isLoading) {
    console.log(current.isLoading ? 'Loading started' : 'Loading completed');
  }
  
  if (current.currentPage !== previous.currentPage) {
    console.log(`Page changed to ${current.currentPage + 1}`);
  }
});

// Set up event forwarding
processor.setEventTarget(viewer);
```

## Complete Example

```typescript
import { ImageProcessor } from 'portyl';

// Create processor
const processor = new ImageProcessor();

// Set up event handling
processor.subscribe((current, previous) => {
  console.log('State changed:', current);
});

// Load an image
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (file) {
    try {
      await processor.loadFile(file);
      
      const pages = processor.getPages();
      console.log(`Loaded ${pages.length} pages`);
      
      // Display first page
      const firstPage = processor.getCurrentPage();
      if (firstPage) {
        displayImage(firstPage);
      }
      
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  }
});

// Navigation controls
document.getElementById('nextBtn').addEventListener('click', async () => {
  if (processor.canGoNext()) {
    await processor.nextPage();
    const page = processor.getCurrentPage();
    if (page) {
      displayImage(page);
    }
  }
});

document.getElementById('prevBtn').addEventListener('click', async () => {
  if (processor.canGoPrevious()) {
    await processor.previousPage();
    const page = processor.getCurrentPage();
    if (page) {
      displayImage(page);
    }
  }
});

function displayImage(page: ImagePage) {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = page.imageData.width;
  canvas.height = page.imageData.height;
  
  const imageData = new ImageData(
    page.imageData.data,
    page.imageData.width,
    page.imageData.height
  );
  
  ctx.putImageData(imageData, 0, 0);
}

// Clean up
window.addEventListener('beforeunload', () => {
  processor.destroy();
});
```

## React Integration

```typescript
import React, { useEffect, useRef, useState } from 'react';
import { ImageProcessor } from 'portyl';

interface ImageViewerProps {
  file: File | null;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ file }) => {
  const processorRef = useRef<ImageProcessor>();
  const [currentPage, setCurrentPage] = useState<ImagePage | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    processorRef.current = new ImageProcessor();
    
    processorRef.current.subscribe((state) => {
      setTotalPages(state.totalPages);
      if (state.totalPages > 0) {
        const page = processorRef.current?.getCurrentPage();
        setCurrentPage(page || null);
      }
    });

    return () => {
      processorRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (file && processorRef.current) {
      processorRef.current.loadFile(file);
    }
  }, [file]);

  const nextPage = async () => {
    if (processorRef.current?.canGoNext()) {
      await processorRef.current.nextPage();
    }
  };

  const previousPage = async () => {
    if (processorRef.current?.canGoPrevious()) {
      await processorRef.current.previousPage();
    }
  };

  return (
    <div>
      {currentPage && (
        <div>
          <canvas 
            width={currentPage.imageData.width}
            height={currentPage.imageData.height}
            ref={(canvas) => {
              if (canvas && currentPage) {
                const ctx = canvas.getContext('2d')!;
                const imageData = new ImageData(
                  currentPage.imageData.data,
                  currentPage.imageData.width,
                  currentPage.imageData.height
                );
                ctx.putImageData(imageData, 0, 0);
              }
            }}
          />
          {totalPages > 1 && (
            <div>
              <button onClick={previousPage}>Previous</button>
              <span>Page {processorRef.current?.getState().currentPage + 1} of {totalPages}</span>
              <button onClick={nextPage}>Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

## Related APIs

- [FileProcessor](/api/file-processor) - Abstract base class
- [ImagePage](/api/types) - Page interface
- [ImageData](/api/types) - Image data interface
- [ProcessorState](/api/types) - State interface
