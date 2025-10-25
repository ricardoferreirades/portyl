# Renderer

Abstract base class for rendering implementations. Defines the contract for rendering image pages to different targets with various options.

## Abstract Methods

### `render(page: ImagePage, target: RenderTarget, options?: RenderOptions): Promise<void>`

Renders an image page to a target.

**Parameters:**
- `page` - The image page to render
- `target` - The render target (e.g., HTMLCanvasElement)
- `options` (optional) - Rendering options

**Returns:** `Promise<void>`

**Example:**
```typescript
class CustomRenderer extends Renderer {
  async render(page: ImagePage, target: RenderTarget, options?: RenderOptions): Promise<void> {
    // Custom rendering implementation
  }
}
```

### `clear(target: RenderTarget): void`

Clears the render target.

**Parameters:**
- `target` - The render target to clear

**Example:**
```typescript
class CustomRenderer extends Renderer {
  clear(target: RenderTarget): void {
    // Clear the target
  }
}
```

### `resize(target: RenderTarget, newWidth: number, newHeight: number): void`

Resizes the render target.

**Parameters:**
- `target` - The render target to resize
- `newWidth` - New width
- `newHeight` - New height

**Example:**
```typescript
class CustomRenderer extends Renderer {
  resize(target: RenderTarget, newWidth: number, newHeight: number): void {
    // Resize the target
  }
}
```

## Concrete Methods

### `calculateDimensions(imageWidth: number, imageHeight: number, maxWidth: number, maxHeight: number, preserveAspectRatio: boolean = true): { width: number; height: number }`

Calculates dimensions maintaining aspect ratio.

**Parameters:**
- `imageWidth` - Original image width
- `imageHeight` - Original image height
- `maxWidth` - Maximum width
- `maxHeight` - Maximum height
- `preserveAspectRatio` - Whether to preserve aspect ratio

**Returns:** `{ width: number; height: number }` - Calculated dimensions

**Example:**
```typescript
const dimensions = renderer.calculateDimensions(
  1920, 1080, 800, 600, true
);
console.log(`Rendered size: ${dimensions.width}x${dimensions.height}`);
```

## Data Structures

### `RenderOptions`

```typescript
interface RenderOptions {
  maxWidth?: number;           // Maximum width
  maxHeight?: number;          // Maximum height
  showFileInfo?: boolean;      // Show file information overlay
  preserveAspectRatio?: boolean; // Preserve aspect ratio
  backgroundColor?: string;     // Background color
  className?: string;          // CSS class name
}
```

### `RenderTarget`

```typescript
interface RenderTarget {
  width: number;   // Target width
  height: number;  // Target height
}
```

## Creating a Custom Renderer

```typescript
import { Renderer, ImagePage, RenderTarget, RenderOptions } from 'portyl';

class CustomCanvasRenderer extends Renderer {
  async render(
    page: ImagePage, 
    target: RenderTarget, 
    options?: RenderOptions
  ): Promise<void> {
    const canvas = target as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    
    // Clear canvas
    this.clear(target);
    
    // Set background color
    if (options?.backgroundColor) {
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Calculate dimensions
    const dimensions = this.calculateDimensions(
      page.imageData.width,
      page.imageData.height,
      options?.maxWidth || canvas.width,
      options?.maxHeight || canvas.height,
      options?.preserveAspectRatio ?? true
    );
    
    // Create image data
    const imageData = new ImageData(
      page.imageData.data,
      page.imageData.width,
      page.imageData.height
    );
    
    // Create temporary canvas for scaling
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCanvas.width = page.imageData.width;
    tempCanvas.height = page.imageData.height;
    tempCtx.putImageData(imageData, 0, 0);
    
    // Draw scaled image
    ctx.drawImage(
      tempCanvas,
      0, 0, page.imageData.width, page.imageData.height,
      0, 0, dimensions.width, dimensions.height
    );
    
    // Add file info overlay if requested
    if (options?.showFileInfo) {
      this.drawFileInfo(ctx, page, dimensions);
    }
  }
  
  clear(target: RenderTarget): void {
    const canvas = target as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  resize(target: RenderTarget, newWidth: number, newHeight: number): void {
    const canvas = target as HTMLCanvasElement;
    canvas.width = newWidth;
    canvas.height = newHeight;
  }
  
  private drawFileInfo(ctx: CanvasRenderingContext2D, page: ImagePage, dimensions: { width: number; height: number }): void {
    const info = `Page ${page.index + 1} - ${dimensions.width}x${dimensions.height}`;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, ctx.measureText(info).width + 20, 30);
    
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText(info, 20, 28);
  }
}
```

## WebGL Renderer Example

