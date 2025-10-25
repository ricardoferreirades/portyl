# BrowserFileViewer

The main class for creating a file viewer instance. This is the core component that handles file processing, state management, and rendering coordination.

## Constructor

```typescript
new BrowserFileViewer(config?: ViewerConfig)
```

### Parameters

- `config` (optional) - Configuration object for the viewer. See [ViewerConfig](/api/viewer-config) for details.

## Properties

### `config: ViewerConfig`
Current configuration (read-only)

### `defaultRenderer: Renderer`
Default renderer instance

## Methods

### `canHandle(file: File): boolean`

Checks if a file can be processed by the viewer.

**Parameters:**
- `file` - The file to check

**Returns:** `boolean` - `true` if the file can be processed

**Example:**
```typescript
const viewer = new BrowserFileViewer();
const canProcess = viewer.canHandle(file);
if (canProcess) {
  await viewer.loadFile(file);
}
```

### `loadFile(file: File): Promise<LoadResult>`

Loads and processes a file. This method performs pure data processing without rendering.

**Parameters:**
- `file` - The file to load and process

**Returns:** `Promise<LoadResult>` - Result object containing success status and metadata

**Example:**
```typescript
const result = await viewer.loadFile(file);
if (result.success) {
  console.log(`Loaded ${result.pageCount} pages`);
  console.log('File info:', result.fileInfo);
} else {
  console.error('Load failed:', result.error);
}
```

### `getState(): ProcessorState | null`

Gets the current processor state.

**Returns:** `ProcessorState | null` - Current state or `null` if no file is loaded

**Example:**
```typescript
const state = viewer.getState();
if (state) {
  console.log(`Current page: ${state.currentPage + 1}/${state.totalPages}`);
  console.log('Loading:', state.isLoading);
}
```

### `getPages(): ImagePage[]`

Gets all loaded pages.

**Returns:** `ImagePage[]` - Array of image pages

**Example:**
```typescript
const pages = viewer.getPages();
console.log(`Total pages: ${pages.length}`);
```

### `getCurrentPage(): ImagePage | null`

Gets the currently active page.

**Returns:** `ImagePage | null` - Current page or `null` if no file is loaded

**Example:**
```typescript
const currentPage = viewer.getCurrentPage();
if (currentPage) {
  console.log(`Page ${currentPage.index + 1} dimensions: ${currentPage.imageData.width}x${currentPage.imageData.height}`);
}
```

### `navigateToPage(index: number): Promise<void>`

Navigates to a specific page (0-based index).

**Parameters:**
- `index` - Page index (0-based)

**Throws:** `Error` if no file is loaded

**Example:**
```typescript
// Navigate to first page
await viewer.navigateToPage(0);

// Navigate to last page
const state = viewer.getState();
if (state) {
  await viewer.navigateToPage(state.totalPages - 1);
}
```

### `nextPage(): Promise<void>`

Navigates to the next page.

**Throws:** `Error` if no file is loaded

**Example:**
```typescript
await viewer.nextPage();
```

### `previousPage(): Promise<void>`

Navigates to the previous page.

**Throws:** `Error` if no file is loaded

**Example:**
```typescript
await viewer.previousPage();
```

### `jumpToPage(pageNumber: number): Promise<void>`

Jumps to a specific page (1-based index for UI convenience).

**Parameters:**
- `pageNumber` - Page number (1-based)

**Example:**
```typescript
// Jump to page 5 (1-based)
await viewer.jumpToPage(5);
```

### `getPaginationInfo(): PaginationInfo | null`

Gets pagination information.

**Returns:** `PaginationInfo | null` - Pagination info or `null` if no file is loaded

**Example:**
```typescript
const pagination = viewer.getPaginationInfo();
if (pagination) {
  console.log(`Page ${pagination.currentPage} of ${pagination.totalPages}`);
  console.log('Can go next:', pagination.canGoNext);
  console.log('Can go previous:', pagination.canGoPrevious);
}
```

### `renderToTarget<T extends RenderTarget>(target: T, options?: RenderOptions, renderer?: Renderer): Promise<RenderResult>`

Renders the current page to a target (optional rendering).

**Parameters:**
- `target` - Render target (e.g., HTMLCanvasElement)
- `options` (optional) - Rendering options
- `renderer` (optional) - Custom renderer to use

**Returns:** `Promise<RenderResult>` - Rendering result

