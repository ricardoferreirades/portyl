import { BrowserFileViewer } from '../BrowserFileViewer';

// Mock File object for testing
const createMockFile = (name: string, type: string, size: number = 1024): File => {
  return {
    name,
    type,
    size,
    lastModified: Date.now(),
    slice: jest.fn(),
    stream: jest.fn(),
    text: jest.fn().mockResolvedValue(''),
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
  } as unknown as File;
};

// Mock DOM elements
const createMockContainer = (): HTMLElement => {
  const div = document.createElement('div');
  return div;
};

describe('BrowserFileViewer', () => {
  let viewer: BrowserFileViewer;
  let container: HTMLElement;

  beforeEach(() => {
    viewer = new BrowserFileViewer();
    container = createMockContainer();
  });

  afterEach(() => {
    viewer.destroy();
  });

  describe('canView', () => {
    it('should return true for supported image files', () => {
      const imageFile = createMockFile('test.jpg', 'image/jpeg');
      expect(viewer.canView(imageFile)).toBe(true);
      
      const tiffFile = createMockFile('test.tiff', 'image/tiff');
      expect(viewer.canView(tiffFile)).toBe(true);
    });

    it('should return false for unsupported files', () => {
      const textFile = createMockFile('test.txt', 'text/plain');
      expect(viewer.canView(textFile)).toBe(false);
    });
  });

  describe('getSupportedTypes', () => {
    it('should return array of supported MIME types', () => {
      const supportedTypes = viewer.getSupportedTypes();
      expect(supportedTypes).toContain('image/jpeg');
      expect(supportedTypes).toContain('image/png');
      expect(supportedTypes).toContain('image/gif');
      expect(supportedTypes).toContain('image/tiff');
      expect(supportedTypes).toContain('image/tif');
    });
  });

  describe('getFileInfo', () => {
    it('should return file information', () => {
      const file = createMockFile('test.jpg', 'image/jpeg', 2048);
      const info = viewer.getFileInfo(file);
      
      expect(info.name).toBe('test.jpg');
      expect(info.type).toBe('image/jpeg');
      expect(info.size).toBe(2048);
    });
  });

  describe('formatFileSize', () => {
    it('should format file size correctly', () => {
      expect(viewer.formatFileSize(1024)).toBe('1 KB');
    });
  });

  describe('view', () => {
    it('should return error for missing file', async () => {
      const result = await viewer.view(null as any, { container });
      expect(result.success).toBe(false);
      expect(result.error).toBe('File is required');
    });

    it('should return error for missing container', async () => {
      const file = createMockFile('test.jpg', 'image/jpeg');
      const result = await viewer.view(file, { container: null as any });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Container element is required');
    });

    it('should return error for unsupported file type', async () => {
      const file = createMockFile('test.txt', 'text/plain');
      const result = await viewer.view(file, { container });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unsupported file type: text/plain');
    });
  });

  describe('create', () => {
    it('should create a new instance', () => {
      const newViewer = BrowserFileViewer.create();
      expect(newViewer).toBeInstanceOf(BrowserFileViewer);
      newViewer.destroy();
    });
  });
});
