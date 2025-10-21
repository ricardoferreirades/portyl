# Core Concepts

Understanding Portyl's architecture and core concepts will help you use the library effectively and build powerful file viewing applications.

## Architecture Overview

Portyl is built around three main concepts:

```
┌─────────────────────────────────────────────────────────┐
│                      File Input                          │
└─────────────────────┬───────────────────────────────────┘
                      │
           ┌──────────▼──────────┐
           │    Processors       │
           │  (FileProcessor)    │
           │  - Load file data   │
           │  - Parse format     │
           │  - Extract pages    │
           └──────────┬──────────┘
                      │
           ┌──────────▼──────────┐
           │  State Management   │
           │  (StateManager)     │
           │  - Current page     │
           │  - Total pages      │
           │  - Loading state    │
           └──────────┬──────────┘
                      │
           ┌──────────▼──────────┐
           │     Renderers       │
           │  (CanvasRenderer)   │
           │  - Draw to canvas   │
           │  - Handle sizing    │
           │  - Apply options    │
           └──────────┬──────────┘
                      │
           ┌──────────▼──────────┐
           │   Canvas Output     │
           └─────────────────────┘
```

## The Three Layers

### 1. Processing Layer

The processing layer handles file loading and data extraction.

**Key Classes:**
- `BrowserFileViewer` - Main entry point
- `FileProcessor` - Abstract base for processors
- `ImageProcessor` - Handles image files

**Responsibilities:**
- Read file data
- Parse file format
- Extract pages/frames
- Validate file type

**Example:**
```typescript
const viewer = new BrowserFileViewer();

// Processing happens here
await viewer.loadFile(file);

// Access processed data
const pages = viewer.getPages();
const currentPage = viewer.getCurrentPage();
```

### 2. State Management Layer

The state management layer tracks the current state of file processing and pagination.

**Key Classes:**
- `StateManager` - Observable state container
- `ProcessorState` - Typed state interface

**Responsibilities:**
- Track current page
- Track total pages
- Manage loading state
- Emit state changes

**Example:**
```typescript
// Get current state
const state = viewer.getState();
console.log(state);
// {
//   totalPages: 10,
//   currentPage: 1,
//   isLoading: false,
//   hasError: false
// }

// Navigate pages (state updates automatically)
await viewer.nextPage();
await viewer.previousPage();
```

### 3. Rendering Layer

The rendering layer transforms processed data into visual output.

**Key Classes:**
- `Renderer` - Abstract renderer interface
- `CanvasRenderer` - Canvas-based implementation

**Responsibilities:**
- Draw image data
- Handle sizing/scaling
- Apply visual options
- Manage canvas state

**Example:**
```typescript
const canvas = document.getElementById('myCanvas');

// Render to canvas
await viewer.renderToTarget(canvas, {
  maxWidth: 800,
  maxHeight: 600,
  preserveAspectRatio: true,
  backgroundColor: '#ffffff'
});
```

## Separation of Concerns

One of Portyl's key design principles is the separation of processing from rendering.

### Why Separate?

**Process Once, Render Many:**
```typescript
// Load and process once
await viewer.loadFile(file);

// Render multiple times
await viewer.renderToTarget(canvas1);
await viewer.renderToTarget(canvas2);
await viewer.renderToTarget(canvas3);
```

**Swap Renderers:**
```typescript
const canvasRenderer = new CanvasRenderer();
const customRenderer = new WebGLRenderer();

// Same processed data, different renderers
await viewer.renderToTarget(target1, {}, canvasRenderer);
await viewer.renderToTarget(target2, {}, customRenderer);
```

**Test Independently:**
```typescript
// Test processing without rendering
const result = await viewer.loadFile(file);
expect(result.success).toBe(true);
expect(result.pageCount).toBe(10);

// Test rendering without real files
const mockPage = createMockPage();
await renderer.render(mockPage, canvas, options);
```

## File Processing Flow

Here's what happens when you load a file:

```typescript
await viewer.loadFile(file);
```

1. **Validation** - Check if file type is supported
2. **Processor Selection** - Choose appropriate processor
3. **File Reading** - Read file data into memory
4. **Format Parsing** - Parse file format (JPEG, PNG, TIFF, etc.)
5. **Page Extraction** - Extract individual pages/frames
6. **State Update** - Update state with page count
7. **Event Emission** - Emit 'loaded' event
8. **Ready** - File ready for rendering

## State Management

Portyl uses an observable state management system.

### State Structure

```typescript
interface ProcessorState {
  totalPages: number;      // Total number of pages
  currentPage: number;     // Current page (1-based)
  isLoading: boolean;      // Is file loading?
  hasError: boolean;       // Did an error occur?
  errorMessage?: string;   // Error message if any
}
```

