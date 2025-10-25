# StateManager

Generic immutable state manager for framework-agnostic state management. Provides immutable state patterns, event-driven architecture, and time-travel debugging support.

## Constructor

```typescript
new StateManager<T>(initialState: T, maxHistorySize?: number)
```

### Parameters

- `initialState` - Initial state value
- `maxHistorySize` (optional) - Maximum history size for time-travel debugging (default: 50)

## Methods

### `getState(): T`

Gets the current state (immutable copy).

**Returns:** `T` - Current state

**Example:**
```typescript
const stateManager = new StateManager({ count: 0 });
const currentState = stateManager.getState();
console.log(currentState.count); // 0
```

### `setState(updater: StateUpdater<T>, source?: string): T`

Updates state immutably.

**Parameters:**
- `updater` - Function that takes previous state and returns new state
- `source` (optional) - Source identifier for debugging

**Returns:** `T` - New state

**Example:**
```typescript
const newState = stateManager.setState(prev => ({
  ...prev,
  count: prev.count + 1
}), 'increment');
```

### `subscribe(listener: StateListener<T>): Unsubscribe`

Subscribes to state changes.

**Parameters:**
- `listener` - State change listener function

**Returns:** `Unsubscribe` - Unsubscribe function

**Example:**
```typescript
const unsubscribe = stateManager.subscribe((current, previous) => {
  console.log('State changed:', current);
});

// Later, unsubscribe
unsubscribe();
```

### `getHistory(): readonly StateTransition<T>[]`

Gets state history for debugging.

**Returns:** `readonly StateTransition<T>[]` - State transition history

**Example:**
```typescript
const history = stateManager.getHistory();
console.log(`Total transitions: ${history.length}`);
```

### `clearHistory(): void`

Clears state history.

**Example:**
```typescript
stateManager.clearHistory();
```

### `revertToState(targetState: T, source?: string): T`

Time travel to a previous state (debugging feature).

**Parameters:**
- `targetState` - State to revert to
- `source` (optional) - Source identifier

**Returns:** `T` - Reverted state

**Example:**
```typescript
const revertedState = stateManager.revertToState(previousState, 'debug');
```

### `destroy(): void`

Destroys the state manager and cleans up resources.

**Example:**
```typescript
stateManager.destroy();
```

## Type Definitions

### `StateListener<T>`

State change listener type.

```typescript
type StateListener<T> = (current: T, previous: T) => void;
```

### `Unsubscribe`

Unsubscribe function type.

```typescript
type Unsubscribe = () => void;
```

### `StateUpdater<T>`

State updater function type.

```typescript
type StateUpdater<T> = (previous: T) => T;
```

### `StateTransition<T>`

State transition record type.

```typescript
interface StateTransition<T> {
  readonly previous: T;
  readonly current: T;
  readonly timestamp: number;
  readonly source: string;
}
```

## Usage Examples

### Basic State Management

```typescript
interface AppState {
  count: number;
  message: string;
  isLoading: boolean;
}

const initialState: AppState = {
  count: 0,
  message: 'Hello',
  isLoading: false
};

const stateManager = new StateManager(initialState);

// Update state
stateManager.setState(prev => ({
  ...prev,
  count: prev.count + 1
}));

// Subscribe to changes
stateManager.subscribe((current, previous) => {
  console.log('Count changed from', previous.count, 'to', current.count);
});
```

### Complex State Updates

```typescript
interface UserState {
  user: User | null;
  preferences: UserPreferences;
  isLoading: boolean;
  error: string | null;
}

const userStateManager = new StateManager<UserState>({
  user: null,
  preferences: { theme: 'light', language: 'en' },
  isLoading: false,
  error: null
});

// Login user
userStateManager.setState(prev => ({
  ...prev,
  isLoading: true,
  error: null
}), 'login-start');

// Set user after successful login
userStateManager.setState(prev => ({
  ...prev,
  user: { id: 1, name: 'John Doe', email: 'john@example.com' },
  isLoading: false
}), 'login-success');

// Handle login error
userStateManager.setState(prev => ({
  ...prev,
  error: 'Login failed',
  isLoading: false
}), 'login-error');
```

### State History and Time Travel

```typescript
// Enable time-travel debugging
const debugStateManager = new StateManager(initialState, 100);

// Make several state changes
debugStateManager.setState(prev => ({ ...prev, count: 1 }), 'increment');
debugStateManager.setState(prev => ({ ...prev, count: 2 }), 'increment');
debugStateManager.setState(prev => ({ ...prev, count: 3 }), 'increment');

// Get history
const history = debugStateManager.getHistory();
console.log('State history:', history);

// Time travel to previous state
const previousState = history[history.length - 2].current;
debugStateManager.revertToState(previousState, 'time-travel');
```

### Framework Integration

#### React Hook

