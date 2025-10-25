# FileUtils

Utility class for file operations and information extraction. Provides helper methods for file handling, type detection, and formatting.

## Static Methods

### `getFileInfo(file: File): FileInfo`

Extracts file information from a File object.

**Parameters:**
- `file` - File object

**Returns:** `FileInfo` - File information object

**Example:**
```typescript
import { FileUtils } from 'portyl';

const fileInfo = FileUtils.getFileInfo(file);
console.log(`File: ${fileInfo.name} (${fileInfo.size} bytes)`);
console.log(`Type: ${fileInfo.type}`);
console.log(`Modified: ${fileInfo.lastModified}`);
```

### `getFileType(file: File): FileType | null`

Determines the file type category.

**Parameters:**
- `file` - File object

**Returns:** `FileType | null` - File type or null if unknown

**Example:**
```typescript
const fileType = FileUtils.getFileType(file);
if (fileType === FileType.IMAGE) {
  console.log('This is an image file');
}
```

### `isImageFile(file: File): boolean`

Checks if a file is a supported image type.

**Parameters:**
- `file` - File object

**Returns:** `boolean` - `true` if the file is a supported image

**Example:**
```typescript
if (FileUtils.isImageFile(file)) {
  console.log('File is a supported image format');
} else {
  console.log('File is not a supported image format');
}
```

### `isTiffByExtension(fileName: string): boolean`

Checks if a file is TIFF by extension (fallback for when MIME type is not set correctly).

**Parameters:**
- `fileName` - File name

**Returns:** `boolean` - `true` if the file has a TIFF extension

**Example:**
```typescript
const isTiff = FileUtils.isTiffByExtension('document.tiff');
console.log('Is TIFF file:', isTiff);
```

### `formatFileSize(bytes: number): string`

Formats file size in human-readable format.

**Parameters:**
- `bytes` - File size in bytes

**Returns:** `string` - Formatted file size

**Example:**
```typescript
const formattedSize = FileUtils.formatFileSize(1048576);
console.log(formattedSize); // "1 MB"

const formattedSize2 = FileUtils.formatFileSize(1536);
console.log(formattedSize2); // "1.5 KB"
```

### `createDataURL(file: File): Promise<string>`

Creates a data URL from a file.

**Parameters:**
- `file` - File object

**Returns:** `Promise<string>` - Data URL

**Example:**
```typescript
try {
  const dataURL = await FileUtils.createDataURL(file);
  console.log('Data URL:', dataURL);
} catch (error) {
  console.error('Failed to create data URL:', error);
}
```

## Usage Examples

### File Information Extraction

```typescript
import { FileUtils } from 'portyl';

function handleFileSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // Get file information
  const fileInfo = FileUtils.getFileInfo(file);
  console.log('File Information:');
  console.log(`Name: ${fileInfo.name}`);
  console.log(`Size: ${FileUtils.formatFileSize(fileInfo.size)}`);
  console.log(`Type: ${fileInfo.type}`);
  console.log(`Last Modified: ${fileInfo.lastModified}`);

  // Check if it's an image
  if (FileUtils.isImageFile(file)) {
    console.log('This is a supported image file');
  } else {
    console.log('This is not a supported image file');
  }
}
```

### File Type Detection

```typescript
function categorizeFile(file: File): string {
  const fileType = FileUtils.getFileType(file);
  
  switch (fileType) {
    case FileType.IMAGE:
      return 'Image file';
    default:
      return 'Unknown file type';
  }
}

// Usage
const category = categorizeFile(file);
console.log(`File category: ${category}`);
```

### File Size Formatting

```typescript
function displayFileSize(file: File): void {
  const size = FileUtils.formatFileSize(file.size);
  const element = document.getElementById('file-size');
  if (element) {
    element.textContent = `Size: ${size}`;
  }
}

// Usage with file input
document.getElementById('file-input').addEventListener('change', (event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    displayFileSize(file);
  }
});
```

### Data URL Creation

```typescript
async function previewFile(file: File): Promise<void> {
  try {
    const dataURL = await FileUtils.createDataURL(file);
    const img = document.createElement('img');
    img.src = dataURL;
    img.alt = file.name;
    
    const container = document.getElementById('preview');
    if (container) {
      container.innerHTML = '';
      container.appendChild(img);
    }
  } catch (error) {
    console.error('Failed to create preview:', error);
  }
}
```

## Advanced Usage

### File Validation

