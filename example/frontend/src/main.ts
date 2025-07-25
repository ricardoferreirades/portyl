import { BrowserFileViewer } from 'browser-file-viewer';
import './style.css';

// Initialize the file viewer
const viewer = new BrowserFileViewer();

// Get DOM elements
const uploadArea = document.getElementById('uploadArea') as HTMLElement;
const uploadButton = document.getElementById('uploadButton') as HTMLButtonElement;
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const viewerContainer = document.getElementById('viewerContainer') as HTMLElement;
const messageContainer = document.getElementById('messageContainer') as HTMLElement;
const supportedTypesContainer = document.getElementById('supportedTypes') as HTMLElement;
const filesTableBody = document.getElementById('filesTableBody') as HTMLElement;

// File information interface
interface FileItem {
  name: string;
  size: number;
  type: string;
  path: string;
}

// Display supported file types
function displaySupportedTypes(): void {
  const types = viewer.getSupportedTypes();
  supportedTypesContainer.innerHTML = '';
  
  types.forEach(type => {
    const tag = document.createElement('span');
    tag.className = 'type-tag';
    tag.textContent = type;
    supportedTypesContainer.appendChild(tag);
  });
}

// Format file size
function formatFileSize(bytes: number): string {
  return viewer.formatFileSize(bytes);
}

// Load example files into the table
async function loadExampleFiles(): Promise<void> {
  try {
    // Fetch the file list from the API server
    showMessage('Loading file list...', false);
    
    const response = await fetch('http://localhost:3004/api/files');
    if (!response.ok) {
      throw new Error(`API server error: ${response.statusText}. Make sure the API server is running (npm run api:start)`);
    }
    
    const data = await response.json();
    const allFiles = data.files || [];
    
    filesTableBody.innerHTML = '';
    
    // Show all files (no filtering)
    if (allFiles.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="4" class="error">No files found in the files folder</td>';
      filesTableBody.appendChild(row);
      showMessage('No files found', true);
      return;
    }

    allFiles.forEach((file: FileItem) => {
      const row = document.createElement('tr');
      
      // Check if file is supported for styling purposes
      const mockFile = new File([''], file.name, { type: file.type });
      const isSupported = viewer.canView(mockFile);
      const rowClass = isSupported ? '' : 'unsupported-file';
      
      row.className = rowClass;
      row.innerHTML = `
        <td class="file-name" title="${file.name}">${file.name}</td>
        <td class="file-size">${formatFileSize(file.size)}</td>
        <td class="file-type">${file.type}</td>
        <td><button class="view-button" data-file-path="${file.path}" data-file-name="${file.name}" data-file-type="${file.type}" ${!isSupported ? 'disabled' : ''}>View</button></td>
      `;
      
      filesTableBody.appendChild(row);
    });

    // Add click handlers to view buttons
    const viewButtons = filesTableBody.querySelectorAll('.view-button:not([disabled])');
    viewButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const btn = e.target as HTMLButtonElement;
        const filePath = btn.dataset.filePath!;
        const fileName = btn.dataset.fileName!;
        const fileType = btn.dataset.fileType!;
        
        await loadExampleFile(filePath, fileName, fileType);
      });
    });
    
    const supportedCount = allFiles.filter((file: FileItem) => {
      const mockFile = new File([''], file.name, { type: file.type });
      return viewer.canView(mockFile);
    }).length;
    
    showMessage(`Loaded ${allFiles.length} files (${supportedCount} supported, ${allFiles.length - supportedCount} unsupported)`, false);
    
  } catch (error) {
    filesTableBody.innerHTML = '<tr><td colspan="4" class="error">Failed to load example files from API server</td></tr>';
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    showMessage(`Error loading files: ${errorMessage}`, true);
    console.error('Error loading file list:', error);
  }
}

// Load and view an example file
async function loadExampleFile(filePath: string, fileName: string, fileType: string): Promise<void> {
  try {
    // Smart detection: Check if the path is a URL or local file path
    const isUrl = filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('/');
    const isLocalPath = filePath.startsWith('../') || filePath.startsWith('./') || filePath.includes('files/');
    const isApiPath = filePath.startsWith('/api/files/');
    
    if (isApiPath) {
      // API server path: Use full API URL
      showMessage(`Loading file: ${fileName}...`, false);
      
      const apiUrl = `http://localhost:3004${filePath}`;
      
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`API server error: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: fileType });
        
        await viewFile(file);
        
      } catch (apiError) {
        const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown API error';
        throw new Error(`Cannot load file via API: ${errorMessage}. Make sure the API server is running (npm run api:start).`);
      }
      
    } else if (isUrl) {
      // Server-based loading: Fetch from URL
      showMessage('Loading file from server...', false);
      
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to load file: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: fileType });
      
      await viewFile(file);
      
    } else if (isLocalPath) {
      // Local filesystem path: Use API server to load the file
      showMessage(`Loading local file: ${fileName}...`, false);
      
      // Extract just the filename from the path
      let filename = fileName;
      if (filePath.includes('/')) {
        const pathParts = filePath.split('/');
        filename = pathParts[pathParts.length - 1];
      }
      
      // Use the API server to load the file
      const apiUrl = `http://localhost:3004/api/files/${filename}`;
      
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`API server error: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: fileType });
        
        await viewFile(file);
        
      } catch (apiError) {
        const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown API error';
        throw new Error(`Cannot load file via API: ${errorMessage}. Make sure the API server is running (npm run api:start) and the file exists in the files/ directory.`);
      }
      
    } else {
      // Try server loading first
      showMessage('Attempting to load from server...', false);
      
      try {
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error('Server file not found');
        }
        
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: fileType });
        
        await viewFile(file);
        
      } catch (serverError) {
        showMessage(`Cannot load file: ${filePath}. File not found on server.`, true);
        console.warn('Server loading failed for:', filePath);
      }
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    showMessage(`Error loading example file: ${errorMessage}`, true);
  }
}

// Show message to user
function showMessage(message: string, isError = false): void {
  messageContainer.innerHTML = '';
  const messageDiv = document.createElement('div');
  messageDiv.className = isError ? 'error-message' : 'success-message';
  messageDiv.textContent = message;
  messageContainer.appendChild(messageDiv);
}

// Handle file viewing
async function viewFile(file: File): Promise<void> {
  try {
    messageContainer.innerHTML = '';
    viewerContainer.classList.remove('empty');
    
    const result = await viewer.view(file, {
      container: viewerContainer,
      showFileInfo: true,
      maxWidth: 800,
      maxHeight: 600
    });

    if (result.success) {
      showMessage(`Successfully loaded: ${file.name}`);
    } else {
      showMessage(`Error: ${result.error}`, true);
      viewerContainer.classList.add('empty');
      viewerContainer.innerHTML = 'Select a file to view it here';
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    showMessage(`Unexpected error: ${errorMessage}`, true);
    viewerContainer.classList.add('empty');
    viewerContainer.innerHTML = 'Select a file to view it here';
  }
}

// Event listeners setup
function setupEventListeners(): void {
  // Upload button click handler
  uploadButton.addEventListener('click', () => {
    fileInput.click();
  });

  // File input change handler
  fileInput.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      viewFile(files[0]);
    }
  });

  // Drag and drop handlers
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      viewFile(files[0]);
    }
  });

  // Prevent default drag behaviors on the document
  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => e.preventDefault());
}

// Initialize the application
function init(): void {
  console.log('🖼️ Browser File Viewer Demo initialized');
  displaySupportedTypes();
  loadExampleFiles();
  setupEventListeners();
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
