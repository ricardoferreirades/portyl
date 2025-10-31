# Getting Started

Use this page to set up Portyl quickly. For deeper options, refer to the [API Reference](/api/reference).

## Quick Start

### Installation

```bash
npm install portyl
```

### Minimal browser example (canvas)

```typescript
import { BrowserFileViewer } from 'portyl';

const viewer = new BrowserFileViewer();
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

document.getElementById('file-input')!.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const result = await viewer.loadFile(file);
  if (result.success) {
    await viewer.renderToTarget(canvas);
  }
});
```

### DOM helper (optional)

If you prefer a helper that manages a canvas and simple pagination UI, use `DOMFileViewer`:

```typescript
import { DOMFileViewer } from 'portyl';

const container = document.getElementById('viewer')!;
const viewer = new DOMFileViewer(container);

document.getElementById('file-input')!.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    await viewer.loadFile(file);
  }
});
```

## What next?
- Desktop apps: see [Desktop Integration](/guide/desktop-integration)
- Options and types: see [API Reference](/api/reference) and [API Overview](/api/overview)

## Troubleshooting
- If rendering doesn’t show, ensure you called `loadFile` before `renderToTarget` and your `<canvas>` has width/height.

