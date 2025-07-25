import { BrowserFileViewer, DOMFileViewer } from 'browser-file-viewer';
import './style.css';

// Initialize the file viewer with new architecture
const viewer = new BrowserFileViewer({
  showFileInfo: true,
  enablePagination: true,
  maxDimensions: { width: 1200, height: 800 }
});

// DOM adapter for easy container-based usage
let domViewer: DOMFileViewer | null = null;

// Get DOM elements
const uploadArea = document.getElementById('uploadArea') as HTMLElement;
const uploadButton = document.getElementById('uploadButton') as HTMLButtonElement;
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const viewerContainer = document.getElementById('viewerContainer') as HTMLElement;
const messageContainer = document.getElementById('messageContainer') as HTMLElement;
const supportedTypesContainer = document.getElementById('supportedTypes') as HTMLElement;
const filesTableBody = document.getElementById('filesTableBody') as HTMLElement;
const paginationControls = document.getElementById('paginationControls') as HTMLElement;

// File information interface
interface FileItem {
  name: string;
  size: number;
  type: string;
  path: string;
}

// Setup external pagination controls with new API
function setupPaginationControls(): void {
  console.log('Setting up pagination controls');
  
  // Listen for pagination events from the viewer
  viewer.addEventListener('pageChanged', (event: any) => {
    console.log('Page changed event:', event.detail);
    const paginationInfo = viewer.getPaginationInfo();
    if (paginationInfo) {
      updatePaginationControls(paginationInfo.currentPage, paginationInfo.totalPages);
    }
  });

  viewer.addEventListener('loaded', () => {
    console.log('File loaded event');
    const paginationInfo = viewer.getPaginationInfo();
    if (paginationInfo && paginationInfo.totalPages > 1) {
      showPaginationControls(paginationInfo.currentPage, paginationInfo.totalPages);
    } else {
      hidePaginationControls();
    }
  });

  viewer.addEventListener('error', () => {
    console.log('Error event - hiding pagination');
    hidePaginationControls();
  });
}

function showPaginationControls(currentPage: number, totalPages: number): void {
  paginationControls.innerHTML = `
    <button id="prevPageBtn" class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200" ${currentPage <= 1 ? 'disabled' : ''}>
      ◀ Previous
    </button>
    <span class="text-gray-700 font-semibold px-2">Page</span>
    <input type="number" id="pageInput" class="w-16 px-2 py-2 border border-gray-300 rounded-lg text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" min="1" max="${totalPages}" value="${currentPage}" />
    <span class="text-gray-700 font-semibold px-2">of ${totalPages}</span>
    <button id="nextPageBtn" class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200" ${currentPage >= totalPages ? 'disabled' : ''}>
      Next ▶
    </button>
  `;
  
  paginationControls.classList.remove('hidden');
  paginationControls.classList.add('flex');
  
  // Add event listeners
  const prevBtn = document.getElementById('prevPageBtn') as HTMLButtonElement;
  const nextBtn = document.getElementById('nextPageBtn') as HTMLButtonElement;
  const pageInput = document.getElementById('pageInput') as HTMLInputElement;
  
  prevBtn.addEventListener('click', async () => {
    console.log('Previous button clicked');
    try {
      await viewer.previousPage();
      console.log('Previous page called');
    } catch (error) {
      console.error('Error navigating to previous page:', error);
    }
  });
  
  nextBtn.addEventListener('click', async () => {
    console.log('Next button clicked');
    try {
      await viewer.nextPage();
      console.log('Next page called');
    } catch (error) {
      console.error('Error navigating to next page:', error);
    }
  });
  
  pageInput.addEventListener('change', async (e) => {
    const target = e.target as HTMLInputElement;
    const pageNum = parseInt(target.value);
    console.log('Page input changed to:', pageNum);
    if (pageNum >= 1 && pageNum <= totalPages) {
      try {
        await viewer.jumpToPage(pageNum);
        console.log('Jump to page called with:', pageNum);
      } catch (error) {
        console.error('Error jumping to page:', error);
        target.value = currentPage.toString();
      }
    } else {
      target.value = currentPage.toString();
    }
  });
  
  pageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      pageInput.blur();
    }
  });
}

