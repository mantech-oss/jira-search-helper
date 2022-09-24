import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest(async (env) => ({
  name: '__MSG_APP_NAME__',
  description: '__MSG_APP_DESCRIPTION__',
  version: '1.0.0',
  default_locale: 'en',
  manifest_version: 3,
  icons: {
    128: 'img/logo-128.png',
  },
  action: {
    default_popup: 'popup.html',
    default_icon: 'img/logo-128.png',
  },
  options_page: 'options.html',
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    ...(env.mode === 'development'
      ? []
      : [
          {
            run_at: 'document_start',
            matches: ['https://*.jira.com/*', 'https://*.atlassian.net/*'],
            js: ['public/js/webcomponent.js'],
          },
        ]),
    {
      run_at: 'document_end',
      matches: ['https://*.jira.com/*', 'https://*.atlassian.net/*'],
      js: ['src/content/index.ts'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['img/logo-128.png'],
      matches: [],
    },
  ],
  permissions: ['storage', 'activeTab', 'scripting'],
  host_permissions: [],
  commands: {
    'search-jira-issues': {
      suggested_key: {
        default: 'Ctrl+Shift+J',
        windows: 'Ctrl+Shift+J',
        mac: 'Alt+Shift+J',
      },
      description: 'Search Jira Issues',
    },
  },
}))
