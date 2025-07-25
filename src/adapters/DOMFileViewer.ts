import { BrowserFileViewer } from '../BrowserFileViewer';
import { ViewerConfig, RenderResult } from '../types';
import { CanvasRenderer } from '../core/renderers/CanvasRenderer';

/**
 * DOM adapter for BrowserFileViewer
 * Provides simple DOM integration while maintaining framework-agnostic core
 */
export class DOMFileViewer {
  private viewer: BrowserFileViewer;
  private container: HTMLElement;
  private canvas?: HTMLCanvasElement;
  private paginationContainer?: HTMLElement;

  constructor(container: HTMLElement, config?: ViewerConfig) {
    this.container = container;

    // Create viewer with DOM-specific defaults
    this.viewer = new BrowserFileViewer({
      renderer: new CanvasRenderer(),
      showFileInfo: true,
      enablePagination: true,
      ...config,
    });

    this.setupDOM();
    this.setupEventListeners();
  }

  /**
   * Load and display a file
   */
  async loadFile(file: File): Promise<RenderResult> {
    try {
      // Load file data
      const loadResult = await this.viewer.loadFile(file);

      if (!loadResult.success) {
        return {
          success: false,
          error: loadResult.error,
        };
      }

      // Render to canvas
      await this.render();

      // Update pagination if needed
      this.updatePaginationControls();

      return {
        success: true,
        element: this.container,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.showError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Navigate to next page
   */
  async nextPage(): Promise<void> {
    await this.viewer.nextPage();
    await this.render();
    this.updatePaginationControls();
  }

  /**
   * Navigate to previous page
   */
  async previousPage(): Promise<void> {
    await this.viewer.previousPage();
    await this.render();
    this.updatePaginationControls();
  }

  /**
   * Jump to specific page (1-based)
   */
  async jumpToPage(pageNumber: number): Promise<void> {
    await this.viewer.jumpToPage(pageNumber);
    await this.render();
    this.updatePaginationControls();
  }

  /**
   * Get pagination info
   */
  getPaginationInfo() {
    return this.viewer.getPaginationInfo();
  }

  /**
   * Check if file can be handled
   */
  canHandle(file: File): boolean {
    return this.viewer.canHandle(file);
  }

  /**
   * Get supported file types
   */
  getSupportedTypes(): string[] {
    return this.viewer.getSupportedTypes();
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.viewer.destroy();
    this.container.innerHTML = '';
  }

  /**
   * Set up DOM structure
   */
  private setupDOM(): void {
    this.container.innerHTML = '';
    this.container.className = 'browser-file-viewer-container';

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'browser-file-viewer-canvas';
    this.canvas.style.display = 'block';
    this.canvas.style.maxWidth = '100%';
    this.canvas.style.maxHeight = '100%';
    this.canvas.style.border = '1px solid #ddd';
    this.canvas.style.borderRadius = '4px';

    // Create pagination container
    this.paginationContainer = document.createElement('div');
    this.paginationContainer.className = 'pagination-controls';
    this.paginationContainer.style.display = 'none';
    this.paginationContainer.style.marginTop = '10px';
    this.paginationContainer.style.textAlign = 'center';

    this.container.appendChild(this.canvas);
    this.container.appendChild(this.paginationContainer);

    // Set initial canvas size
    this.resizeCanvas();
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for viewer events
    this.viewer.addEventListener('pageChanged', () => {
      this.render();
      this.updatePaginationControls();
    });

    this.viewer.addEventListener('loaded', () => {
      this.updatePaginationControls();
    });

    this.viewer.addEventListener('error', (event: any) => {
      this.showError(event.detail.error);
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.render();
    });
  }

  /**
   * Render current page to canvas
   */
  private async render(): Promise<void> {
    if (!this.canvas) {
      return;
    }

    try {
      await this.viewer.renderToTarget(this.canvas, {
        maxWidth: this.canvas.width,
        maxHeight: this.canvas.height,
      });
    } catch (error) {
      console.error('Render error:', error);
    }
  }

  /**
   * Resize canvas to fit container
   */
  private resizeCanvas(): void {
    if (!this.canvas) {
      return;
    }

    const containerRect = this.container.getBoundingClientRect();
    const maxWidth = Math.max(400, containerRect.width - 20); // 10px padding each side
    const maxHeight = Math.max(300, window.innerHeight * 0.6);

    this.canvas.width = maxWidth;
    this.canvas.height = maxHeight;
  }

  /**
   * Update pagination controls
   */
  private updatePaginationControls(): void {
    if (!this.paginationContainer) {
      return;
    }

    const paginationInfo = this.viewer.getPaginationInfo();

    if (!paginationInfo || paginationInfo.totalPages <= 1) {
      this.paginationContainer.style.display = 'none';
      return;
    }

    const { currentPage, totalPages, canGoPrevious, canGoNext } =
      paginationInfo;

    this.paginationContainer.innerHTML = `
      <button id="prev-btn" ${!canGoPrevious ? 'disabled' : ''}>◀ Previous</button>
      <span>Page ${currentPage} of ${totalPages}</span>
      <input type="number" id="page-input" min="1" max="${totalPages}" value="${currentPage}" style="width: 60px; margin: 0 10px;">
      <button id="next-btn" ${!canGoNext ? 'disabled' : ''}>Next ▶</button>
    `;

    this.paginationContainer.style.display = 'block';

    // Add event listeners
    const prevBtn = this.paginationContainer.querySelector(
      '#prev-btn'
    ) as HTMLButtonElement;
    const nextBtn = this.paginationContainer.querySelector(
      '#next-btn'
    ) as HTMLButtonElement;
    const pageInput = this.paginationContainer.querySelector(
      '#page-input'
    ) as HTMLInputElement;

    prevBtn.addEventListener('click', () => this.previousPage());
    nextBtn.addEventListener('click', () => this.nextPage());

    pageInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const pageNum = parseInt(target.value);
      if (pageNum >= 1 && pageNum <= totalPages) {
        this.jumpToPage(pageNum);
      } else {
        target.value = currentPage.toString();
      }
    });
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    this.container.innerHTML = `
      <div style="padding: 20px; text-align: center; color: #d32f2f; border: 1px solid #d32f2f; border-radius: 4px; background: #ffebee;">
        <strong>Error:</strong> ${message}
      </div>
    `;
  }
}
