/**
 * Framework-agnostic state management core
 * Pure TypeScript with immutable state patterns
 */

export type StateListener<T> = (current: T, previous: T) => void;
export type Unsubscribe = () => void;
export type StateUpdater<T> = (previous: T) => T;

/**
 * State transition record for debugging and time travel
 */
export interface StateTransition<T> {
  readonly previous: T;
  readonly current: T;
  readonly timestamp: number;
  readonly source: string;
}

/**
 * Generic immutable state manager
 * Framework-agnostic, works in any JavaScript environment
 */
export class StateManager<T> {
  private _state: T;
  private _subscribers = new Set<StateListener<T>>();
  private _history: StateTransition<T>[] = [];
  private readonly _maxHistorySize: number;

  constructor(initialState: T, maxHistorySize: number = 50) {
    this._state = this.deepFreeze(initialState);
    this._maxHistorySize = maxHistorySize;
  }

  /**
   * Get current state (immutable copy)
   */
  getState(): T {
    return this._state;
  }

  /**
   * Update state immutably
   */
  setState(updater: StateUpdater<T>, source: string = 'unknown'): T {
    const previous = this._state;
    const updated = updater(previous);

    // Ensure immutability
    const current = this.deepFreeze({ ...updated });

    // Only update if state actually changed
    if (!this.isEqual(previous, current)) {
      this._state = current;

      // Record transition
      this.recordTransition(previous, current, source);

      // Notify subscribers
      this.notifySubscribers(current, previous);
    }

    return current;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: StateListener<T>): Unsubscribe {
    this._subscribers.add(listener);

    // Return unsubscribe function
    return () => {
      this._subscribers.delete(listener);
    };
  }

  /**
   * Get state history for debugging
   */
  getHistory(): readonly StateTransition<T>[] {
    return [...this._history];
  }

  /**
   * Clear history (useful for memory management)
   */
  clearHistory(): void {
    this._history = [];
  }

  /**
   * Time travel to a previous state (debugging feature)
   */
  revertToState(targetState: T, source: string = 'revert'): T {
    return this.setState(() => targetState, source);
  }

  /**
   * Destroy state manager and clean up
   */
  destroy(): void {
    this._subscribers.clear();
    this._history = [];
  }

  /**
   * Notify all subscribers of state change
   */
  private notifySubscribers(current: T, previous: T): void {
    // Use setTimeout to ensure notifications are async and don't block
    setTimeout(() => {
      this._subscribers.forEach((listener) => {
        try {
          listener(current, previous);
        } catch (error) {
          console.error('StateManager: Subscriber error:', error);
        }
      });
    }, 0);
  }

  /**
   * Record state transition for debugging
   */
  private recordTransition(previous: T, current: T, source: string): void {
    const transition: StateTransition<T> = {
      previous,
      current,
      timestamp: Date.now(),
      source,
    };

    this._history.push(transition);

    // Limit history size to prevent memory leaks
    if (this._history.length > this._maxHistorySize) {
      this._history = this._history.slice(-this._maxHistorySize);
    }
  }

  /**
   * Deep freeze object to ensure immutability
   */
  private deepFreeze<U>(obj: U): U {
    // Get property names
    const propNames = Object.getOwnPropertyNames(obj);

    // Freeze properties before freezing self
    for (const name of propNames) {
      const value = (obj as any)[name];
      if (value && typeof value === 'object') {
        this.deepFreeze(value);
      }
    }

    return Object.freeze(obj);
  }

  /**
   * Shallow equality check for performance
   */
  private isEqual(a: T, b: T): boolean {
    if (a === b) {
      return true;
    }
    if (typeof a !== 'object' || typeof b !== 'object') {
      return false;
    }
    if (a === null || b === null) {
      return false;
    }

    const keysA = Object.keys(a as object);
    const keysB = Object.keys(b as object);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (const key of keysA) {
      if (!keysB.includes(key)) {
        return false;
      }
      if ((a as any)[key] !== (b as any)[key]) {
        return false;
      }
    }

    return true;
  }
}
