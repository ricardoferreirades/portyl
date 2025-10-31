# Core Concepts (short)

Portyl cleanly separates three responsibilities:

- Processing: read and parse files into pages/frames
- State: track pagination and status
- Rendering: draw a page onto a target (canvas by default)

Typical flow:
1) `loadFile(file)`
2) optionally navigate pages
3) `renderToTarget(canvas, options)`

For a full architectural walk‑through, see the [API Overview](/api/overview). For exact method signatures and options, see [`BrowserFileViewer`](/api/browser-file-viewer) and [`RenderOptions`](/api/render-options).