```typescript
class WebGLRenderer extends Renderer {
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  
  async render(
    page: ImagePage, 
    target: RenderTarget, 
    options?: RenderOptions
  ): Promise<void> {
    const canvas = target as HTMLCanvasElement;
    
    if (!this.gl) {
      this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!this.gl) {
        throw new Error('WebGL not supported');
      }
      this.setupWebGL();
    }
    
    // WebGL rendering implementation
    this.renderWithWebGL(page, options);
  }
  
  private setupWebGL(): void {
    const gl = this.gl!;
    
    // Setup shaders, buffers, etc.
    const vertexShader = this.createShader(gl.VERTEX_SHADER, `
      attribute vec2 position;
      varying vec2 vTexCoord;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
        vTexCoord = (position + 1.0) * 0.5;
      }
    `);
    
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      varying vec2 vTexCoord;
      uniform sampler2D uTexture;
      void main() {
        gl_FragColor = texture2D(uTexture, vTexCoord);
      }
    `);
    
    this.program = this.createProgram(vertexShader, fragmentShader);
  }
  
  private renderWithWebGL(page: ImagePage, options?: RenderOptions): void {
    // WebGL rendering logic
  }
  
  clear(target: RenderTarget): void {
    const canvas = target as HTMLCanvasElement;
    const gl = canvas.getContext('webgl');
    if (gl) {
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }
  
  resize(target: RenderTarget, newWidth: number, newHeight: number): void {
    const canvas = target as HTMLCanvasElement;
    canvas.width = newWidth;
    canvas.height = newHeight;
    
    if (this.gl) {
      this.gl.viewport(0, 0, newWidth, newHeight);
    }
  }
  
  private createShader(type: number, source: string): WebGLShader {
    const gl = this.gl!;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }
  
  private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    const gl = this.gl!;
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    return program;
  }
}
```

## SVG Renderer Example

```typescript
class SVGRenderer extends Renderer {
  async render(
    page: ImagePage, 
    target: RenderTarget, 
    options?: RenderOptions
  ): Promise<void> {
    const svg = target as SVGElement;
    
    // Clear existing content
    this.clear(target);
    
    // Calculate dimensions
    const dimensions = this.calculateDimensions(
      page.imageData.width,
      page.imageData.height,
      options?.maxWidth || 800,
      options?.maxHeight || 600,
      options?.preserveAspectRatio ?? true
    );
    
    // Create image element
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('width', dimensions.width.toString());
    image.setAttribute('height', dimensions.height.toString());
    
    // Convert image data to data URL
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = page.imageData.width;
    canvas.height = page.imageData.height;
    
    const imageData = new ImageData(
      page.imageData.data,
      page.imageData.width,
      page.imageData.height
    );
    ctx.putImageData(imageData, 0, 0);
    
    image.setAttribute('href', canvas.toDataURL());
    svg.appendChild(image);
  }
  
  clear(target: RenderTarget): void {
    const svg = target as SVGElement;
    svg.innerHTML = '';
  }
  
  resize(target: RenderTarget, newWidth: number, newHeight: number): void {
    const svg = target as SVGElement;
    svg.setAttribute('width', newWidth.toString());
    svg.setAttribute('height', newHeight.toString());
  }
}
```

## Performance Considerations

### Memory Management

```typescript
class OptimizedRenderer extends Renderer {
  private imageCache = new Map<string, HTMLImageElement>();
  
  async render(page: ImagePage, target: RenderTarget, options?: RenderOptions): Promise<void> {
    // Use cached images when possible
    const cacheKey = `${page.index}-${page.imageData.width}-${page.imageData.height}`;
    
    if (this.imageCache.has(cacheKey)) {
      const cachedImage = this.imageCache.get(cacheKey)!;
      this.drawImage(cachedImage, target, options);
    } else {
      // Create and cache new image
      const image = await this.createImage(page);
      this.imageCache.set(cacheKey, image);
      this.drawImage(image, target, options);
    }
  }
  
  private async createImage(page: ImagePage): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = page.imageData.width;
      canvas.height = page.imageData.height;
      
      const imageData = new ImageData(
        page.imageData.data,
        page.imageData.width,
        page.imageData.height
      );
      ctx.putImageData(imageData, 0, 0);
      
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = canvas.toDataURL();
    });
  }
  
  private drawImage(image: HTMLImageElement, target: RenderTarget, options?: RenderOptions): void {
    // Draw the image to target
  }
}
```

## Error Handling

```typescript
class RobustRenderer extends Renderer {
  async render(page: ImagePage, target: RenderTarget, options?: RenderOptions): Promise<void> {
    try {
      await this.performRender(page, target, options);
    } catch (error) {
      console.error('Render error:', error);
      this.renderError(target, error.message);
    }
  }
  
  private renderError(target: RenderTarget, message: string): void {
    const canvas = target as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = '#ffebee';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#d32f2f';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Render Error', canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 10);
  }
}
```

## Related APIs

- [CanvasRenderer](/api/canvas-renderer) - Concrete canvas implementation
- [ImagePage](/api/types) - Page interface
- [RenderOptions](/api/types) - Render options interface
- [RenderTarget](/api/types) - Render target interface
