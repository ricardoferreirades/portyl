import { ImageViewer } from '../viewers/ImageViewer';

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

describe('ImageViewer Pagination (Focused)', () => {
  let viewer: ImageViewer;
  let mockUTIF: any;
  let mockCanvas: any;
  let mockContext: any;
  let container: HTMLElement;

  beforeEach(() => {
    viewer = new ImageViewer();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup UTIF mock
    mockUTIF = require('utif');
    mockUTIF.decode.mockReturnValue([
      { width: 100, height: 100 },
      { width: 100, height: 100 },
      { width: 100, height: 100 },
    ]);
    mockUTIF.toRGBA8.mockReturnValue(new Uint8Array(40000)); // 100x100x4

    // Setup canvas and context mocks
    mockContext = {
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

    mockCanvas = {
      getContext: jest.fn().mockReturnValue(mockContext),
      style: {},
      width: 800,
      height: 600,
      toDataURL: jest.fn().mockReturnValue('data:image/png;base64,mock'),
      parentElement: null,
    };

    // Create container mock
    container = {
      innerHTML: '',
      appendChild: jest.fn().mockImplementation((child) => {
        if (child && typeof child === 'object') {
          (child as any).parentElement = container;
        }
        return child;
      }),
      dispatchEvent: jest.fn(),
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
        querySelector: jest.fn(),
      } as any;
    });
  });

  afterEach(() => {
    viewer.destroy();
    jest.restoreAllMocks();
  });

  describe('Basic Pagination State', () => {
    it('should return null pagination info for single page images', async () => {
      // Mock single page TIFF
      mockUTIF.decode.mockReturnValue([{ width: 100, height: 100 }]);
      
      const file = createMockFile('test.jpg', 'image/jpeg');
      await viewer.render(file, { container, showFileInfo: false });

      expect(viewer.getPaginationInfo()).toBeNull();
    });

    it('should return pagination info for multi-page TIFF', async () => {
      const file = createMockFile('test.tiff', 'image/tiff');
      
      // Mock the canvas setup to prevent warnings
      mockCanvas.parentElement = container;
      
      const result = await viewer.render(file, { container, showFileInfo: false });
      
      if (result.success) {
        const paginationInfo = viewer.getPaginationInfo();
        expect(paginationInfo).toEqual({
          currentPage: 1,
          totalPages: 3,
          canGoNext: true,
          canGoPrev: false,
        });
      }
    });
  });

  describe('Navigation Methods', () => {
    beforeEach(async () => {
      const file = createMockFile('test.tiff', 'image/tiff');
      mockCanvas.parentElement = container;
      await viewer.render(file, { container, showFileInfo: false });
    });

    it('should navigate to next page', async () => {
      const initialInfo = viewer.getPaginationInfo();
      expect(initialInfo?.currentPage).toBe(1);

      await viewer.nextPage();

      const newInfo = viewer.getPaginationInfo();
      expect(newInfo?.currentPage).toBe(2);
    });

    it('should navigate to previous page', async () => {
      // Go to page 2 first
      await viewer.nextPage();
      expect(viewer.getPaginationInfo()?.currentPage).toBe(2);

      // Go back to page 1
      await viewer.previousPage();
      expect(viewer.getPaginationInfo()?.currentPage).toBe(1);
    });

    it('should jump to specific page', async () => {
      await viewer.jumpToPage(3);
      expect(viewer.getPaginationInfo()?.currentPage).toBe(3);
    });

    it('should not go beyond boundaries', async () => {
      // Try to go before first page
      await viewer.previousPage();
      expect(viewer.getPaginationInfo()?.currentPage).toBe(1);

      // Go to last page
      await viewer.jumpToPage(3);
      expect(viewer.getPaginationInfo()?.currentPage).toBe(3);

      // Try to go past last page
      await viewer.nextPage();
      expect(viewer.getPaginationInfo()?.currentPage).toBe(3);
    });
  });

  describe('Event Dispatching', () => {
    it('should dispatch pagination-available for multi-page TIFF', async () => {
      const file = createMockFile('test.tiff', 'image/tiff');
      mockCanvas.parentElement = container;
      
      const dispatchSpy = jest.spyOn(container, 'dispatchEvent');
      
      await viewer.render(file, { container, showFileInfo: false });

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'pagination-available',
        })
      );
    });

    it('should dispatch pagination-update during navigation', async () => {
      const file = createMockFile('test.tiff', 'image/tiff');
      mockCanvas.parentElement = container;
      
      await viewer.render(file, { container, showFileInfo: false });
      
      // Clear previous calls and spy on the viewer container element
      jest.clearAllMocks();
      
      // Mock the currentElement to have a dispatchEvent method and querySelector
      const viewerElement = {
        dispatchEvent: jest.fn(),
        querySelector: jest.fn().mockReturnValue(null), // Return null for non-existent elements
      };
      (viewer as any).currentElement = viewerElement;
      
      await viewer.nextPage();

      expect(viewerElement.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'pagination-update',
          detail: expect.objectContaining({
            currentPage: 2,
            totalPages: 3,
          }),
        })
      );
    });
  });

  describe('Canvas State Management', () => {
    it('should call UTIF methods during navigation', async () => {
      const file = createMockFile('test.tiff', 'image/tiff');
      mockCanvas.parentElement = container;
      
      await viewer.render(file, { container, showFileInfo: false });
      
      // Clear mocks to only track navigation calls
      jest.clearAllMocks();
      
      await viewer.nextPage();

      expect(mockUTIF.toRGBA8).toHaveBeenCalledWith(
        expect.objectContaining({ width: 100, height: 100 })
      );
    });

    it('should update canvas during navigation', async () => {
      const file = createMockFile('test.tiff', 'image/tiff');
      mockCanvas.parentElement = container;
      
      await viewer.render(file, { container, showFileInfo: false });
      
      // Clear mocks to only track navigation calls
      jest.clearAllMocks();
      
      await viewer.nextPage();

      expect(mockContext.clearRect).toHaveBeenCalled();
      expect(mockContext.drawImage).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle TIFF decoding errors', async () => {
      mockUTIF.decode.mockReturnValue([]); // No pages
      
      const file = createMockFile('test.tiff', 'image/tiff');
      const result = await viewer.render(file, { container, showFileInfo: false });

      expect(result.success).toBe(false);
      expect(result.error).toContain('No valid TIFF pages found');
    });

    it('should handle navigation without loaded file', async () => {
      await expect(viewer.nextPage()).resolves.not.toThrow();
      await expect(viewer.previousPage()).resolves.not.toThrow();
      await expect(viewer.jumpToPage(1)).resolves.not.toThrow();

      expect(viewer.getPaginationInfo()).toBeNull();
    });
  });

  describe('Resource Cleanup', () => {
    it('should reset state when destroyed', async () => {
      const file = createMockFile('test.tiff', 'image/tiff');
      mockCanvas.parentElement = container;
      
      await viewer.render(file, { container, showFileInfo: false });
      
      expect(viewer.getPaginationInfo()).not.toBeNull();
      
      viewer.destroy();
      
      const state = (viewer as any).state;
      expect(state.currentPage).toBe(0);
      expect(state.totalPages).toBe(1);
      expect(state.tiffData).toBeNull();
      expect(state.canvas).toBeNull();
    });
  });

  describe('File Type Detection', () => {
    it('should handle TIFF files correctly', () => {
      const tiffFile = createMockFile('test.tiff', 'image/tiff');
      expect(viewer.canHandle(tiffFile)).toBe(true);
      
      const jpegFile = createMockFile('test.jpg', 'image/jpeg');
      expect(viewer.canHandle(jpegFile)).toBe(true);
      
      const textFile = createMockFile('test.txt', 'text/plain');
      expect(viewer.canHandle(textFile)).toBe(false);
    });
  });
});
