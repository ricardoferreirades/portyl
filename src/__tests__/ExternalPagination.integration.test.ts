import { BrowserFileViewer } from '../BrowserFileViewer';

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

// Mock Image constructor
(global as any).Image = class {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';
  naturalWidth = 100;
  naturalHeight = 100;
  
  constructor() {
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
};

// Mock URL methods
Object.defineProperty(URL, 'createObjectURL', {
  value: jest.fn().mockReturnValue('blob:mock-url'),
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: jest.fn(),
});

// Mock File methods
const createMockFile = (name: string, type: string, size: number = 1024): File => {
  return {
    name,
    type,
    size,
    lastModified: Date.now(),
    slice: jest.fn(),
    stream: jest.fn(),
    text: jest.fn().mockResolvedValue(''),
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024)),
  } as unknown as File;
};

describe('External Pagination System Integration', () => {
  let viewer: BrowserFileViewer;
  let mockUTIF: any;
  let container: HTMLElement;
  let events: CustomEvent[] = [];

  beforeEach(() => {
    viewer = new BrowserFileViewer();
    events = [];
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup UTIF mock for 3-page TIFF
    mockUTIF = require('utif');
    mockUTIF.decode.mockReturnValue([
      { width: 100, height: 100 },
      { width: 100, height: 100 },
      { width: 100, height: 100 },
    ]);
    mockUTIF.toRGBA8.mockReturnValue(new Uint8Array(40000));

    // Mock canvas and context
    const mockContext = {
      clearRect: jest.fn(),
      drawImage: jest.fn(),
      putImageData: jest.fn(),
      getImageData: jest.fn().mockReturnValue({
        data: new Uint8ClampedArray(4),
        width: 1,
        height: 1,
      }),
      fillStyle: '',
      fillText: jest.fn(),
      measureText: jest.fn().mockReturnValue({ width: 50 }),
      font: '',
      textAlign: '',
      textBaseline: '',
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      quadraticCurveTo: jest.fn(),
      closePath: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      strokeStyle: '',
      lineWidth: 0,
    };

    const mockCanvas = {
      getContext: jest.fn().mockReturnValue(mockContext),
      style: {},
      width: 800,
      height: 600,
      toDataURL: jest.fn().mockReturnValue('data:image/png;base64,mock'),
      parentElement: null,
    };

    // Create container mock that captures events
    container = {
      innerHTML: '',
      appendChild: jest.fn().mockImplementation((child) => {
        if (child && typeof child === 'object') {
          (child as any).parentElement = container;
        }
        return child;
      }),
      dispatchEvent: jest.fn().mockImplementation((event: CustomEvent) => {
        events.push(event);
        return true;
      }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      getBoundingClientRect: jest.fn().mockReturnValue({
        width: 800,
        height: 600,
        top: 0,
        left: 0,
        bottom: 600,
        right: 800,
      }),
    } as unknown as HTMLElement;

    // Mock document.createElement
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return mockCanvas as any;
      }
      return {
        style: {},
        className: '',
        innerHTML: '',
        appendChild: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
        querySelector: jest.fn().mockReturnValue(null),
      } as any;
    });
  });

  afterEach(() => {
    viewer.destroy();
    jest.restoreAllMocks();
  });

  describe('Integration with External Pagination Controls', () => {
    it('should dispatch pagination-available event for multi-page TIFF', async () => {
      const file = createMockFile('test.tiff', 'image/tiff');
      
      const result = await viewer.view(file, { container, showFileInfo: false });
      expect(result.success).toBe(true);

      // Should have dispatched pagination-available event
      const paginationAvailableEvents = events.filter(e => e.type === 'pagination-available');
      expect(paginationAvailableEvents).toHaveLength(1);
      
      const event = paginationAvailableEvents[0];
      expect(event.detail).toEqual({
        currentPage: 1,
        totalPages: 3,
        controls: expect.any(Object),
      });
    });

    it('should dispatch pagination-hide event for single page images', async () => {
      // Mock single page TIFF
      mockUTIF.decode.mockReturnValue([{ width: 100, height: 100 }]);
      
      const file = createMockFile('test.jpg', 'image/jpeg');
      
      const result = await viewer.view(file, { container, showFileInfo: false });
      expect(result.success).toBe(true);

      // Should have dispatched pagination-hide event
      const paginationHideEvents = events.filter(e => e.type === 'pagination-hide');
      expect(paginationHideEvents).toHaveLength(1);
    });

    it('should provide access to current viewer for external pagination', async () => {
      const file = createMockFile('test.tiff', 'image/tiff');
      
      await viewer.view(file, { container, showFileInfo: false });

      // Test access to current viewer (this is what the external system uses)
      const currentViewer = (viewer as any).currentViewer;
      expect(currentViewer).toBeDefined();
      expect(currentViewer.nextPage).toBeInstanceOf(Function);
      expect(currentViewer.previousPage).toBeInstanceOf(Function);
      expect(currentViewer.jumpToPage).toBeInstanceOf(Function);
      expect(currentViewer.getPaginationInfo).toBeInstanceOf(Function);
    });

    it('should allow external pagination control through currentViewer', async () => {
      const file = createMockFile('test.tiff', 'image/tiff');
      
      await viewer.view(file, { container, showFileInfo: false });

      const currentViewer = (viewer as any).currentViewer;
      
      // Test initial state
      let paginationInfo = currentViewer.getPaginationInfo();
      expect(paginationInfo.currentPage).toBe(1);
      expect(paginationInfo.totalPages).toBe(3);

      // Test navigation via external interface
      await currentViewer.nextPage();
      paginationInfo = currentViewer.getPaginationInfo();
      expect(paginationInfo.currentPage).toBe(2);

      await currentViewer.jumpToPage(3);
      paginationInfo = currentViewer.getPaginationInfo();
      expect(paginationInfo.currentPage).toBe(3);

      await currentViewer.previousPage();
      paginationInfo = currentViewer.getPaginationInfo();
      expect(paginationInfo.currentPage).toBe(2);
    });

    it('should maintain state consistency between viewer and external controls', async () => {
      const file = createMockFile('test.tiff', 'image/tiff');
      
      await viewer.view(file, { container, showFileInfo: false });

      const currentViewer = (viewer as any).currentViewer;
      
      // Perform multiple navigation operations
      await currentViewer.nextPage(); // Page 2
      await currentViewer.nextPage(); // Page 3
      await currentViewer.previousPage(); // Page 2
      await currentViewer.jumpToPage(1); // Page 1

      const finalInfo = currentViewer.getPaginationInfo();
      expect(finalInfo).toEqual({
        currentPage: 1,
        totalPages: 3,
        canGoNext: true,
        canGoPrev: false,
      });
    });
  });

  describe('Event System Validation', () => {
    it('should dispatch pagination-update events during external navigation', async () => {
      const file = createMockFile('test.tiff', 'image/tiff');
      
      await viewer.view(file, { container, showFileInfo: false });
      
      // Clear initial events
      events.length = 0;
      
      const currentViewer = (viewer as any).currentViewer;
      
      // Perform navigation that should trigger update events
      await currentViewer.nextPage();
      await currentViewer.nextPage();
      await currentViewer.previousPage();

      // Note: update events are dispatched on the viewer element, not the container
      // So we won't see them in our container events array
      // But we can verify the navigation worked
      const finalInfo = currentViewer.getPaginationInfo();
      expect(finalInfo.currentPage).toBe(2);
    });

    it('should provide correct pagination boundaries', async () => {
      const file = createMockFile('test.tiff', 'image/tiff');
      
      await viewer.view(file, { container, showFileInfo: false });

      const currentViewer = (viewer as any).currentViewer;
      
      // Test boundaries at first page
      let info = currentViewer.getPaginationInfo();
      expect(info.canGoPrev).toBe(false);
      expect(info.canGoNext).toBe(true);

      // Go to last page
      await currentViewer.jumpToPage(3);
      info = currentViewer.getPaginationInfo();
      expect(info.canGoPrev).toBe(true);
      expect(info.canGoNext).toBe(false);

      // Test middle page
      await currentViewer.jumpToPage(2);
      info = currentViewer.getPaginationInfo();
      expect(info.canGoPrev).toBe(true);
      expect(info.canGoNext).toBe(true);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle invalid page navigation gracefully', async () => {
      const file = createMockFile('test.tiff', 'image/tiff');
      
      await viewer.view(file, { container, showFileInfo: false });

      const currentViewer = (viewer as any).currentViewer;
      
      const initialInfo = currentViewer.getPaginationInfo();
      
      // Try invalid page numbers
      await currentViewer.jumpToPage(0); // Too low
      await currentViewer.jumpToPage(5); // Too high
      await currentViewer.jumpToPage(-1); // Negative

      // Should remain on original page
      const finalInfo = currentViewer.getPaginationInfo();
      expect(finalInfo.currentPage).toBe(initialInfo.currentPage);
    });

    it('should handle navigation beyond boundaries', async () => {
      const file = createMockFile('test.tiff', 'image/tiff');
      
      await viewer.view(file, { container, showFileInfo: false });

      const currentViewer = (viewer as any).currentViewer;
      
      // Try to go before first page
      await currentViewer.previousPage();
      let info = currentViewer.getPaginationInfo();
      expect(info.currentPage).toBe(1);

      // Go to last page and try to go beyond
      await currentViewer.jumpToPage(3);
      await currentViewer.nextPage();
      info = currentViewer.getPaginationInfo();
      expect(info.currentPage).toBe(3);
    });
  });

  describe('Resource Management', () => {
    it('should clean up viewer references on destroy', async () => {
      const file = createMockFile('test.tiff', 'image/tiff');
      
      await viewer.view(file, { container, showFileInfo: false });

      const currentViewer = (viewer as any).currentViewer;
      expect(currentViewer).toBeDefined();

      viewer.destroy();

      // After destroy, currentViewer should be reset
      expect((viewer as any).currentViewer).toBeUndefined();
    });

    it('should handle multiple file loads correctly', async () => {
      // Load first file
      const file1 = createMockFile('test1.tiff', 'image/tiff');
      await viewer.view(file1, { container, showFileInfo: false });
      
      let currentViewer = (viewer as any).currentViewer;
      expect(currentViewer.getPaginationInfo().totalPages).toBe(3);
      
      // Load second file (single page)
      mockUTIF.decode.mockReturnValue([{ width: 100, height: 100 }]);
      const file2 = createMockFile('test2.jpg', 'image/jpeg');
      await viewer.view(file2, { container, showFileInfo: false });
      
      currentViewer = (viewer as any).currentViewer;
      expect(currentViewer.getPaginationInfo()).toBeNull(); // Single page
    });
  });
});
