# Browser File Viewer Examples

This directory contains example implementations of the browser file viewer library.

## Structure

```
example/
├── api/          # API server for file serving
├── frontend/     # Frontend demo application
└── README.md     # This file
```

## API Server (`example/api/`)

A Node.js Express server that serves files from the local filesystem.

### Features:
- Serves files from the `files/` directory
- CORS enabled for cross-origin requests
- File listing endpoint
- Individual file serving
- MIME type detection

### Setup:
```bash
cd example/api
npm install
npm start
```

The API will be available at `http://localhost:3004`

### Endpoints:
- `GET /api/health` - Health check
- `GET /api/files` - List all files
- `GET /api/files/{filename}` - Get specific file

## Frontend Demo (`example/frontend/`)

A Vite-powered demo application showcasing the browser file viewer library.

### Features:
- Dynamic file listing from API
- Canvas-based image rendering
- Drag and drop support
- File type detection
- Error handling
- TIFF support (including multi-page)

### Setup:
```bash
cd example/frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` (or next available port)

## Running Both Projects

1. **Start the API server:**
   ```bash
   cd example/api
   npm install
   npm start
   ```

2. **Start the frontend (in another terminal):**
   ```bash
   cd example/frontend
   npm install
   npm run dev
   ```

3. **Open your browser** to the frontend URL and test the file viewer!

## Adding Test Files

Place your test image files in `example/api/files/` directory. Supported formats:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- SVG (.svg)
- BMP (.bmp)
- TIFF (.tif, .tiff)
