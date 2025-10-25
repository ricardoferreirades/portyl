# FileProcessor

Abstract base class for file processors. This class defines the contract for processing different file types and provides common functionality for state management and navigation.

## Abstract Methods

### `canHandle(file: File): boolean`

Determines if this processor can handle the given file.

**Parameters:**
- `file` - The file to check

**Returns:** `boolean` - `true` if the file can be processed

**Example:**
```typescript
class CustomProcessor extends FileProcessor {
  canHandle(file: File): boolean {
    return file.type.startsWith('image/');
  }
}
```

### `loadFile(file: File): Promise<void>`

Loads and processes a file.

**Parameters:**
- `file` - The file to load

**Throws:** `Error` if loading fails

**Example:**
```typescript
class CustomProcessor extends FileProcessor {
  async loadFile(file: File): Promise<void> {
    // Implementation for loading the file
    // Update state through stateManager
  }
}
```

### `getPages(): ImagePage[]`

Gets all loaded pages.

**Returns:** `ImagePage[]` - Array of image pages

**Example:**
```typescript
class CustomProcessor extends FileProcessor {
  getPages(): ImagePage[] {
    return this.pages;
  }
}
```

### `getCurrentPage(): ImagePage | null`

Gets the currently active page.

**Returns:** `ImagePage | null` - Current page or `null` if no pages

**Example:**
```typescript
class CustomProcessor extends FileProcessor {
  getCurrentPage(): ImagePage | null {
    const state = this.getState();
    return this.pages[state.currentPage] || null;
  }
}
```

### `navigateToPage(index: number): Promise<void>`

Navigates to a specific page.

**Parameters:**
- `index` - Page index (0-based)

**Throws:** `Error` if navigation fails

**Example:**
```typescript
class CustomProcessor extends FileProcessor {
  async navigateToPage(index: number): Promise<void> {
    const state = this.getState();
    if (index < 0 || index >= state.totalPages) {
      throw new Error('Invalid page index');
    }
    
    // Update current page in state
    this.stateManager.setState(prev => ({
      ...prev,
      currentPage: index
    }), 'navigateToPage');
  }
}
```

## Concrete Methods

### `getState(): ProcessorState`

Gets the current processor state.

**Returns:** `ProcessorState` - Current state

**Example:**
```typescript
const state = processor.getState();
console.log(`Current page: ${state.currentPage + 1}/${state.totalPages}`);
```

### `subscribe(listener: StateListener): Unsubscribe`

Subscribes to state changes.

**Parameters:**
- `listener` - State change listener function

**Returns:** `Unsubscribe` - Unsubscribe function

**Example:**
```typescript
const unsubscribe = processor.subscribe((current, previous) => {
  console.log('State changed:', current);
});

// Later, unsubscribe
unsubscribe();
```

### `nextPage(): Promise<void>`

Navigates to the next page.

**Example:**
```typescript
await processor.nextPage();
```

### `previousPage(): Promise<void>`

Navigates to the previous page.

**Example:**
```typescript
await processor.previousPage();
```

### `canGoNext(): boolean`

Checks if can navigate to next page.

**Returns:** `boolean` - `true` if can go next

**Example:**
```typescript
if (processor.canGoNext()) {
  await processor.nextPage();
}
```

### `canGoPrevious(): boolean`

Checks if can navigate to previous page.

**Returns:** `boolean` - `true` if can go previous

**Example:**
```typescript
if (processor.canGoPrevious()) {
  await processor.previousPage();
}
```

### `getPaginationInfo(): PaginationInfo | null`

Gets pagination information.

**Returns:** `PaginationInfo | null` - Pagination info or `null` if no file loaded

**Example:**
```typescript
const pagination = processor.getPaginationInfo();
if (pagination) {
  console.log(`Page ${pagination.currentPage} of ${pagination.totalPages}`);
}
```

### `setEventTarget(eventTarget: EventTarget): void`

Sets the event target for event forwarding.

**Parameters:**
- `eventTarget` - Event target to forward events to

**Example:**
```typescript
processor.setEventTarget(viewer);
```

### `destroy(): void`

Cleans up resources.

**Example:**
```typescript
processor.destroy();
```

## Data Structures

### `ImageData`

```typescript
interface ImageData {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  format: 'rgba' | 'rgb';
}
```

### `ImagePage`

```typescript
interface ImagePage {
  index: number;
  imageData: ImageData;
  metadata?: Record<string, any>;
}
```

### `ProcessorState`

```typescript
interface ProcessorState {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  // ... other state properties
}
```

## Creating a Custom Processor

```typescript
import { FileProcessor, ImagePage, ImageData } from 'portyl';

class CustomImageProcessor extends FileProcessor {
  private pages: ImagePage[] = [];

  canHandle(file: File): boolean {
    return file.type.startsWith('image/');
  }

  async loadFile(file: File): Promise<void> {
    try {
      // Set loading state
      this.stateManager.setState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }), 'loadFile');

      // Process the file
      const imageData = await this.processImage(file);
      
      // Create pages
      this.pages = [{
        index: 0,
        imageData,
        metadata: {
          fileName: file.name,
          fileSize: file.size
        }
      }];

      // Update state
      this.stateManager.setState(prev => ({
        ...prev,
        isLoading: false,
        totalPages: this.pages.length,
        currentPage: 0
      }), 'loadFile');

    } catch (error) {
      this.stateManager.setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }), 'loadFile');
      throw error;
    }
  }

  getPages(): ImagePage[] {
    return this.pages;
  }

  getCurrentPage(): ImagePage | null {
    const state = this.getState();
    return this.pages[state.currentPage] || null;
  }

  async navigateToPage(index: number): Promise<void> {
    const state = this.getState();
    if (index < 0 || index >= state.totalPages) {
      throw new Error('Invalid page index');
    }

    this.stateManager.setState(prev => ({
      ...prev,
      currentPage: index
    }), 'navigateToPage');
  }

  private async processImage(file: File): Promise<ImageData> {
    // Custom image processing logic
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve({
          width: canvas.width,
          height: canvas.height,
          data: imageData.data,
          format: 'rgba'
        });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}
```

## Event System

The FileProcessor automatically forwards state changes as events:

### Events Dispatched

- **`stateChange`** - When state changes
- **`loadingStart`** - When loading begins
- **`loadingEnd`** - When loading completes
- **`pageChanged`** - When page changes
- **`error`** - When an error occurs
- **`loaded`** - When file is successfully loaded

### Event Handling Example

```typescript
const processor = new CustomImageProcessor();

// Listen for state changes
processor.subscribe((current, previous) => {
  console.log('State changed:', current);
});

// Set up event forwarding
processor.setEventTarget(viewer);

// Load a file
await processor.loadFile(file);
```

## State Management

The FileProcessor uses an immutable state pattern:

```typescript
// Update state immutably
this.stateManager.setState(prev => ({
  ...prev,
  currentPage: newPage,
  isLoading: false
}), 'navigateToPage');
```

## Error Handling

```typescript
try {
  await processor.loadFile(file);
} catch (error) {
  console.error('Processor error:', error.message);
  
  // Check if error is in state
  const state = processor.getState();
  if (state.error) {
    console.error('State error:', state.error);
  }
}
```

## Memory Management

```typescript
// Clean up resources
processor.destroy();

// Unsubscribe from state changes
const unsubscribe = processor.subscribe(listener);
unsubscribe();
```

## Related APIs

- [ImageProcessor](/api/image-processor) - Concrete image processor
- [ProcessorStateManager](/api/state-manager) - State management
- [ImagePage](/api/types) - Page interface
- [ImageData](/api/types) - Image data interface
