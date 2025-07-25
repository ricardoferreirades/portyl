// Main API - Framework-agnostic core
export { BrowserFileViewer } from './BrowserFileViewer';

// Core processors and renderers
export { FileProcessor, ImagePage, ImageData, ProcessorState } from './core/processors/FileProcessor';
export { ImageProcessor } from './core/processors/ImageProcessor';
export { Renderer, RenderOptions, RenderTarget } from './core/renderers/Renderer';
export { CanvasRenderer } from './core/renderers/CanvasRenderer';

// DOM adapter for easy integration
export { DOMFileViewer } from './adapters/DOMFileViewer';

// Type exports
export type {
  ViewerConfig, 
  LoadResult, 
  RenderResult, 
  FileInfo
} from './types';

export { FileType } from './types';

// Utility exports
export { FileUtils } from './utils';

// Default export
export { BrowserFileViewer as default } from './BrowserFileViewer';
