import { BrowserFileViewer, DOMFileViewer } from '../index';
import { ViewerConfig } from '../types';

// Mock UTIF library
jest.mock('utif', () => ({
  decode: jest.fn(),
  decodeImage: jest.fn(),
  toRGBA8: jest.fn(),
}));

// Mock ImageData constructor
(global as any).ImageData = class {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  
  constructor(data: Uint8ClampedArray, width: number, height: number) {
    this.data = data;
    this.width = width;
    this.height = height;
  }
};

// Setup DOM environment
if (typeof window === 'undefined') {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  (global as any).window = dom.window;
  (global as any).document = dom.window.document;
  (global as any).navigator = dom.window.navigator;
  (global as any).HTMLCanvasElement = dom.window.HTMLCanvasElement;
  (global as any).HTMLElement = dom.window.HTMLElement;
  (global as any).Element = dom.window.Element;
  (global as any).CanvasRenderingContext2D = class {
    clearRect = jest.fn();
    drawImage = jest.fn();
    getImageData = jest.fn(() => ({
      data: new Uint8ClampedArray(4),
      width: 1,
      height: 1
    }));
    putImageData = jest.fn();
  };
}

function createMockFile(name: string, type: string, content: string = 'test content'): File {
  return new File([content], name, { type, lastModified: Date.now() });
}