function updatePaginationControls(currentPage: number, totalPages: number): void {
  console.log('Updating pagination controls:', { currentPage, totalPages });
  
  const prevBtn = document.getElementById('prevPageBtn') as HTMLButtonElement;
  const nextBtn = document.getElementById('nextPageBtn') as HTMLButtonElement;
  const pageInput = document.getElementById('pageInput') as HTMLInputElement;
  
  if (prevBtn) {
    prevBtn.disabled = currentPage <= 1;
    prevBtn.className = `bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ${
      currentPage <= 1 ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-600'
    }`;
  }
  
  if (nextBtn) {
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.className = `bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ${
      currentPage >= totalPages ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-600'
    }`;
  }
  
  if (pageInput) {
    pageInput.value = currentPage.toString();
    pageInput.max = totalPages.toString();
  }
  
  // Update the "of X" text
  const ofSpan = paginationControls.querySelector('span:last-of-type');
  if (ofSpan) {
    ofSpan.textContent = `of ${totalPages}`;
  }
}

function hidePaginationControls(): void {
  paginationControls.classList.add('hidden');
  paginationControls.classList.remove('flex');
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
      const isSupported = viewer.canHandle(mockFile);
      const rowClass = isSupported ? '' : 'unsupported-file';
      
      row.className = rowClass;
      row.innerHTML = `
        <td class="file-name" title="${file.name}">${file.name}</td>
        <td class="file-size">${formatFileSize(file.size)}</td>
        <td class="file-type">${file.type}</td>
        <td><button class="bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-3 rounded text-xs transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed" data-file-path="${file.path}" data-file-name="${file.name}" data-file-type="${file.type}" ${!isSupported ? 'disabled' : ''}>View</button></td>
      `;
      
      filesTableBody.appendChild(row);
    });

    // Add click handlers to view buttons
    const viewButtons = filesTableBody.querySelectorAll('button:not([disabled])');
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
      return viewer.canHandle(mockFile);
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
  messageDiv.className = `message ${isError ? 'error' : 'success'}`;
  messageDiv.textContent = message;
  messageContainer.appendChild(messageDiv);
  
  // Auto-hide non-error messages after 3 seconds
  if (!isError) {
    setTimeout(() => {
      if (messageContainer.contains(messageDiv)) {
        messageDiv.style.transition = 'opacity 0.5s ease-out';
        messageDiv.style.opacity = '0';
        setTimeout(() => {
          if (messageContainer.contains(messageDiv)) {
            messageContainer.removeChild(messageDiv);
          }
        }, 500);
      }
    }, 3000);
  }
}

// Handle file viewing with new API
async function viewFile(file: File): Promise<void> {
  try {
    messageContainer.innerHTML = '';
    viewerContainer.classList.remove('viewer-container');
    viewerContainer.classList.add('viewer-container');
    viewerContainer.innerHTML = ''; // Clear the no-file message
    
    // Create DOM adapter for this container
    domViewer = new DOMFileViewer(viewerContainer, {
      showFileInfo: true,
      enablePagination: true,
      maxDimensions: { width: 1200, height: 800 }
    });

    // Load file using DOM adapter
    const result = await domViewer.loadFile(file);

    if (result.success) {
      showMessage(`Successfully loaded: ${file.name}`);
    } else {
      showMessage(`Error: ${result.error}`, true);
      viewerContainer.innerHTML = '<div class="no-file-message text-center text-gray-500 text-lg"><p>📷 Select a file from the list to view it here</p></div>';
      domViewer = null;
      hidePaginationControls();
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    showMessage(`Unexpected error: ${errorMessage}`, true);
    viewerContainer.innerHTML = '<div class="no-file-message text-center text-gray-500 text-lg"><p>📷 Select a file from the list to view it here</p></div>';
    domViewer = null;
    hidePaginationControls();
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
  setupPaginationControls();
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
