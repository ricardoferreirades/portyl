import { FileUtils } from '../utils';
import { FileType } from '../types';

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

describe('FileUtils', () => {
  describe('getFileInfo', () => {
    it('should extract correct file information', () => {
      const mockFile = createMockFile('test.jpg', 'image/jpeg', 2048);
      const fileInfo = FileUtils.getFileInfo(mockFile);

      expect(fileInfo.name).toBe('test.jpg');
      expect(fileInfo.type).toBe('image/jpeg');
      expect(fileInfo.size).toBe(2048);
      expect(fileInfo.lastModified).toBeInstanceOf(Date);
    });
  });

  describe('getFileType', () => {
    it('should return IMAGE for image files', () => {
      const imageFile = createMockFile('test.jpg', 'image/jpeg');
      expect(FileUtils.getFileType(imageFile)).toBe(FileType.IMAGE);
    });

    it('should return null for unsupported files', () => {
      const textFile = createMockFile('test.txt', 'text/plain');
      expect(FileUtils.getFileType(textFile)).toBeNull();
    });
  });

  describe('isImageFile', () => {
    it('should return true for supported image types', () => {
      const supportedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'image/bmp',
        'image/tiff',
        'image/tif',
      ];

      supportedTypes.forEach(type => {
        const file = createMockFile('test', type);
        expect(FileUtils.isImageFile(file)).toBe(true);
      });
    });

    it('should return true for TIFF files by extension', () => {
      const tiffFile1 = createMockFile('test.tiff', 'application/octet-stream');
      const tiffFile2 = createMockFile('test.tif', 'application/octet-stream');
      
      expect(FileUtils.isImageFile(tiffFile1)).toBe(true);
      expect(FileUtils.isImageFile(tiffFile2)).toBe(true);
    });

    it('should return false for unsupported types', () => {
      const unsupportedTypes = [
        'text/plain',
        'application/pdf',
        'video/mp4',
      ];

      unsupportedTypes.forEach(type => {
        const file = createMockFile('test', type);
        expect(FileUtils.isImageFile(file)).toBe(false);
      });
    });
  });

  describe('isTiffByExtension', () => {
    it('should return true for TIFF extensions', () => {
      expect(FileUtils.isTiffByExtension('image.tiff')).toBe(true);
      expect(FileUtils.isTiffByExtension('image.tif')).toBe(true);
      expect(FileUtils.isTiffByExtension('IMAGE.TIFF')).toBe(true);
      expect(FileUtils.isTiffByExtension('IMAGE.TIF')).toBe(true);
    });

    it('should return false for non-TIFF extensions', () => {
      expect(FileUtils.isTiffByExtension('image.jpg')).toBe(false);
      expect(FileUtils.isTiffByExtension('image.png')).toBe(false);
      expect(FileUtils.isTiffByExtension('document.pdf')).toBe(false);
    });
  });

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(FileUtils.formatFileSize(0)).toBe('0 Bytes');
      expect(FileUtils.formatFileSize(1024)).toBe('1 KB');
      expect(FileUtils.formatFileSize(1048576)).toBe('1 MB');
      expect(FileUtils.formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('createDataURL', () => {
    it('should create data URL from file', async () => {
      const mockFile = createMockFile('test.jpg', 'image/jpeg');
      
      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onload: null as any,
        onerror: null as any,
        result: 'data:image/jpeg;base64,test',
      };

      (global as any).FileReader = jest.fn(() => mockFileReader);

      const promise = FileUtils.createDataURL(mockFile);
      
      // Simulate successful file read
      setTimeout(() => {
        mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,test' } });
      }, 0);

      const result = await promise;
      expect(result).toBe('data:image/jpeg;base64,test');
    });
  });
});
