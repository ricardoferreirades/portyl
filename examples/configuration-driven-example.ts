/**
 * Configuration-Driven Design Example
 * Demonstrates the comprehensive configuration system and file stats API
 */

import {
  BrowserFileViewer,
  ConfigPresets,
  FileStatsCalculator,
  FileStats,
  initializeConfigManager,
} from '../src/index';

// Initialize the configuration system with a preset
const preset = ConfigPresets.getPreset('DESKTOP_HQ');
const configManager = initializeConfigManager(preset || undefined);

// Example: Using the configuration system
function setupViewer(): BrowserFileViewer {
  // Create viewer with configuration-driven setup
  const viewer = new BrowserFileViewer();

  // Listen for configuration changes
  configManager.addListener(
    'viewer-sync',
    (path, newValue, oldValue, config) => {
      console.log(
        `Configuration changed: ${path} = ${newValue} (was ${oldValue})`
      );

      // React to specific configuration changes
      if (path.startsWith('rendering.')) {
        console.log('Rendering configuration updated:', config.rendering);
        // Update renderer settings would go here
      } else if (path.startsWith('performance.')) {
        console.log('Performance configuration updated:', config.performance);
        // Update performance settings would go here
      }
    }
  );

  // Example: Dynamic configuration updates
  const updateConfigurations = (): void => {
    // Update memory limit based on device capabilities
    const deviceMemory = (navigator as any).deviceMemory || 4; // GB
    const memoryLimit = Math.min(
      deviceMemory * 256 * 1024 * 1024,
      2 * 1024 * 1024 * 1024
    ); // Max 2GB

    configManager.updateConfigValue('performance.memoryLimit', memoryLimit);

    // Update rendering quality based on pixel ratio
    const pixelRatio = window.devicePixelRatio || 1;
    if (pixelRatio > 2) {
      configManager.updateConfigValue('rendering.quality', 0.8); // Reduce quality for high DPI
    }

    // Update preloading based on connection speed
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (
        connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g'
      ) {
        configManager.updateConfigValue('performance.preloadPages', 0);
        configManager.updateConfigValue('performance.cacheStrategy', 'minimal');
      }
    }
  };

  // Apply device-specific optimizations
  updateConfigurations();

  return viewer;
}

