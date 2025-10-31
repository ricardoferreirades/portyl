# Usage

This page shows the common flow. For full options and types, see the API pages for [`BrowserFileViewer`](/api/browser-file-viewer), [`RenderOptions`](/api/render-options), and [`ViewerConfig`](/api/viewer-config).

## Basic flow

```typescript
import { BrowserFileViewer } from 'portyl';

const viewer = new BrowserFileViewer();
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function show(file: File) {
  const result = await viewer.loadFile(file);
  if (result.success) {
    await viewer.renderToTarget(canvas);
  }
}
```

## Rendering options (quick)

```typescript
await viewer.renderToTarget(canvas, {
  maxWidth: 800,
  maxHeight: 600,
  preserveAspectRatio: true,
  backgroundColor: '#ffffff'
});
```

See [`RenderOptions`](/api/render-options) for all fields.

## Pagination (multi‑page files like TIFF)

```typescript
await viewer.loadFile(tiffFile);

await viewer.nextPage();
await viewer.previousPage();
await viewer.jumpToPage(5);

const info = viewer.getPaginationInfo();
// { currentPage, totalPages, canGoNext, canGoPrevious }
```

## Configuration updates

```typescript
viewer.updateConfig({
  maxDimensions: { width: 1920, height: 1080 },
  showFileInfo: true
});
```

## DOM helper

Prefer a drop‑in helper? Use `DOMFileViewer` to manage a canvas and simple pagination controls for you.

```typescript
import { DOMFileViewer } from 'portyl';

const viewer = new DOMFileViewer(document.getElementById('viewer')!);
await viewer.loadFile(file);
```

For supported types, call `getSupportedTypes()` or see [`Types`](/api/types).

