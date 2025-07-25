/**
 * Core data structures for file processing
 */
export interface ImageData {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  format: 'rgba' | 'rgb';
}

export interface ImagePage {
  index: number;
  imageData: ImageData;
  metadata?: Record<string, any>;
}

export interface ProcessorState {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error?: string;
}

/**
 * Abstract base class for file processors
 * Framework-agnostic file processing logic
 */
export abstract class FileProcessor extends EventTarget {
  protected state: ProcessorState = {
    currentPage: 0,
    totalPages: 0,
    isLoading: false
  };

  abstract canHandle(file: File): boolean;
  abstract loadFile(file: File): Promise<void>;
  abstract getPages(): ImagePage[];
  abstract getCurrentPage(): ImagePage | null;
  abstract navigateToPage(index: number): Promise<void>;
  
  /**
   * Get current processor state
   */
  getState(): ProcessorState {
    return { ...this.state };
  }

  /**
   * Navigate to next page
   */
  async nextPage(): Promise<void> {
    if (this.state.currentPage < this.state.totalPages - 1) {
      await this.navigateToPage(this.state.currentPage + 1);
    }
  }

  /**
   * Navigate to previous page
   */
  async previousPage(): Promise<void> {
    if (this.state.currentPage > 0) {
      await this.navigateToPage(this.state.currentPage - 1);
    }
  }

  /**
   * Check if can go to next page
   */
  canGoNext(): boolean {
    return this.state.currentPage < this.state.totalPages - 1;
  }

  /**
   * Check if can go to previous page
   */
  canGoPrevious(): boolean {
    return this.state.currentPage > 0;
  }

  /**
   * Get pagination info
   */
  getPaginationInfo(): { currentPage: number; totalPages: number; canGoNext: boolean; canGoPrevious: boolean } | null {
    if (this.state.totalPages <= 1) {
      return null;
    }

    return {
      currentPage: this.state.currentPage + 1, // 1-based for UI
      totalPages: this.state.totalPages,
      canGoNext: this.canGoNext(),
      canGoPrevious: this.canGoPrevious()
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Base cleanup - can be overridden
  }
}
