# Why Portyl?

Choosing the right file viewing library can significantly impact your application's architecture, performance, and maintainability. Here's why Portyl stands out.

## The Problem

When building web or desktop applications that need to display files, developers often face these challenges:

### 🔴 Monolithic Solutions

Most file viewing libraries couple file processing with rendering, making it difficult to:

- Use different rendering strategies
- Test processing logic independently  
- Reuse processed data across views
- Extend functionality without modification

### 🔴 Framework Lock-In

Many solutions are tightly coupled to specific frameworks:

- Can't switch frameworks without rewriting code
- Incompatible with vanilla JavaScript
- Limited reusability across projects
- Extra dependencies and bundle size

### 🔴 Limited Desktop Support

Web-focused libraries often lack proper desktop integration:

- No file system access patterns
- Missing Electron/Tauri examples
- Browser-only APIs
- No native file handling

### 🔴 Poor Multi-Page Support

Many viewers treat all files as single-page:

- No pagination API
- Manual page management
- Memory inefficient with large files
- Complex state management

## The Portyl Solution

### ✅ Separation of Concerns

Portyl separates file processing from rendering:

```typescript
// Process once
const viewer = new BrowserFileViewer();
await viewer.loadFile(file);

// Render anywhere, anytime
await viewer.renderToTarget(canvas1);
await viewer.renderToTarget(canvas2);
await viewer.renderToTarget(customTarget);
```

**Benefits:**
- Process files once, render multiple times
- Swap renderers without reprocessing
- Test each layer independently
- Extend without modification

### ✅ Truly Framework Agnostic

Works with any framework or no framework:

**Vanilla JavaScript:**
```javascript
const viewer = new BrowserFileViewer();
await viewer.loadFile(file);
```

**React:**
```jsx
const { viewer } = useFileViewer();
await viewer.loadFile(file);
```

**Vue:**
```vue
const viewer = useFileViewer();
await viewer.loadFile(file);
```

**Benefits:**
- One library, any framework
- Migrate frameworks without code changes
- Smaller bundle size
- Future-proof your code

### ✅ Desktop-First Approach

Built with desktop applications in mind:

```typescript
// Electron
const buffer = await ipcRenderer.invoke('fs:readFile', filePath);
const file = new File([buffer], fileName);
await viewer.loadFile(file);

// Tauri
const contents = await readBinaryFile(filePath);
const file = new File([contents], fileName);
await viewer.loadFile(file);
```

**Benefits:**
- File system integration patterns
- Complete Electron/Tauri guides
- Cross-platform examples
- Native performance

### ✅ Built-In Multi-Page Support

First-class pagination API:

```typescript
// Load multi-page TIFF
await viewer.loadFile(tiffFile);

// Navigate pages
await viewer.nextPage();
await viewer.previousPage();
await viewer.jumpToPage(5);

// Get pagination info
const info = viewer.getPaginationInfo();
// { currentPage: 5, totalPages: 10, canGoNext: true, canGoPrevious: true }
```

**Benefits:**
- Simple page navigation
- Automatic preloading
- Memory efficient
- Built-in state management

## Comparison

| Feature | Portyl | Traditional Viewers |
|---------|--------|-------------------|
| Framework Agnostic | ✅ | ❌ Usually tied to one |
| Separation of Concerns | ✅ | ❌ Coupled processing/rendering |
| TypeScript | ✅ Full support | ⚠️ Varies |
| Multi-Page Files | ✅ Built-in | ❌ Manual implementation |
| Desktop Apps | ✅ First-class | ⚠️ Web-only focus |
| Custom Renderers | ✅ Easy | ❌ Difficult |
| Event System | ✅ Comprehensive | ⚠️ Limited |
| Bundle Size | ✅ Lightweight | ⚠️ Often large |
| Testing | ✅ Each layer testable | ❌ Hard to test |

## Real-World Benefits

### Faster Development

```typescript
// Simple API, quick implementation
import { DOMFileViewer } from 'portyl';

const viewer = new DOMFileViewer(container);
await viewer.loadFile(file);
// Done! Pagination, rendering, cleanup all handled
```

### Better Performance

```typescript
// Lazy loading and memory management
const viewer = new BrowserFileViewer({
  preloadPages: 2, // Only load nearby pages
  maxDimensions: { width: 1920, height: 1080 }
});
```

### Easier Testing

```typescript
// Test processing without rendering
const viewer = new BrowserFileViewer();
await viewer.loadFile(file);

const state = viewer.getState();
expect(state.totalPages).toBe(10);
expect(state.currentPage).toBe(1);
```

### Flexible Architecture

```typescript
// Swap renderers at runtime
const canvasRenderer = new CanvasRenderer();
const customRenderer = new WebGLRenderer();

await viewer.renderToTarget(canvas, {}, canvasRenderer);
await viewer.renderToTarget(webgl, {}, customRenderer);
```

## When to Use Portyl

### ✅ Perfect For

- **Web Applications** with file viewing needs
- **Desktop Applications** (Electron, Tauri, NW.js)
- **Cross-platform Tools** needing consistent rendering
- **Enterprise Applications** requiring robust file handling
- **Multi-page Documents** like TIFF files
- **Custom Rendering** requirements

### ⚠️ Consider Alternatives If

- You only need basic `<img>` tags (use native HTML)
- You need video playback (use `<video>` or specialized library)
- You need PDF-specific features (use PDF.js)
- You need 3D file viewing (use Three.js or Babylon.js)

## Getting Started

Ready to try Portyl?

1. [**Installation**](/guide/installation) - Add Portyl to your project
2. [**Your First Viewer**](/tutorial/your-first-viewer) - Build a viewer in 5 minutes
3. [**Core Concepts**](/guide/core-concepts) - Understand the architecture
4. [**Examples**](/examples/overview) - See Portyl in action

## Questions?

- Check the [**FAQ**](/guide/faq)
- Read the [**Troubleshooting Guide**](/guide/troubleshooting)
- Ask on [**GitHub Discussions**](https://github.com/ricardoferreirades/portyl/discussions)

