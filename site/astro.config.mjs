// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightOpenAPI, { openAPISidebarGroups } from 'starlight-openapi';
import { developerSidebar, userSidebar } from './sidebar.mjs';

// Registers the sidebar middleware after starlight-openapi has added its groups.
const sidebarSwitch = {
  name: 'trustdeck-sidebar-switch',
  hooks: {
    'config:setup': ({ addRouteMiddleware }) => addRouteMiddleware({ entrypoint: './src/routeData.ts', order: 'post' }),
  },
};

export default defineConfig({
  site: 'https://trustdeck.github.io',
  base: '/trustdeck-setup',
  integrations: [
    starlight({
      title: 'TrustDeck',
      description: 'Pseudonymization and identity management for medical research.',
      logo: { src: './src/assets/trustdeck-logo.png', alt: 'TrustDeck', replacesTitle: false },
      favicon: '/favicon.png',
      social: [{ icon: 'github', label: 'TrustDeck on GitHub', href: 'https://github.com/TrustDeck' }],
      editLink: { baseUrl: 'https://github.com/TrustDeck/trustdeck-setup/edit/main/site/' },
      pagination: false,
      // Long code lines wrap instead of scrolling sideways; wrapped lines keep their indentation.
      expressiveCode: { defaultProps: { wrap: true, preserveIndent: true } },
      components: {
        Header: './src/components/Header.astro',
        Sidebar: './src/components/Sidebar.astro',
        ThemeSelect: './src/components/ThemeToggle.astro',
      },
      plugins: [
        starlightOpenAPI([
          {
            base: 'rest-api/reference',
            schema: './api/openapi.documented.json',
            sidebar: { label: 'API reference', operations: { badges: true, sort: 'alphabetical' } },
            snippets: {
              operation: {
                clients: { shell: ['curl'], java: ['nethttp'], javascript: ['fetch'] },
                default: { target: 'shell', client: 'curl' },
              },
            },
          },
        ]),
        sidebarSwitch,
      ],
      sidebar: [...developerSidebar(openAPISidebarGroups), ...userSidebar],
      customCss: ['./src/styles/theme.css', './src/styles/components.css'],
    }),
  ],
});
