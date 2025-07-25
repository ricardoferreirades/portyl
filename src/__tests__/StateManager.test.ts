import { StateManager } from '../core/state/StateManager';
import { ProcessorStateManager } from '../core/state/ProcessorStateManager';

interface TestState {
  count: number;
  name: string;
}

describe('StateManager', () => {
  let stateManager: StateManager<TestState>;
  const initialState: TestState = { count: 0, name: 'test' };

  beforeEach(() => {
    stateManager = new StateManager(initialState);
  });

  afterEach(() => {
    stateManager.destroy();
  });

  it('should initialize with initial state', () => {
    expect(stateManager.getState()).toEqual(initialState);
  });

  it('should update state immutably', () => {
    const state1 = stateManager.getState();
    stateManager.setState(prev => ({ ...prev, count: prev.count + 1 }));
    const state2 = stateManager.getState();
    
    expect(state1).not.toBe(state2);
    expect(state1.count).toBe(0);
    expect(state2.count).toBe(1);
  });

  it('should notify subscribers', async () => {
    const listener = jest.fn();
    stateManager.subscribe(listener);

    stateManager.setState(prev => ({ ...prev, count: 5 }));
    
    // Wait for async notification
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(listener).toHaveBeenCalled();
  });
});

describe('ProcessorStateManager', () => {
  let stateManager: ProcessorStateManager;

  beforeEach(() => {
    stateManager = new ProcessorStateManager();
    // Ensure clean state for each test
    stateManager.resetState();
  });

  afterEach(() => {
    stateManager.destroy();
  });

  it('should handle file loading flow', () => {
    const fileInfo = { name: 'test.jpg', size: 1024, type: 'image/jpeg' };
    
    stateManager.startLoading(fileInfo);
    expect(stateManager.getState().isLoading).toBe(true);
    expect(stateManager.getState().fileInfo).toEqual(fileInfo);

    stateManager.finishLoading(3);
    expect(stateManager.getState().isLoading).toBe(false);
    expect(stateManager.getState().totalPages).toBe(3);
  });

  it('should navigate between pages', () => {
    stateManager.finishLoading(5);
    
    stateManager.navigateToPage(2);
    expect(stateManager.getState().currentPage).toBe(2);
  });

  it('should provide pagination info', () => {
    stateManager.finishLoading(3);
    
    // Check initial state (0-based internally)
    expect(stateManager.getState().currentPage).toBe(0);
    
    stateManager.navigateToPage(1);
    
    // Check page was set correctly (0-based internally)
    expect(stateManager.getState().currentPage).toBe(1);
    
    const info = stateManager.getPaginationInfo();
    
    // getPaginationInfo returns 1-based indexing for UI
    expect(info?.currentPage).toBe(2); // 1-based: internal page 1 = UI page 2
    expect(info?.totalPages).toBe(3);
    expect(info?.canGoNext).toBe(true);
    expect(info?.canGoPrevious).toBe(true);
  });
});