```typescript
interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

function validateFile(file: File): FileValidationResult {
  const result: FileValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    result.isValid = false;
    result.errors.push(`File size exceeds limit: ${FileUtils.formatFileSize(file.size)} > ${FileUtils.formatFileSize(maxSize)}`);
  }

  // Check if it's a supported image
  if (!FileUtils.isImageFile(file)) {
    result.isValid = false;
    result.errors.push('File is not a supported image format');
  }

  // Check file name
  if (file.name.length > 255) {
    result.warnings.push('File name is very long');
  }

  return result;
}

// Usage
const validation = validateFile(file);
if (!validation.isValid) {
  console.error('File validation failed:', validation.errors);
} else if (validation.warnings.length > 0) {
  console.warn('File validation warnings:', validation.warnings);
}
```

### File Comparison

```typescript
function compareFiles(file1: File, file2: File): {
  sameName: boolean;
  sameSize: boolean;
  sameType: boolean;
  sameModified: boolean;
} {
  const info1 = FileUtils.getFileInfo(file1);
  const info2 = FileUtils.getFileInfo(file2);

  return {
    sameName: info1.name === info2.name,
    sameSize: info1.size === info2.size,
    sameType: info1.type === info2.type,
    sameModified: info1.lastModified?.getTime() === info2.lastModified?.getTime()
  };
}

// Usage
const comparison = compareFiles(file1, file2);
console.log('Files are identical:', Object.values(comparison).every(Boolean));
```

### File Processing Pipeline

```typescript
class FileProcessor {
  private supportedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff'
  ];

  async processFile(file: File): Promise<{
    success: boolean;
    dataURL?: string;
    error?: string;
  }> {
    try {
      // Validate file
      if (!FileUtils.isImageFile(file)) {
        return {
          success: false,
          error: 'Unsupported file type'
        };
      }

      // Get file information
      const fileInfo = FileUtils.getFileInfo(file);
      console.log(`Processing: ${fileInfo.name} (${FileUtils.formatFileSize(fileInfo.size)})`);

      // Create data URL
      const dataURL = await FileUtils.createDataURL(file);

      return {
        success: true,
        dataURL
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
```

### React Hook for File Utils

```typescript
import { useState, useCallback } from 'react';
import { FileUtils } from 'portyl';

export function useFileUtils() {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);

  const analyzeFile = useCallback((file: File) => {
    const info = FileUtils.getFileInfo(file);
    setFileInfo(info);
    return info;
  }, []);

  const formatSize = useCallback((bytes: number) => {
    return FileUtils.formatFileSize(bytes);
  }, []);

  const isImage = useCallback((file: File) => {
    return FileUtils.isImageFile(file);
  }, []);

  return {
    fileInfo,
    analyzeFile,
    formatSize,
    isImage
  };
}

// Usage in component
function FileAnalyzer() {
  const { fileInfo, analyzeFile, formatSize, isImage } = useFileUtils();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      analyzeFile(file);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {fileInfo && (
        <div>
          <p>Name: {fileInfo.name}</p>
          <p>Size: {formatSize(fileInfo.size)}</p>
          <p>Type: {fileInfo.type}</p>
          <p>Is Image: {isImage(file) ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
}
```

### Vue Composable for File Utils

```typescript
import { ref, computed } from 'vue';
import { FileUtils } from 'portyl';

export function useFileUtils() {
  const fileInfo = ref<FileInfo | null>(null);

  const analyzeFile = (file: File) => {
    const info = FileUtils.getFileInfo(file);
    fileInfo.value = info;
    return info;
  };

  const formatSize = (bytes: number) => {
    return FileUtils.formatFileSize(bytes);
  };

  const isImage = (file: File) => {
    return FileUtils.isImageFile(file);
  };

  const formattedSize = computed(() => {
    return fileInfo.value ? formatSize(fileInfo.value.size) : '';
  });

  return {
    fileInfo,
    analyzeFile,
    formatSize,
    isImage,
    formattedSize
  };
}

// Usage in component
export default {
  setup() {
    const { fileInfo, analyzeFile, formatSize, isImage, formattedSize } = useFileUtils();

    const handleFileChange = (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        analyzeFile(file);
      }
    };

    return {
      fileInfo,
      handleFileChange,
      formatSize,
      isImage,
      formattedSize
    };
  }
};
```

## Error Handling

```typescript
async function safeFileOperation(file: File): Promise<void> {
  try {
    const dataURL = await FileUtils.createDataURL(file);
    console.log('Data URL created successfully');
  } catch (error) {
    console.error('Failed to create data URL:', error);
    
    // Fallback handling
    const fileInfo = FileUtils.getFileInfo(file);
    console.log('File info (fallback):', fileInfo);
  }
}
```

## Related APIs

- [FileInfo](/api/types) - File information interface
- [FileType](/api/types) - File type enumeration
- [BrowserFileViewer](/api/browser-file-viewer) - Main viewer class