**Example:**
```typescript
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const result = await viewer.renderToTarget(canvas, {
  maxWidth: 800,
  maxHeight: 600,
  preserveAspectRatio: true
});

if (!result.success) {
  console.error('Render failed:', result.error);
}
```

### `getSupportedTypes(): string[]`

Gets list of supported MIME types.

**Returns:** `string[]` - Array of supported MIME types

**Example:**
```typescript
const supportedTypes = viewer.getSupportedTypes();
console.log('Supported types:', supportedTypes);
// ['image/jpeg', 'image/png', 'image/gif', ...]
```

### `getFileInfo(file: File): FileInfo`

Gets file information (utility method).

**Parameters:**
- `file` - File object

**Returns:** `FileInfo` - File information object

**Example:**
```typescript
const fileInfo = viewer.getFileInfo(file);
console.log(`File: ${fileInfo.name} (${fileInfo.size} bytes)`);
```

### `formatFileSize(bytes: number): string`

Formats file size in human-readable format (utility method).

**Parameters:**
- `bytes` - File size in bytes

**Returns:** `string` - Formatted file size

**Example:**
```typescript
const formattedSize = viewer.formatFileSize(1048576);
console.log(formattedSize); // "1 MB"
```

### `updateConfig(newConfig: Partial<ViewerConfig>): void`

Updates the viewer configuration.

**Parameters:**
- `newConfig` - Partial configuration object

**Example:**
```typescript
viewer.updateConfig({
  maxDimensions: { width: 1600, height: 1200 },
  showFileInfo: true
});
```

### `destroy(): void`

Cleans up resources and destroys the viewer instance.

**Example:**
```typescript
// Clean up when done
viewer.destroy();
```

## Static Methods

### `create(config?: ViewerConfig): BrowserFileViewer`

Creates a new viewer instance (factory method).

**Parameters:**
- `config` (optional) - Configuration object

**Returns:** `BrowserFileViewer` - New viewer instance

**Example:**
```typescript
const viewer = BrowserFileViewer.create({
  maxDimensions: { width: 1920, height: 1080 }
});
```

## Events

The BrowserFileViewer extends EventTarget and dispatches the following events:

### `loaded`
Dispatched when a file is successfully loaded.

**Event Detail:**
```typescript
{
  totalPages: number;
  state: ProcessorState;
}
```

### `pageChanged`
Dispatched when the current page changes.

**Event Detail:**
```typescript
{
  currentPage: number;
  totalPages: number;
}
```

### `loadingStart`
Dispatched when file loading begins.

### `loadingEnd`
Dispatched when file loading completes.

### `error`
Dispatched when an error occurs.

**Event Detail:**
```typescript
{
  error: string;
}
```

### `stateChange`
Dispatched when the processor state changes.

**Event Detail:**
```typescript
{
  current: ProcessorState;
  previous: ProcessorState;
}
```

## Event Handling Example

```typescript
const viewer = new BrowserFileViewer();

// Listen for file loaded
viewer.addEventListener('loaded', (event) => {
  console.log(`File loaded with ${event.detail.totalPages} pages`);
});

// Listen for page changes
viewer.addEventListener('pageChanged', (event) => {
  console.log(`Now viewing page ${event.detail.currentPage}`);
});

// Listen for errors
viewer.addEventListener('error', (event) => {
  console.error('Viewer error:', event.detail.error);
});

// Load a file
await viewer.loadFile(file);
```

## Complete Example

```typescript
import { BrowserFileViewer } from 'portyl';

// Create viewer with configuration
const viewer = new BrowserFileViewer({
  maxDimensions: { width: 1920, height: 1080 },
  showFileInfo: true,
  enablePagination: true,
  preserveAspectRatio: true
});

// Set up event listeners
viewer.addEventListener('loaded', () => {
  console.log('File loaded successfully');
});

viewer.addEventListener('pageChanged', (event) => {
  updatePaginationUI(event.detail);
});

// Load and render a file
const file = document.getElementById('fileInput').files[0];
const loadResult = await viewer.loadFile(file);

if (loadResult.success) {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  await viewer.renderToTarget(canvas);
  
  // Set up pagination controls
  setupPaginationControls();
}

// Clean up when done
viewer.destroy();
```

## Related APIs

- [ViewerConfig](/api/viewer-config) - Configuration interface
- [LoadResult](/api/types) - Load result interface
- [RenderResult](/api/types) - Render result interface
- [ProcessorState](/api/types) - State interface
- [DOMFileViewer](/api/dom-file-viewer) - DOM adapter
