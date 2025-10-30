import { defineConfig } from 'vitepress'

// Allow overriding base path for local vs production (e.g., GitHub Pages)
// Set DOCS_BASE="/portyl/" for production deploys; defaults to "/" for local preview
const basePath = process.env.DOCS_BASE || '/';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Portyl',
  description: 'A flexible, framework-agnostic library for rendering files to canvas in the browser and desktop applications.',
  
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,
  
  // Ignore dead links during build (common during documentation development)
  ignoreDeadLinks: true,
  
  // Base path - configurable via DOCS_BASE env var
  base: basePath,
  
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'Portyl | File Viewer Library' }],
    ['meta', { property: 'og:site_name', content: 'Portyl' }],
  ],
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Guide', link: '/guide/introduction', activeMatch: '/guide/' },
      { text: 'Tutorial', link: '/tutorial/your-first-viewer', activeMatch: '/tutorial/' },
      { text: 'API', link: '/api/overview', activeMatch: '/api/' },
      { text: 'Examples', link: '/examples/overview', activeMatch: '/examples/' },
      {
        text: 'v1.0.1',
        items: [
          { text: 'Changelog', link: 'https://github.com/ricardoferreirades/portyl/blob/main/CHANGELOG.md' },
          { text: 'Contributing', link: '/guide/contributing' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          collapsed: false,
          items: [
            { text: 'What is Portyl?', link: '/guide/introduction' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Why Portyl?', link: '/guide/why-portyl' }
          ]
        },
        {
          text: 'Fundamentals',
          collapsed: false,
          items: [
            { text: 'Core Concepts', link: '/guide/core-concepts' },
            { text: 'File Processing', link: '/guide/file-processing' },
            { text: 'Rendering', link: '/guide/rendering' },
            { text: 'State Management', link: '/guide/state-management' },
            { text: 'Event System', link: '/guide/events' },
            { text: 'Configuration', link: '/guide/configuration' }
          ]
        },
        {
          text: 'Framework Integration',
          collapsed: false,
          items: [
            { text: 'Vanilla JavaScript', link: '/guide/vanilla-js' },
            { text: 'React', link: '/guide/react' },
            { text: 'Vue', link: '/guide/vue' },
            { text: 'Angular', link: '/guide/angular' },
            { text: 'Svelte', link: '/guide/svelte' }
          ]
        },
        {
          text: 'Desktop Applications',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/guide/desktop-overview' },
            { text: 'Electron', link: '/guide/electron' },
            { text: 'Tauri', link: '/guide/tauri' },
            { text: 'NW.js', link: '/guide/nwjs' },
            { text: 'Neutralino', link: '/guide/neutralino' }
          ]
        },
        {
          text: 'Advanced Topics',
          collapsed: false,
          items: [
            { text: 'Custom Processors', link: '/guide/custom-processors' },
            { text: 'Custom Renderers', link: '/guide/custom-renderers' },
            { text: 'Multi-page Files', link: '/guide/multi-page' },
            { text: 'Performance Optimization', link: '/guide/performance' },
            { text: 'Error Handling', link: '/guide/error-handling' },
            { text: 'TypeScript', link: '/guide/typescript' }
          ]
        },
        {
          text: 'Best Practices',
          collapsed: false,
          items: [
            { text: 'Architecture', link: '/guide/best-practices' },
            { text: 'Testing', link: '/guide/testing' },
            { text: 'Accessibility', link: '/guide/accessibility' },
            { text: 'Security', link: '/guide/security' }
          ]
        },
        {
          text: 'Resources',
          collapsed: false,
          items: [
            { text: 'FAQ', link: '/guide/faq' },
            { text: 'Troubleshooting', link: '/guide/troubleshooting' },
            { text: 'Migration Guide', link: '/guide/migration' },
            { text: 'Contributing', link: '/guide/contributing' }
          ]
        }
      ],
      
      '/tutorial/': [
        {
          text: 'Tutorial',
          items: [
            { text: 'Your First Viewer', link: '/tutorial/your-first-viewer' },
            { text: 'Adding Pagination', link: '/tutorial/pagination' },
            { text: 'File Upload', link: '/tutorial/file-upload' },
            { text: 'Drag and Drop', link: '/tutorial/drag-drop' },
            { text: 'Custom Styling', link: '/tutorial/styling' },
            { text: 'Building a Gallery', link: '/tutorial/gallery' }
          ]
        }
      ],
      
      '/api/': [
        {
          text: 'Core API',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/api/overview' },
            { text: 'BrowserFileViewer', link: '/api/browser-file-viewer' },
            { text: 'DOMFileViewer', link: '/api/dom-file-viewer' }
          ]
        },
        {
          text: 'Processors',
          collapsed: false,
          items: [
            { text: 'FileProcessor', link: '/api/file-processor' },
            { text: 'ImageProcessor', link: '/api/image-processor' }
          ]
        },
        {
          text: 'Renderers',
          collapsed: false,
          items: [
            { text: 'Renderer', link: '/api/renderer' },
            { text: 'CanvasRenderer', link: '/api/canvas-renderer' }
          ]
        },
        {
          text: 'Configuration',
          collapsed: false,
          items: [
            { text: 'ViewerConfig', link: '/api/viewer-config' },
            { text: 'RenderOptions', link: '/api/render-options' },
            { text: 'ConfigurationManager', link: '/api/configuration-manager' }
          ]
        },
        {
          text: 'Types & Interfaces',
          collapsed: false,
          items: [
            { text: 'Types Reference', link: '/api/types' },
            { text: 'Interfaces', link: '/api/interfaces' },
            { text: 'Enums', link: '/api/enums' }
          ]
        },
        {
          text: 'Utilities',
          collapsed: false,
          items: [
            { text: 'FileUtils', link: '/api/file-utils' },
            { text: 'StateManager', link: '/api/state-manager' }
          ]
        }
      ],
      
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/overview' },
            { text: 'Basic Usage', link: '/examples/basic' },
            { text: 'File Upload', link: '/examples/file-upload' },
            { text: 'Drag and Drop', link: '/examples/drag-drop' },
            { text: 'Image Gallery', link: '/examples/gallery' },
            { text: 'Multi-page TIFF', link: '/examples/tiff' },
            { text: 'React Integration', link: '/examples/react' },
            { text: 'Vue Integration', link: '/examples/vue' },
            { text: 'Electron App', link: '/examples/electron' },
            { text: 'Custom Renderer', link: '/examples/custom-renderer' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ricardoferreirades/portyl' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/portyl' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Ricardo Ferreira'
    },

    search: {
      provider: 'local',
      options: {
        detailedView: true
      }
    },

    editLink: {
      pattern: 'https://github.com/ricardoferreirades/portyl/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    outline: {
      level: [2, 3],
      label: 'On this page'
    },

    docFooter: {
      prev: 'Previous',
      next: 'Next'
    },

    returnToTopLabel: 'Return to top',
    sidebarMenuLabel: 'Menu',
    darkModeSwitchLabel: 'Appearance',
    lightModeSwitchTitle: 'Switch to light theme',
    darkModeSwitchTitle: 'Switch to dark theme'
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true,
    config: (md) => {
      // Add custom markdown-it plugins here if needed
    }
  }
})
