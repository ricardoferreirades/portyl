# Types Reference

Complete reference of all TypeScript types and interfaces used in Portyl.

## Core Types

### `FileType`

Enumeration of supported file types.

```typescript
enum FileType {
  IMAGE = 'image'
  // Future: VIDEO, AUDIO, DOCUMENT, etc.
}
```

### `ViewerConfig`

Configuration interface for BrowserFileViewer.

```typescript
interface ViewerConfig {
  maxDimensions?: { width: number; height: number };
  showFileInfo?: boolean;
  enablePagination?: boolean;
  preloadPages?: number;
  renderer?: Renderer;
  backgroundColor?: string;
  preserveAspectRatio?: boolean;
}
```

### `FileInfo`

File information interface.

```typescript
interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified?: Date;
}
```

### `LoadResult`

Result interface for file loading operations.

```typescript
interface LoadResult {
  success: boolean;
  error?: string;
  pageCount?: number;
  fileInfo?: FileInfo;
}
```

### `RenderResult`

Result interface for rendering operations.

```typescript
interface RenderResult {
  success: boolean;
  error?: string;
  element?: HTMLElement;
}
```

## Processor Types

### `ImageData`

Image data structure.

```typescript
interface ImageData {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  format: 'rgba' | 'rgb';
}
```

### `ImagePage`

Image page structure.

```typescript
interface ImagePage {
  index: number;
  imageData: ImageData;
  metadata?: Record<string, any>;
}
```

### `ProcessorState`

Processor state interface.

```typescript
interface ProcessorState {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}
```

## Renderer Types

### `RenderOptions`

Rendering options interface.

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

### `RenderTarget`

Render target interface.

```typescript
interface RenderTarget {
  width: number;
  height: number;
}
```

## State Management Types

### `StateListener<T>`

State change listener type.

```typescript
type StateListener<T> = (current: T, previous: T) => void;
```

### `Unsubscribe`

Unsubscribe function type.

```typescript
type Unsubscribe = () => void;
```

### `StateUpdater<T>`

State updater function type.

```typescript
type StateUpdater<T> = (previous: T) => T;
```

### `StateTransition<T>`

State transition record type.

```typescript
interface StateTransition<T> {
  readonly previous: T;
  readonly current: T;
  readonly timestamp: number;
  readonly source: string;
}
```

## Configuration Types

### `BrowserFileViewerConfig`

Complete configuration interface.

```typescript
interface BrowserFileViewerConfig {
  maxDimensions: { width: number; height: number };
  ui: {
    pagination: { enabled: boolean };
    fileInfo: { enabled: boolean };
    animations: { enabled: boolean };
  };
  performance: {
    memoryLimit: number;
    cacheStrategy: 'minimal' | 'aggressive' | 'balanced';
    preloadPages: number;
  };
  rendering: {
    engine: 'canvas' | 'webgl';
    pixelRatio: number;
  };
  state: {
    historySize: number;
  };
}
```

### `PartialConfig`

Partial configuration type.

```typescript
type PartialConfig = Partial<BrowserFileViewerConfig>;
```

### `ValidationResult`

Configuration validation result.

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

### `ValidationError`

Configuration validation error.

```typescript
interface ValidationError {
  path: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}
```

### `ValidationWarning`

Configuration validation warning.

```typescript
interface ValidationWarning {
  path: string;
  message: string;
  code: string;
  severity: 'warning';
}
```

### `ConfigChangeListener`

Configuration change listener type.

```typescript
type ConfigChangeListener = (
  path: string,
  newValue: any,
  oldValue: any,
  config: BrowserFileViewerConfig
) => void;
```

## Utility Types

### `PaginationInfo`

Pagination information interface.

```typescript
interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
}
```

## Event Types

### `ViewerEvents`

Viewer event types.

```typescript
interface ViewerEvents {
  loaded: {
    totalPages: number;
    state: ProcessorState;
  };
  pageChanged: {
    currentPage: number;
    totalPages: number;
  };
  loadingStart: ProcessorState;
  loadingEnd: ProcessorState;
  error: {
    error: string;
  };
  stateChange: {
    current: ProcessorState;
    previous: ProcessorState;
  };
}
```

## Generic Types

### `Optional<T, K extends keyof T>`

Makes specific properties optional.

```typescript
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
```

### `Required<T, K extends keyof T>`

Makes specific properties required.

```typescript
type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };
```

### `DeepPartial<T>`

Makes all properties deeply partial.

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

## Type Guards

### `isImageFile(file: File): boolean`

Type guard for image files.

```typescript
function isImageFile(file: File): file is File & { type: string } {
  return file.type.startsWith('image/');
}
```

### `isValidImageData(data: any): data is ImageData`

Type guard for image data.

```typescript
function isValidImageData(data: any): data is ImageData {
  return (
    data &&
    typeof data.width === 'number' &&
    typeof data.height === 'number' &&
    data.data instanceof Uint8ClampedArray &&
    (data.format === 'rgba' || data.format === 'rgb')
  );
}
```

## Usage Examples

### Type-Safe Configuration

```typescript
import type { ViewerConfig, LoadResult, RenderResult } from 'portyl';

function createViewer(config: ViewerConfig): BrowserFileViewer {
  return new BrowserFileViewer(config);
}

async function loadAndRender(
  viewer: BrowserFileViewer,
  file: File
): Promise<{ load: LoadResult; render: RenderResult }> {
  const loadResult = await viewer.loadFile(file);
  
  if (!loadResult.success) {
    return { load: loadResult, render: { success: false, error: loadResult.error } };
  }
  
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const renderResult = await viewer.renderToTarget(canvas);
  
  return { load: loadResult, render: renderResult };
}
```

### Generic State Management

```typescript
import type { StateManager, StateListener, Unsubscribe } from 'portyl';

class TypedStateManager<T> {
  private stateManager: StateManager<T>;
  
  constructor(initialState: T) {
    this.stateManager = new StateManager(initialState);
  }
  
  getState(): T {
    return this.stateManager.getState();
  }
  
  setState(updater: (prev: T) => T): T {
    return this.stateManager.setState(updater);
  }
  
  subscribe(listener: StateListener<T>): Unsubscribe {
    return this.stateManager.subscribe(listener);
  }
}
```

### Configuration Type Safety

```typescript
import type { BrowserFileViewerConfig, PartialConfig } from 'portyl';

function updateConfiguration(
  config: BrowserFileViewerConfig,
  updates: PartialConfig
): BrowserFileViewerConfig {
  return { ...config, ...updates };
}

function validateConfiguration(config: PartialConfig): boolean {
  // Type-safe configuration validation
  if (config.maxDimensions) {
    return config.maxDimensions.width > 0 && config.maxDimensions.height > 0;
  }
  return true;
}
```

## Related APIs

- [BrowserFileViewer](/api/browser-file-viewer) - Main viewer class
- [FileProcessor](/api/file-processor) - Processor interface
- [Renderer](/api/renderer) - Renderer interface
- [StateManager](/api/state-manager) - State management
