<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Browser File Viewer Project Instructions

This is a TypeScript library project for viewing files in the browser. The library is framework-agnostic and designed to be used in any frontend application.

## Project Structure
- `src/` - Source code for the library
- `dist/` - Built library files
- `example/` - Example HTML application demonstrating usage
- Tests are located in `src/__tests__/`

## Key Guidelines
- Write TypeScript code with proper type definitions
- Follow the existing code patterns and interfaces
- Maintain framework-agnostic design - no dependencies on React, Vue, etc.
- Focus on browser compatibility and performance
- Add tests for new functionality
- Update example application when adding new features

## Current Features
- Image file viewing (JPEG, PNG, GIF, WebP, SVG, BMP)
- File information display
- Drag and drop support
- Error handling

## Architecture
- `BrowserFileViewer` - Main class that orchestrates file viewing
- `FileViewer` interface - Contract for specific file type viewers
- `ImageViewer` - Implementation for image files
- `FileUtils` - Utility functions for file operations
- Type definitions in `types.ts`

## Future Extensions
The library is designed to be extensible. New file type viewers can be added by:
1. Implementing the `FileViewer` interface
2. Registering the viewer in `BrowserFileViewer`
3. Adding appropriate file type detection in `FileUtils`
