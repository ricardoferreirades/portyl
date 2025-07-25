import { ProcessorStateManager, ProcessorState } from '../state/ProcessorStateManager';
import { Unsubscribe } from '../state/StateManager';

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

// Re-export ProcessorState for backward compatibility
export { ProcessorState } from '../state/ProcessorStateManager';

/**
 * Abstract base class for file processors
 * Framework-agnostic file processing logic with pure state management
 */
export abstract class FileProcessor {
  protected stateManager: ProcessorStateManager;
  private subscriptions: Unsubscribe[] = [];

  constructor(stateManager?: ProcessorStateManager) {
    this.stateManager = stateManager || new ProcessorStateManager();
    
    // Set up internal event forwarding for backward compatibility
    this.setupEventForwarding();
  }

  abstract canHandle(file: File): boolean;
  abstract loadFile(file: File): Promise<void>;
  abstract getPages(): ImagePage[];
  abstract getCurrentPage(): ImagePage | null;
  abstract navigateToPage(index: number): Promise<void>;
  
  /**
   * Get current processor state (immutable)
   */
  getState(): ProcessorState {
    return this.stateManager.getState();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (current: ProcessorState, previous: ProcessorState) => void): Unsubscribe {
    return this.stateManager.subscribe(listener);
  }

  /**
   * Navigate to next page
   */
  async nextPage(): Promise<void> {
    const state = this.stateManager.getState();
    if (state.currentPage < state.totalPages - 1) {
      await this.navigateToPage(state.currentPage + 1);
    }
  }

  /**
   * Navigate to previous page
   */
  async previousPage(): Promise<void> {
    const state = this.stateManager.getState();
    if (state.currentPage > 0) {
      await this.navigateToPage(state.currentPage - 1);
    }
  }

  /**
   * Check if can go to next page
   */
  canGoNext(): boolean {
    const state = this.stateManager.getState();
    return state.currentPage < state.totalPages - 1;
  }

  /**
   * Check if can go to previous page
   */
  canGoPrevious(): boolean {
    const state = this.stateManager.getState();
    return state.currentPage > 0;
  }

  /**
   * Get pagination info
   */
  getPaginationInfo(): { currentPage: number; totalPages: number; canGoNext: boolean; canGoPrevious: boolean } | null {
    return this.stateManager.getPaginationInfo();
  }

  /**
   * Setup event forwarding for backward compatibility with EventTarget pattern
   */
  private setupEventForwarding(): void {
    // Forward state changes as events for backward compatibility
    this.subscriptions.push(
      this.stateManager.subscribe((current, previous) => {
        // Dispatch state change event
        if (this.eventTarget) {
          this.eventTarget.dispatchEvent(new CustomEvent('stateChange', {
            detail: { current, previous }
          }));
        }

        // Dispatch specific events for major state changes
        if (current.isLoading !== previous.isLoading) {
          const eventType = current.isLoading ? 'loadingStart' : 'loadingEnd';
          if (this.eventTarget) {
            this.eventTarget.dispatchEvent(new CustomEvent(eventType, {
              detail: current
            }));
          }
        }

        if (current.currentPage !== previous.currentPage) {
          if (this.eventTarget) {
            this.eventTarget.dispatchEvent(new CustomEvent('pageChanged', {
              detail: {
                currentPage: current.currentPage,
                totalPages: current.totalPages
              }
            }));
          }
        }

        if (current.error && current.error !== previous.error) {
          if (this.eventTarget) {
            this.eventTarget.dispatchEvent(new CustomEvent('error', {
              detail: { error: current.error }
            }));
          }
        }

        if (!current.isLoading && previous.isLoading && !current.error) {
          if (this.eventTarget) {
            this.eventTarget.dispatchEvent(new CustomEvent('loaded', {
              detail: {
                totalPages: current.totalPages,
                state: current
              }
            }));
          }
        }
      })
    );
  }

  /**
   * Set event target for backward compatibility
   */
  private eventTarget?: EventTarget;

  setEventTarget(eventTarget: EventTarget): void {
    this.eventTarget = eventTarget;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Unsubscribe from all state changes
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
    
    // Destroy state manager
    this.stateManager.destroy();
    
    // Clear event target reference
    this.eventTarget = undefined;
  }
}
