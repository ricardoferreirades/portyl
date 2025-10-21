# Your First Viewer

In this tutorial, you'll build your first file viewer with Portyl in just a few minutes. By the end, you'll have a working image viewer that can display files selected by users.

## What You'll Build

A simple but functional file viewer that:
- ✅ Accepts file input
- ✅ Displays images on canvas
- ✅ Shows file information
- ✅ Handles errors gracefully

## Prerequisites

- Basic HTML, CSS, and JavaScript knowledge
- A code editor
- A web browser
- Node.js installed (for local development)

## Step 1: Set Up Your Project

Create a new directory and initialize your project:

```bash
mkdir my-file-viewer
cd my-file-viewer
npm init -y
```

Install Portyl:

```bash
npm install portyl
```

## Step 2: Create the HTML Structure

Create an `index.html` file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My First File Viewer</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
    }
    
    .file-input-container {
      margin-bottom: 20px;
    }
    
    .file-input-container input {
      padding: 10px;
      border: 2px solid #3c82f6;
      border-radius: 4px;
      font-size: 16px;
    }
    
    #viewer-container {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 20px;
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f9fafb;
    }
    
    #viewer-container.has-file {
      border-style: solid;
      border-color: #3c82f6;
      background: white;
    }
    
    .placeholder {
      text-align: center;
      color: #6b7280;
    }
    
    canvas {
      max-width: 100%;
      border-radius: 4px;
    }
    
    .error {
      color: #dc2626;
      background: #fee2e2;
      padding: 15px;
      border-radius: 4px;
      border-left: 4px solid #dc2626;
    }
  </style>
</head>
<body>
  <h1>🖼️ My File Viewer</h1>
  
  <div class="file-input-container">
    <label for="file-input">Select an image file:</label>
    <input type="file" id="file-input" accept="image/*">
  </div>
  
  <div id="viewer-container">
    <div class="placeholder">
      <p>👆 Select a file to preview</p>
    </div>
  </div>

  <script type="module" src="./main.js"></script>
</body>
</html>
```

## Step 3: Write the JavaScript

Create a `main.js` file:

```javascript
import { DOMFileViewer } from 'portyl';

// Get DOM elements
const fileInput = document.getElementById('file-input');
const container = document.getElementById('viewer-container');

// Create viewer instance
const viewer = new DOMFileViewer(container, {
  maxDimensions: { width: 800, height: 600 },
  showFileInfo: true,
  preserveAspectRatio: true
});

// Handle file selection
fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  
  if (!file) {
    return;
  }
  
  // Check if file is supported
  if (!viewer.canHandle(file)) {
    showError('Unsupported file type');
    return;
  }
  
  try {
    // Load and display the file
    container.classList.add('has-file');
    const result = await viewer.loadFile(file);
    
    if (!result.success) {
      showError(result.error || 'Failed to load file');
    }
  } catch (error) {
    showError(error.message);
  }
});

// Helper function to show errors
function showError(message) {
  container.innerHTML = `
    <div class="error">
      <strong>Error:</strong> ${message}
    </div>
  `;
}
```

## Step 4: Set Up a Dev Server

Add a dev server to your `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

Install Vite:

```bash
npm install -D vite
```

## Step 5: Run Your Viewer

Start the development server:

```bash
npm run dev
```

Open your browser to `http://localhost:5173` and you should see your file viewer!

## Step 6: Test It Out

1. Click the file input
2. Select an image file (JPEG, PNG, GIF, etc.)
3. Watch your image appear in the viewer!

## What Just Happened?

Let's break down what each part does:

### The DOMFileViewer

```javascript
const viewer = new DOMFileViewer(container, {
  maxDimensions: { width: 800, height: 600 },
  showFileInfo: true,
  preserveAspectRatio: true
});
```

`DOMFileViewer` is a convenience class that:
- Creates a canvas element
- Handles rendering automatically
- Manages pagination UI
- Cleans up resources

### File Loading

```javascript
const result = await viewer.loadFile(file);
```

This single line:
1. Reads the file data
2. Parses the image format
3. Creates a canvas
4. Renders the image
5. Returns the result

### File Type Checking

```javascript
if (!viewer.canHandle(file)) {
  showError('Unsupported file type');
  return;
}
```

Always check if a file type is supported before loading.

## Congratulations! 🎉

You've built your first file viewer with Portyl! In just a few lines of code, you have a working image viewer.

## Next Steps

Now that you have a basic viewer working, try these enhancements:

### Add Drag and Drop

```javascript
container.addEventListener('dragover', (e) => {
  e.preventDefault();
  container.style.borderColor = '#3c82f6';
});

container.addEventListener('drop', async (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  
  if (file && viewer.canHandle(file)) {
    await viewer.loadFile(file);
  }
});
```

### Display File Information

```javascript
fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Show file info
  const fileInfo = viewer.getFileInfo(file);
  console.log('File name:', fileInfo.name);
  console.log('File size:', viewer.formatFileSize(fileInfo.size));
  console.log('File type:', fileInfo.type);
  
  await viewer.loadFile(file);
});
```

### Handle Multi-Page Files

```javascript
// After loading a file
const paginationInfo = viewer.getPaginationInfo();

if (paginationInfo && paginationInfo.totalPages > 1) {
  console.log(`File has ${paginationInfo.totalPages} pages`);
  
  // Add navigation buttons
  // (DOMFileViewer does this automatically!)
}
```

## Learn More

- [**Adding Pagination**](/tutorial/pagination) - Handle multi-page files
- [**File Upload**](/tutorial/file-upload) - Build a complete upload system
- [**Drag and Drop**](/tutorial/drag-drop) - Add drag and drop support
- [**Core Concepts**](/guide/core-concepts) - Understand how it works

## Full Source Code

You can find the complete source code for this tutorial on [GitHub](https://github.com/ricardoferreirades/portyl/tree/main/examples/first-viewer).

## Need Help?

- Check the [FAQ](/guide/faq)
- Read the [Troubleshooting Guide](/guide/troubleshooting)
- Ask on [GitHub Discussions](https://github.com/ricardoferreirades/portyl/discussions)

