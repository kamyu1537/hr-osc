import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'hr-osc',
  tagline: 'VRChat용 심박수 OSC 전송 앱',
  favicon: 'img/icon.png',

  url: 'https://kamyu1537.github.io',
  baseUrl: '/hr-osc/',
  organizationName: 'kamyu1537',
  projectName: 'hr-osc',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en'],
    localeConfigs: {
      ko: { label: '한국어', htmlLang: 'ko-KR' },
      en: { label: 'English', htmlLang: 'en-US' },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/kamyu1537/hr-osc/tree/dev/website/',
        },
        blog: false,
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'hr-osc',
      logo: { alt: 'hr-osc', src: 'img/icon.png' },
      items: [{ href: 'https://github.com/kamyu1537/hr-osc', label: 'GitHub', position: 'right' }],
    },
    footer: {
      links: [
        {
          title: '링크',
          items: [
            { label: 'GitHub', href: 'https://github.com/kamyu1537/hr-osc' },
            { label: '릴리스', href: 'https://github.com/kamyu1537/hr-osc/releases' },
          ],
        },
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
