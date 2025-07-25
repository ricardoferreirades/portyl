import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3004;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

interface FileInfo {
  name: string;
  size: number;
  type: string;
  path: string;
  modified: string;
}

interface ApiResponse<T = any> {
  error?: string;
  message?: string;
  files?: T[];
  status?: string;
  timestamp?: string;
  path?: string;
}

// API endpoint to load local files
app.get('/api/files/:filename', (req: Request, res: Response) => {
  try {
    // Extract the filename from the URL parameters
    const filename = req.params.filename;
    
    // Construct the full file path
    // Files are in a 'files' directory relative to the project root (up one level from src)
    const filePath = path.join(__dirname, '..', 'files', filename);
    
    // Security check: ensure the path is within the files directory
    const filesDir = path.join(__dirname, '..', 'files');
    const resolvedPath = path.resolve(filePath);
    const resolvedFilesDir = path.resolve(filesDir);
    
    if (!resolvedPath.startsWith(resolvedFilesDir)) {
      return res.status(403).json({ 
        error: 'Access denied: Path outside allowed directory' 
      } as ApiResponse);
    }
    
    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ 
        error: 'File not found',
        path: filename 
      } as ApiResponse);
    }
    
    // Check if it's a file (not a directory)
    const stats = fs.statSync(resolvedPath);
    if (!stats.isFile()) {
      return res.status(400).json({ 
        error: 'Path is not a file',
        path: filename 
      } as ApiResponse);
    }
    
    // Determine content type based on file extension
    const ext = path.extname(resolvedPath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.bmp': 'image/bmp',
      '.tif': 'image/tiff',
      '.tiff': 'image/tiff',
      '.avif': 'image/avif',
      '.heic': 'image/heic',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.md': 'text/markdown',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.mov': 'video/quicktime',
      '.mp4': 'video/mp4',
      '.wav': 'audio/wav'
    };
    
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // Set appropriate headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // Stream the file
    const fileStream = fs.createReadStream(resolvedPath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error reading file' } as ApiResponse);
      }
    });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
});

// API endpoint to list files in the files directory
app.get('/api/files', (req: Request, res: Response) => {
  try {
    const filesDir = path.join(__dirname, '..', 'files');
    
    if (!fs.existsSync(filesDir)) {
      return res.json({ files: [] } as ApiResponse<FileInfo>);
    }
    
    const files = fs.readdirSync(filesDir);
    const fileList: FileInfo[] = files
      .filter(file => {
        const filePath = path.join(filesDir, file);
        return fs.statSync(filePath).isFile();
      })
      .map(file => {
        const filePath = path.join(filesDir, file);
        const stats = fs.statSync(filePath);
        const ext = path.extname(file).toLowerCase();
        
        // Determine MIME type
        const mimeTypes: Record<string, string> = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
          '.bmp': 'image/bmp',
          '.tif': 'image/tiff',
          '.tiff': 'image/tiff',
          '.avif': 'image/avif',
          '.heic': 'image/heic',
          '.pdf': 'application/pdf',
          '.txt': 'text/plain',
          '.md': 'text/markdown',
          '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          '.mov': 'video/quicktime',
          '.mp4': 'video/mp4',
          '.wav': 'audio/wav'
        };
        
        return {
          name: file,
          size: stats.size,
          type: mimeTypes[ext] || 'application/octet-stream',
          path: `/api/files/${file}`,
          modified: stats.mtime.toISOString()
        };
      });
    
    res.json({ files: fileList } as ApiResponse<FileInfo>);
    
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ 
      error: 'Error listing files',
      message: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'File API server is running',
    timestamp: new Date().toISOString()
  } as ApiResponse);
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 File API server running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, '..', 'files')}`);
  console.log(`🔗 API endpoints:`);
  console.log(`   GET /api/health - Health check`);
  console.log(`   GET /api/files - List all files`);
  console.log(`   GET /api/files/{filename} - Get specific file`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 File API server shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 File API server shutting down...');
  process.exit(0);
});
