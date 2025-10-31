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
      {
        text: 'v1.0.1',
        items: [
          { text: 'Changelog', link: 'https://github.com/ricardoferreirades/portyl/blob/main/CHANGELOG.md' }
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
            { text: 'Usage', link: '/guide/usage' }
          ]
        },
        {
          text: 'Desktop Applications',
          collapsed: false,
          items: [
            { text: 'Desktop Integration', link: '/guide/desktop-integration' }
          ]
        }
      ],
      
      '/tutorial/': [
        {
          text: 'Tutorial',
          items: [
            { text: 'Your First Viewer', link: '/tutorial/your-first-viewer' }
          ]
        }
      ],
      
      '/api/': [
        {
          text: 'Overview',
          collapsed: false,
          items: [
            { text: 'Architecture Overview', link: '/api/overview' }
          ]
        },
        {
          text: 'For Application Developers',
          collapsed: false,
          items: [
            { text: 'Start here', link: '/api/for-app-developers' },
            { text: 'BrowserFileViewer', link: '/api/browser-file-viewer' },
            { text: 'DOMFileViewer', link: '/api/dom-file-viewer' },
            { text: 'ViewerConfig', link: '/api/viewer-config' },
            { text: 'RenderOptions', link: '/api/render-options' },
            { text: 'StateManager', link: '/api/state-manager' }
          ]
        },
        {
          text: 'For Extension Authors',
          collapsed: false,
          items: [
            { text: 'Start here', link: '/api/for-extenders' },
            { text: 'FileProcessor', link: '/api/file-processor' },
            { text: 'ImageProcessor', link: '/api/image-processor' },
            { text: 'Renderer', link: '/api/renderer' },
            { text: 'CanvasRenderer', link: '/api/canvas-renderer' },
            { text: 'ConfigurationManager', link: '/api/configuration-manager' }
          ]
        },
        {
          text: 'For Maintainers & Power Users',
          collapsed: false,
          items: [
            { text: 'Start here', link: '/api/for-maintainers' },
            { text: 'Types', link: '/api/types' },
            { text: 'FileUtils', link: '/api/file-utils' }
          ]
        }
      ],
      
      // No /examples/ section; examples are covered inline in guides and API
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
