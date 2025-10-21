# API Reference

## BrowserFileViewer

The main class for creating a file viewer instance.

### Constructor

```typescript
new BrowserFileViewer(config: ViewerConfig)
```

#### Parameters

- `config` - Configuration object for the viewer

### Methods

#### `loadFile(file: File): Promise<void>`

Loads and renders a file to the canvas.

**Parameters:**
- `file` - The file to load and render

**Returns:** A promise that resolves when the file is loaded and rendered.

#### `clear(): void`

Clears the canvas.

#### `getStats(): FileStats`

Returns statistics about the currently loaded file.

**Returns:** An object containing file statistics.

### Configuration

```typescript
interface ViewerConfig {
  canvas: HTMLCanvasElement;
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
  backgroundColor?: string;
}
```

### File Stats

```typescript
interface FileStats {
  fileName: string;
  fileSize: number;
  fileType: string;
  width: number;
  height: number;
  loadTime: number;
}
```

## Examples

See the [Usage Guide](/guide/usage) for practical examples.

