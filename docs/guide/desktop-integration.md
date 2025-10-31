# Desktop Integration (brief)

This page shows the minimal patterns for desktop apps. For end‑to‑end examples, see the repository examples and the [API Reference](/api/reference).

## Electron (pattern)

Renderer process:
```typescript
import { BrowserFileViewer } from 'portyl';
import { ipcRenderer } from 'electron';

const viewer = new BrowserFileViewer();
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function openAndShow() {
  const sel = await ipcRenderer.invoke('dialog:openFile');
  if (!sel?.filePath) return;
  const buffer = await ipcRenderer.invoke('fs:readFile', sel.filePath);
  const file = new File([buffer], sel.fileName, { type: sel.mimeType });
  const res = await viewer.loadFile(file);
  if (res.success) await viewer.renderToTarget(canvas);
}
```

Main process (minimal handlers):
```javascript
ipcMain.handle('dialog:openFile', async () => {/* show dialog and return { filePath, fileName, mimeType } */});
ipcMain.handle('fs:readFile', async (_e, filePath) => fs.readFile(filePath));
```

## Tauri (pattern)

```typescript
import { BrowserFileViewer } from 'portyl';
import { open } from '@tauri-apps/api/dialog';
import { readBinaryFile } from '@tauri-apps/api/fs';

const viewer = new BrowserFileViewer();
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

async function openAndShow() {
  const filePath = await open({ multiple: false });
  if (!filePath || Array.isArray(filePath)) return;
  const data = await readBinaryFile(filePath);
  const name = filePath.split('/').pop()!;
  const file = new File([data], name);
  const res = await viewer.loadFile(file);
  if (res.success) await viewer.renderToTarget(canvas);
}
```

For more details, refer to the specific API pages (e.g., [`BrowserFileViewer`](/api/browser-file-viewer), [`RenderOptions`](/api/render-options)).