// Example: File stats integration (replacing canvas file info)
function createFileStatsDisplay(
  container: HTMLElement
): (stats: FileStats) => void {
  // Create file info panel (separate from canvas)
  const fileInfoPanel = document.createElement('div');
  fileInfoPanel.className = 'file-info-panel';
  fileInfoPanel.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    max-width: 300px;
    backdrop-filter: blur(5px);
    z-index: 1000;
  `;

  container.appendChild(fileInfoPanel);

  return (stats: FileStats) => {
    const lines: string[] = [];

    // Basic file information
    lines.push(`📄 ${stats.name}`);
    lines.push(`💾 ${FileStatsCalculator.formatSize(stats.size)}`);

    // Image dimensions
    if (stats.dimensions) {
      lines.push(
        `📐 ${FileStatsCalculator.formatDimensions(stats.dimensions)}`
      );
      lines.push(
        `📏 ${FileStatsCalculator.formatAspectRatio(stats.dimensions.aspectRatio)}`
      );
    }

    // Performance information
    if (stats.processing) {
      lines.push('');
      lines.push('⚡ Performance:');
      lines.push(`  Load: ${stats.processing.loadTime.toFixed(0)}ms`);
      lines.push(`  Render: ${stats.processing.renderTime.toFixed(0)}ms`);
      lines.push(
        `  Memory: ${FileStatsCalculator.formatSize(stats.processing.memoryUsage)}`
      );

      if (stats.processing.compressionRatio) {
        lines.push(`  Ratio: ${stats.processing.compressionRatio.toFixed(2)}x`);
      }
    }

    // Display information
    if (stats.display) {
      lines.push('');
      lines.push('🖼️ Display:');
      lines.push(`  Scale: ${(stats.display.scaleFactor * 100).toFixed(1)}%`);
      lines.push(`  Mode: ${stats.display.fitMode}`);
      lines.push(
        `  View: ${FileStatsCalculator.formatDimensions(stats.display.displayDimensions)}`
      );
    }

    // Technical metadata
    if (stats.metadata) {
      lines.push('');
      lines.push('🔧 Technical:');

      if (stats.metadata.colorDepth) {
        lines.push(`  Color: ${stats.metadata.colorDepth}-bit`);
      }

      if (stats.metadata.format) {
        lines.push(
          `  Format: ${stats.metadata.format.compression || 'Unknown'}`
        );
        if (stats.metadata.format.progressive) {
          lines.push(`  Progressive: Yes`);
        }
        if (stats.metadata.format.interlaced) {
          lines.push(`  Interlaced: Yes`);
        }
      }
    }

    // Error information
    if (stats.errors && stats.errors.length > 0) {
      lines.push('');
      lines.push('⚠️ Issues:');
      stats.errors.forEach((error) => {
        const icon = error.severity === 'error' ? '❌' : '⚠️';
        lines.push(`  ${icon} ${error.message}`);
      });
    }

    // Summary line
    lines.unshift(`📊 ${FileStatsCalculator.getSummary(stats)}`);
    lines.unshift('');

    fileInfoPanel.innerHTML = lines.join('<br>');
  };
}

// Example: Complete integration
function initializeFileViewer(container: HTMLElement): {
  viewer: BrowserFileViewer;
  loadFile: (file: File) => Promise<void>;
  configManager: typeof configManager;
} {
  const viewer = setupViewer();
  const updateFileStats = createFileStatsDisplay(container);

  // Enhanced file loading with stats tracking
  const loadFileWithStats = async (file: File): Promise<void> => {
    const startTime = performance.now();

    // Calculate basic stats
    let stats = FileStatsCalculator.calculateBasic(file);
    updateFileStats(stats as FileStats);

    try {
      // Load the file
      const result = await viewer.loadFile(file);
      const loadTime = performance.now() - startTime;

      if (result.success && result.fileInfo) {
        // For images, calculate additional stats
        const imageElement = new Image();
        imageElement.onload = async (): Promise<void> => {
          // Calculate image-specific stats
          stats = await FileStatsCalculator.calculateImageStats(
            file,
            imageElement
          );

          // Add processing stats
          const memoryUsage =
            imageElement.naturalWidth * imageElement.naturalHeight * 4; // RGBA
          stats = FileStatsCalculator.addProcessingStats(
            stats,
            loadTime,
            0, // Will be updated after render
            memoryUsage
          );

          updateFileStats(stats as FileStats);
        };
        imageElement.src = URL.createObjectURL(file);
      } else {
        // Add error information
        stats = FileStatsCalculator.addError(
          stats,
          'LOAD_ERROR',
          result.error || 'Failed to load file'
        );
        updateFileStats(stats as FileStats);
      }
    } catch (error) {
      stats = FileStatsCalculator.addError(
        stats,
        'LOAD_EXCEPTION',
        error instanceof Error ? error.message : 'Unknown error'
      );
      updateFileStats(stats as FileStats);
    }
  };

  // Configuration panel
  const createConfigPanel = (): void => {
    const panel = document.createElement('div');
    panel.className = 'config-panel';
    panel.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(255, 255, 255, 0.95);
      padding: 15px;
      border-radius: 8px;
      font-family: sans-serif;
      font-size: 14px;
      backdrop-filter: blur(5px);
      z-index: 1000;
      min-width: 250px;
    `;

    panel.innerHTML = `
      <h3 style="margin: 0 0 10px 0;">Configuration</h3>
      <div style="margin-bottom: 10px;">
        <label>Preset:</label>
        <select id="preset-select" style="width: 100%; margin-top: 5px;">
          <option value="DEFAULT">Default</option>
          <option value="MOBILE">Mobile Optimized</option>
          <option value="DESKTOP_HQ" selected>Desktop HQ</option>
          <option value="PERFORMANCE">Performance</option>
          <option value="ACCESSIBILITY">Accessibility</option>
          <option value="GALLERY">Gallery Mode</option>
        </select>
      </div>
      <div style="margin-bottom: 10px;">
        <label>Rendering Quality:</label>
        <input type="range" id="quality-slider" min="0.1" max="1" step="0.1" value="0.9" style="width: 100%;">
        <span id="quality-value">0.9</span>
      </div>
      <div style="margin-bottom: 10px;">
        <label>Memory Limit (MB):</label>
        <input type="number" id="memory-input" value="512" min="64" max="2048" style="width: 100%;">
      </div>
      <div>
        <label>Cache Strategy:</label>
        <select id="cache-select" style="width: 100%; margin-top: 5px;">
          <option value="minimal">Minimal</option>
          <option value="moderate" selected>Moderate</option>
          <option value="aggressive">Aggressive</option>
        </select>
      </div>
    `;

    // Wire up controls
    const presetSelect = panel.querySelector(
      '#preset-select'
    ) as HTMLSelectElement;
    const qualitySlider = panel.querySelector(
      '#quality-slider'
    ) as HTMLInputElement;
    const qualityValue = panel.querySelector(
      '#quality-value'
    ) as HTMLSpanElement;
    const memoryInput = panel.querySelector(
      '#memory-input'
    ) as HTMLInputElement;
    const cacheSelect = panel.querySelector(
      '#cache-select'
    ) as HTMLSelectElement;

    presetSelect.addEventListener('change', () => {
      const preset = ConfigPresets.getPreset(presetSelect.value);
      if (preset) {
        configManager.updateConfig(preset);
      }
    });

    qualitySlider.addEventListener('input', () => {
      const quality = parseFloat(qualitySlider.value);
      qualityValue.textContent = quality.toFixed(1);
      configManager.updateConfigValue('rendering.quality', quality);
    });

    memoryInput.addEventListener('change', () => {
      const memoryMB = parseInt(memoryInput.value);
      configManager.updateConfigValue(
        'performance.memoryLimit',
        memoryMB * 1024 * 1024
      );
    });

    cacheSelect.addEventListener('change', () => {
      configManager.updateConfigValue(
        'performance.cacheStrategy',
        cacheSelect.value
      );
    });

    container.appendChild(panel);
  };

  // Create configuration panel
  createConfigPanel();

  // Setup drag and drop
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    container.style.backgroundColor = 'rgba(0, 100, 255, 0.1)';
  });

  container.addEventListener('dragleave', () => {
    container.style.backgroundColor = '';
  });

  container.addEventListener('drop', (e) => {
    e.preventDefault();
    container.style.backgroundColor = '';

    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length > 0) {
      loadFileWithStats(files[0]);
    }
  });

  // File input for testing
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.cssText = `
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
  `;

  fileInput.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      loadFileWithStats(target.files[0]);
    }
  });

  container.appendChild(fileInput);

  return { viewer, loadFile: loadFileWithStats, configManager };
}

// Export for use in demos
export { initializeFileViewer, createFileStatsDisplay, setupViewer };