```typescript
import { useState, useEffect, useRef } from 'react';
import { StateManager } from 'portyl';

function useStateManager<T>(initialState: T) {
  const stateManagerRef = useRef<StateManager<T>>();
  const [state, setState] = useState<T>(initialState);

  useEffect(() => {
    stateManagerRef.current = new StateManager(initialState);
    
    const unsubscribe = stateManagerRef.current.subscribe((current) => {
      setState(current);
    });

    return () => {
      unsubscribe();
      stateManagerRef.current?.destroy();
    };
  }, []);

  const updateState = (updater: (prev: T) => T) => {
    stateManagerRef.current?.setState(updater);
  };

  return [state, updateState] as const;
}

// Usage
function Counter() {
  const [state, updateState] = useStateManager({ count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => updateState(prev => ({ ...prev, count: prev.count + 1 }))}>
        Increment
      </button>
    </div>
  );
}
```

#### Vue Composition API

```typescript
import { ref, onMounted, onUnmounted } from 'vue';
import { StateManager } from 'portyl';

export function useStateManager<T>(initialState: T) {
  const state = ref<T>(initialState);
  let stateManager: StateManager<T>;

  onMounted(() => {
    stateManager = new StateManager(initialState);
    
    const unsubscribe = stateManager.subscribe((current) => {
      state.value = current;
    });
    
    onUnmounted(() => {
      unsubscribe();
      stateManager.destroy();
    });
  });

  const updateState = (updater: (prev: T) => T) => {
    stateManager?.setState(updater);
  };

  return { state, updateState };
}

// Usage
export default {
  setup() {
    const { state, updateState } = useStateManager({ count: 0 });

    const increment = () => {
      updateState(prev => ({ ...prev, count: prev.count + 1 }));
    };

    return { state, increment };
  }
};
```

#### Angular Service

```typescript
import { Injectable, BehaviorSubject } from '@angular/core';
import { StateManager } from 'portyl';

@Injectable()
export class StateService<T> {
  private stateManager: StateManager<T>;
  private stateSubject = new BehaviorSubject<T>(this.initialState);

  constructor(private initialState: T) {
    this.stateManager = new StateManager(initialState);
    
    this.stateManager.subscribe((current) => {
      this.stateSubject.next(current);
    });
  }

  getState(): T {
    return this.stateManager.getState();
  }

  setState(updater: (prev: T) => T): T {
    return this.stateManager.setState(updater);
  }

  get state$() {
    return this.stateSubject.asObservable();
  }

  destroy() {
    this.stateManager.destroy();
  }
}
```

### Advanced Patterns

#### State Middleware

```typescript
class StateManagerWithMiddleware<T> extends StateManager<T> {
  private middleware: Array<(state: T, action: string) => T> = [];

  addMiddleware(middleware: (state: T, action: string) => T) {
    this.middleware.push(middleware);
  }

  setState(updater: StateUpdater<T>, source: string = 'unknown'): T {
    const newState = super.setState(updater, source);
    
    // Apply middleware
    return this.middleware.reduce((state, middleware) => {
      return middleware(state, source);
    }, newState);
  }
}

// Usage
const stateManager = new StateManagerWithMiddleware(initialState);

// Add logging middleware
stateManager.addMiddleware((state, action) => {
  console.log(`Action: ${action}, State:`, state);
  return state;
});

// Add validation middleware
stateManager.addMiddleware((state, action) => {
  if (state.count < 0) {
    console.warn('Count cannot be negative');
    return { ...state, count: 0 };
  }
  return state;
});
```

#### State Persistence

```typescript
class PersistentStateManager<T> extends StateManager<T> {
  private storageKey: string;

  constructor(initialState: T, storageKey: string, maxHistorySize?: number) {
    super(initialState, maxHistorySize);
    this.storageKey = storageKey;
    this.loadFromStorage();
  }

  setState(updater: StateUpdater<T>, source: string = 'unknown'): T {
    const newState = super.setState(updater, source);
    this.saveToStorage(newState);
    return newState;
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsedState = JSON.parse(stored);
        super.setState(() => parsedState, 'load-from-storage');
      }
    } catch (error) {
      console.error('Failed to load state from storage:', error);
    }
  }

  private saveToStorage(state: T) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state to storage:', error);
    }
  }
}
```

## Performance Considerations

### Memory Management

```typescript
// Limit history size for large states
const stateManager = new StateManager(largeInitialState, 10);

// Clear history periodically
setInterval(() => {
  stateManager.clearHistory();
}, 60000); // Clear every minute
```

### Optimized Updates

```typescript
// Use shallow comparison for performance
class OptimizedStateManager<T> extends StateManager<T> {
  private isEqual(a: T, b: T): boolean {
    // Custom equality check for better performance
    return JSON.stringify(a) === JSON.stringify(b);
  }
}
```

## Related APIs

- [ProcessorStateManager](/api/state-manager) - Processor-specific state management
- [ConfigurationManager](/api/configuration-manager) - Configuration state management
- [BrowserFileViewer](/api/browser-file-viewer) - Main viewer class