### Observing State Changes

```typescript
const viewer = new BrowserFileViewer();

// Listen for all state changes
viewer.addEventListener('stateChanged', (event) => {
  console.log('State changed:', event.detail);
});

// Listen for specific events
viewer.addEventListener('pageChanged', (event) => {
  console.log('Page changed to:', event.detail.currentPage);
});

viewer.addEventListener('loaded', () => {
  console.log('File loaded successfully');
});

viewer.addEventListener('error', (event) => {
  console.error('Error:', event.detail.error);
});
```

## Event System

Portyl uses the browser's native `EventTarget` API for events.

### Available Events

| Event | Description | Detail |
|-------|-------------|--------|
| `loaded` | File successfully loaded | `{ pageCount }` |
| `pageChanged` | Current page changed | `{ currentPage, totalPages }` |
| `stateChanged` | Any state property changed | `{ current, previous }` |
| `error` | An error occurred | `{ error }` |

### Event Usage

```typescript
// Add event listener
viewer.addEventListener('pageChanged', (event) => {
  const { currentPage, totalPages } = event.detail;
  updatePaginationUI(currentPage, totalPages);
});

// Remove event listener
const handler = (event) => { /* ... */ };
viewer.addEventListener('loaded', handler);
viewer.removeEventListener('loaded', handler);

// One-time listener
viewer.addEventListener('loaded', handler, { once: true });
```

## Multi-Page Files

Portyl has first-class support for multi-page files.

### Page Navigation

```typescript
// Load multi-page file
await viewer.loadFile(tiffFile);

// Get pagination info
const info = viewer.getPaginationInfo();
// {
//   currentPage: 1,
//   totalPages: 10,
//   canGoNext: true,
//   canGoPrevious: false
// }

// Navigate pages
await viewer.nextPage();       // Go to page 2
await viewer.previousPage();   // Go back to page 1
await viewer.jumpToPage(5);    // Go to page 5
await viewer.navigateToPage(4); // Go to page 5 (0-based index)
```

### Page Data

```typescript
// Get all pages
const pages = viewer.getPages();

// Get current page
const currentPage = viewer.getCurrentPage();
// {
//   index: 0,
//   width: 1920,
//   height: 1080,
//   data: ImageData,
//   metadata: { ... }
// }
```

### Preloading

```typescript
// Configure preloading
const viewer = new BrowserFileViewer({
  enablePagination: true,
  preloadPages: 2  // Preload 2 pages ahead and behind
});
```

## Memory Management

Portyl automatically manages memory to handle large files efficiently.

### Automatic Cleanup

```typescript
// Load a file
await viewer.loadFile(file1);

// Load another file (previous file is automatically cleaned up)
await viewer.loadFile(file2);

// Manual cleanup
viewer.destroy();
```

### Lazy Loading

```typescript
// Pages are loaded on-demand
await viewer.loadFile(largeTiffFile);  // Only loads metadata

// Page data loaded when accessed
await viewer.jumpToPage(50);  // Only this page is loaded
await viewer.renderToTarget(canvas);   // Only this page is rendered
```

## Configuration

Portyl is highly configurable.

### Viewer Configuration

```typescript
const viewer = new BrowserFileViewer({
  // Rendering options
  maxDimensions: { 
    width: 1920, 
    height: 1080 
  },
  preserveAspectRatio: true,
  backgroundColor: 'transparent',
  
  // Pagination options
  enablePagination: true,
  preloadPages: 1,
  
  // UI options
  showFileInfo: false,
  
  // Custom renderer
  renderer: new CanvasRenderer()
});
```

### Render Options

```typescript
await viewer.renderToTarget(canvas, {
  maxWidth: 800,
  maxHeight: 600,
  showFileInfo: true,
  preserveAspectRatio: true,
  backgroundColor: '#ffffff'
});
```

## Type Safety

Portyl is written in TypeScript with full type definitions.

```typescript
import { 
  BrowserFileViewer,
  ViewerConfig,
  LoadResult,
  RenderResult,
  ProcessorState
} from 'portyl';

// Full type inference
const viewer = new BrowserFileViewer();
const result: LoadResult = await viewer.loadFile(file);

// Type-safe configuration
const config: ViewerConfig = {
  maxDimensions: { width: 1920, height: 1080 },
  showFileInfo: true
};
```

## Next Steps

Now that you understand Portyl's core concepts:

- [**File Processing**](/guide/file-processing) - Deep dive into processors
- [**Rendering**](/guide/rendering) - Learn about renderers
- [**State Management**](/guide/state-management) - Master state handling
- [**Event System**](/guide/events) - Work with events
- [**Tutorial**](/tutorial/your-first-viewer) - Build a complete viewer

