import { StateManager, StateListener, Unsubscribe } from './StateManager';

/**
 * File processor state interface
 * Immutable state for file processing operations
 */
export interface ProcessorState {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly isLoading: boolean;
  readonly isProcessing: boolean;
  readonly error?: string;
  readonly loadedAt?: Date;
  readonly fileInfo?: {
    readonly name: string;
    readonly size: number;
    readonly type: string;
  };
}

/**
 * State manager specialized for file processing
 * Provides type-safe methods for common processor operations
 */
export class ProcessorStateManager extends StateManager<ProcessorState> {
  constructor() {
    super({
      currentPage: 0,
      totalPages: 0,
      isLoading: false,
      isProcessing: false
    });
  }

  /**
   * Start loading a file
   */
  startLoading(fileInfo?: ProcessorState['fileInfo']): ProcessorState {
    return this.setState(prev => ({
      ...prev,
      isLoading: true,
      isProcessing: false,
      error: undefined,
      fileInfo
    }), 'startLoading');
  }

  /**
   * Finish loading and set total pages
   */
  finishLoading(totalPages: number): ProcessorState {
    return this.setState(prev => ({
      ...prev,
      isLoading: false,
      totalPages,
      currentPage: totalPages > 0 ? 0 : prev.currentPage,
      loadedAt: new Date()
    }), 'finishLoading');
  }

  /**
   * Start processing (e.g., rendering, transforming)
   */
  startProcessing(): ProcessorState {
    return this.setState(prev => ({
      ...prev,
      isProcessing: true,
      error: undefined
    }), 'startProcessing');
  }

  /**
   * Finish processing
   */
  finishProcessing(): ProcessorState {
    return this.setState(prev => ({
      ...prev,
      isProcessing: false
    }), 'finishProcessing');
  }

  /**
   * Set error state
   */
  setError(error: string): ProcessorState {
    return this.setState(prev => ({
      ...prev,
      isLoading: false,
      isProcessing: false,
      error
    }), 'setError');
  }

  /**
   * Navigate to specific page
   */
  navigateToPage(pageIndex: number): ProcessorState {
    return this.setState(prev => {
      // Validate page index
      if (pageIndex < 0 || pageIndex >= prev.totalPages) {
        console.warn(`Invalid page index: ${pageIndex} (total: ${prev.totalPages})`);
        return prev; // No change for invalid index
      }

      return {
        ...prev,
        currentPage: pageIndex
      };
    }, 'navigateToPage');
  }

  /**
   * Navigate to next page
   */
  nextPage(): ProcessorState {
    return this.setState(prev => {
      const nextIndex = prev.currentPage + 1;
      if (nextIndex >= prev.totalPages) {
        return prev; // No change if at last page
      }
      
      return {
        ...prev,
        currentPage: nextIndex
      };
    }, 'nextPage');
  }

  /**
   * Navigate to previous page
   */
  previousPage(): ProcessorState {
    return this.setState(prev => {
      const prevIndex = prev.currentPage - 1;
      if (prevIndex < 0) {
        return prev; // No change if at first page
      }
      
      return {
        ...prev,
        currentPage: prevIndex
      };
    }, 'previousPage');
  }

  /**
   * Reset to initial state
   */
  reset(): ProcessorState {
    return this.setState(() => ({
      currentPage: 0,
      totalPages: 0,
      isLoading: false,
      isProcessing: false
    }), 'reset');
  }

  /**
   * Get pagination info for UI
   */
  getPaginationInfo(): {
    currentPage: number;
    totalPages: number;
    canGoNext: boolean;
    canGoPrevious: boolean;
  } | null {
    const state = this.getState();
    
    if (state.totalPages <= 1) {
      return null;
    }

    return {
      currentPage: state.currentPage + 1, // 1-based for UI
      totalPages: state.totalPages,
      canGoNext: state.currentPage < state.totalPages - 1,
      canGoPrevious: state.currentPage > 0
    };
  }

  /**
   * Check if currently loading
   */
  isLoading(): boolean {
    return this.getState().isLoading;
  }

  /**
   * Check if currently processing
   */
  isProcessing(): boolean {
    return this.getState().isProcessing;
  }

  /**
   * Check if has error
   */
  hasError(): boolean {
    return !!this.getState().error;
  }

  /**
   * Subscribe to specific state changes
   */
  subscribeToLoading(listener: (isLoading: boolean) => void): Unsubscribe {
    return this.subscribe((current, previous) => {
      if (current.isLoading !== previous.isLoading) {
        listener(current.isLoading);
      }
    });
  }

  /**
   * Subscribe to page changes
   */
  subscribeToPageChanges(listener: (currentPage: number, totalPages: number) => void): Unsubscribe {
    return this.subscribe((current, previous) => {
      if (current.currentPage !== previous.currentPage || current.totalPages !== previous.totalPages) {
        listener(current.currentPage, current.totalPages);
      }
    });
  }

  /**
   * Subscribe to errors
   */
  subscribeToErrors(listener: (error: string | undefined) => void): Unsubscribe {
    return this.subscribe((current, previous) => {
      if (current.error !== previous.error) {
        listener(current.error);
      }
    });
  }

  /**
   * Clear current error
   */
  clearError(): void {
    this.setState(current => ({ ...current, error: undefined }));
  }

  /**
   * Reset to initial state
   */
  resetState(): void {
    this.setState(() => this.getInitialState());
  }

  /**
   * Get initial state
   */
  private getInitialState(): ProcessorState {
    return {
      currentPage: 0,
      totalPages: 0,
      isLoading: false,
      isProcessing: false,
      error: undefined,
      fileInfo: undefined
    };
  }
}