describe('BrowserFileViewer', () => {
  let viewer: BrowserFileViewer;

  beforeEach(() => {
    viewer = new BrowserFileViewer();
  });

  afterEach(() => {
    viewer.destroy();
  });

  describe('Constructor and Configuration', () => {
    it('should create instance with default configuration', () => {
      expect(viewer).toBeInstanceOf(BrowserFileViewer);
      expect(viewer).toBeInstanceOf(EventTarget);
    });

    it('should create instance with custom configuration', () => {
      const config: ViewerConfig = {
        maxDimensions: { width: 800, height: 600 },
        showFileInfo: false,
        enablePagination: false,
        preloadPages: 2,
        backgroundColor: '#ffffff'
      };
      
      const customViewer = new BrowserFileViewer(config);
      expect(customViewer).toBeInstanceOf(BrowserFileViewer);
      customViewer.destroy();
    });

    it('should create instance using static create method', () => {
      const staticViewer = BrowserFileViewer.create();
      expect(staticViewer).toBeInstanceOf(BrowserFileViewer);
      staticViewer.destroy();
    });

    it('should create instance using static create method with config', () => {
      const config: ViewerConfig = { showFileInfo: true };
      const staticViewer = BrowserFileViewer.create(config);
      expect(staticViewer).toBeInstanceOf(BrowserFileViewer);
      staticViewer.destroy();
    });
  });

  describe('File Type Support', () => {
    it('should return array of supported file types', () => {
      const types = viewer.getSupportedTypes();
      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThan(0);
      
      // Check for common image types
      expect(types).toContain('image/jpeg');
      expect(types).toContain('image/png');
      expect(types).toContain('image/gif');
      expect(types).toContain('image/webp');
      expect(types).toContain('image/svg+xml');
      expect(types).toContain('image/bmp');
      expect(types).toContain('image/tiff');
    });

    it('should handle image files', () => {
      const jpegFile = createMockFile('test.jpg', 'image/jpeg');
      const pngFile = createMockFile('test.png', 'image/png');
      const tiffFile = createMockFile('test.tiff', 'image/tiff');
      
      expect(viewer.canHandle(jpegFile)).toBe(true);
      expect(viewer.canHandle(pngFile)).toBe(true);
      expect(viewer.canHandle(tiffFile)).toBe(true);
    });

    it('should reject unsupported file types', () => {
      const textFile = createMockFile('test.txt', 'text/plain');
      const pdfFile = createMockFile('test.pdf', 'application/pdf');
      
      expect(viewer.canHandle(textFile)).toBe(false);
      expect(viewer.canHandle(pdfFile)).toBe(false);
    });

    it('should detect TIFF files by extension when MIME type is incorrect', () => {
      const tiffFile = createMockFile('test.tiff', 'application/octet-stream');
      expect(viewer.canHandle(tiffFile)).toBe(true);
    });
  });

  describe('File Information Utilities', () => {
    it('should extract file information', () => {
      const file = createMockFile('example.jpg', 'image/jpeg', 'test image content');
      const info = viewer.getFileInfo(file);
      
      expect(info.name).toBe('example.jpg');
      expect(info.type).toBe('image/jpeg');
      expect(info.size).toBe('test image content'.length);
      expect(info.lastModified).toBeInstanceOf(Date);
    });

    it('should format file sizes correctly', () => {
      expect(viewer.formatFileSize(512)).toBe('512 Bytes');
      expect(viewer.formatFileSize(1024)).toBe('1 KB');
      expect(viewer.formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(viewer.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
      expect(viewer.formatFileSize(0)).toBe('0 Bytes');
    });
  });

  describe('File Loading', () => {
    it('should reject null or undefined files', async () => {
      const result1 = await viewer.loadFile(null as any);
      expect(result1.success).toBe(false);
      expect(result1.error).toBe('File is required');

      const result2 = await viewer.loadFile(undefined as any);
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('File is required');
    });

    it('should reject unsupported file types', async () => {
      const unsupportedFile = createMockFile('test.txt', 'text/plain');
      const result = await viewer.loadFile(unsupportedFile);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unsupported file type: text/plain');
    });

    it('should return load result with file info for supported files', async () => {
      const imageFile = createMockFile('test.jpg', 'image/jpeg');
      
      // Mock the image processor's loadFile method to succeed
      const mockProcessor = {
        loadFile: jest.fn().mockResolvedValue(undefined),
        getState: jest.fn().mockReturnValue({ totalPages: 1, currentPage: 0 }),
        canHandle: jest.fn().mockReturnValue(true),
        destroy: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      };

      // Temporarily replace createProcessor to return our mock
      const originalCreateProcessor = (viewer as any).createProcessor;
      (viewer as any).createProcessor = jest.fn().mockReturnValue(mockProcessor);

      const result = await viewer.loadFile(imageFile);
      
      expect(result.success).toBe(true);
      expect(result.pageCount).toBe(1);
      expect(result.fileInfo).toBeDefined();
      expect(result.fileInfo?.name).toBe('test.jpg');

      // Restore original method
      (viewer as any).createProcessor = originalCreateProcessor;
    });
  });

  describe('State Management', () => {
    it('should return null state when no file is loaded', () => {
      expect(viewer.getState()).toBeNull();
      expect(viewer.getPages()).toEqual([]);
      expect(viewer.getCurrentPage()).toBeNull();
      expect(viewer.getPaginationInfo()).toBeNull();
    });

    it('should throw error when trying to navigate without loaded file', async () => {
      await expect(viewer.navigateToPage(0)).rejects.toThrow('No file loaded');
      await expect(viewer.nextPage()).rejects.toThrow('No file loaded');
      await expect(viewer.previousPage()).rejects.toThrow('No file loaded');
      await expect(viewer.jumpToPage(1)).rejects.toThrow('No file loaded');
    });
  });

  describe('Rendering', () => {
    it('should fail to render when no page is loaded', async () => {
      const canvas = document.createElement('canvas');
      const result = await viewer.renderToTarget({ canvas, width: 100, height: 100 });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('No page to render');
    });

    it('should handle rendering errors gracefully', async () => {
      // Mock a current page
      const mockPage = { data: new Uint8ClampedArray(4), width: 1, height: 1 };
      (viewer as any).getCurrentPage = jest.fn().mockReturnValue(mockPage);

      // Mock renderer to throw error
      const mockRenderer = {
        render: jest.fn().mockRejectedValue(new Error('Rendering failed')),
        clear: jest.fn(),
        resize: jest.fn(),
        calculateDimensions: jest.fn().mockReturnValue({ width: 100, height: 100 })
      };

      const canvas = document.createElement('canvas');
      const result = await viewer.renderToTarget(
        { canvas, width: 100, height: 100 },
        {},
        mockRenderer as any
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Rendering failed');
    });
  });

  describe('Configuration Updates', () => {
    it('should update configuration', () => {
      const newConfig: Partial<ViewerConfig> = {
        showFileInfo: true,
        maxDimensions: { width: 1000, height: 800 }
      };
      
      viewer.updateConfig(newConfig);
      
      // Since config is private, we test through behavior
      expect(() => viewer.updateConfig(newConfig)).not.toThrow();
    });
  });

  describe('Event Handling', () => {
    it('should be an EventTarget and support event listeners', () => {
      const mockListener = jest.fn();
      
      viewer.addEventListener('error', mockListener);
      expect(() => viewer.addEventListener('error', mockListener)).not.toThrow();
      
      viewer.removeEventListener('error', mockListener);
      expect(() => viewer.removeEventListener('error', mockListener)).not.toThrow();
    });
  });

  describe('Resource Cleanup', () => {
    it('should clean up resources when destroyed', () => {
      viewer.destroy();
      
      // After destruction, state should be null
      expect(viewer.getState()).toBeNull();
      expect(viewer.getPages()).toEqual([]);
      expect(viewer.getCurrentPage()).toBeNull();
    });

    it('should handle multiple destroy calls safely', () => {
      viewer.destroy();
      expect(() => viewer.destroy()).not.toThrow();
    });
  });
});

describe('DOMFileViewer', () => {
  let container: HTMLElement;
  let domViewer: DOMFileViewer;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (domViewer) {
      domViewer.destroy();
    }
    if (container.parentElement) {
      document.body.removeChild(container);
    }
  });

  describe('Constructor', () => {
    it('should create DOM adapter with container', () => {
      domViewer = new DOMFileViewer(container);
      expect(domViewer).toBeDefined();
    });

    it('should create DOM adapter with custom config', () => {
      const config: ViewerConfig = { showFileInfo: false };
      domViewer = new DOMFileViewer(container, config);
      expect(domViewer).toBeDefined();
    });
  });

  describe('DOM Integration', () => {
    beforeEach(() => {
      domViewer = new DOMFileViewer(container);
    });

    it('should have access to core viewer methods', () => {
      expect(typeof domViewer.canHandle).toBe('function');
      expect(typeof domViewer.getSupportedTypes).toBe('function');
      expect(typeof domViewer.loadFile).toBe('function');
      expect(typeof domViewer.destroy).toBe('function');
    });

    it('should reject unsupported files', async () => {
      const textFile = createMockFile('test.txt', 'text/plain');
      const result = await domViewer.loadFile(textFile);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported file type');
    });
  });
});
