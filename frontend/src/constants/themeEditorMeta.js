export const THEME_EDITOR_PAGES = [
  { key: 'home',  label: 'Home Page',  path: '/'      },
  { key: 'login', label: 'Login Page', path: '/login' },
];

/** Desktop viewport the iframe renders at; scaled down to fit the preview panel. */
export const PREVIEW_WIDTH  = 1280;
export const PREVIEW_HEIGHT = 900;

export const SECTION_LABELS = {
  'home-hero':  'Hero',
  'home-guide': 'Quick Start Guide',
  'login-left': 'Left Panel',
  'login-form': 'Sign In Form',
};

export const SECTION_FIELDS = {
  'home-hero': [
    { key: 'title',         label: 'Page Title',              type: 'text'  },
    { key: 'subtitle',      label: 'Description / Subtitle',  type: 'textarea' },
    { key: 'bgFrom',        label: 'Gradient Start',          type: 'color' },
    { key: 'bgTo',          label: 'Gradient End',            type: 'color' },
    { key: 'btn1Text',      label: 'Primary Button Label',    type: 'text'  },
    { key: 'btn1BgColor',   label: 'Primary Button Color',    type: 'color' },
    { key: 'btn1TextColor', label: 'Primary Button Text',     type: 'color' },
    { key: 'btn2Text',      label: 'Secondary Button Label',  type: 'text'  },
    { key: 'btn2BgColor',   label: 'Secondary Button Color',  type: 'color' },
    { key: 'btn2TextColor', label: 'Secondary Button Text',   type: 'color' },
  ],
  'home-guide': [
    { key: 'guideTitle',  label: 'Section Title',   type: 'text'     },
    { key: 'step1',       label: 'Step 1',          type: 'textarea' },
    { key: 'step2',       label: 'Step 2',          type: 'textarea' },
    { key: 'step3',       label: 'Step 3',          type: 'textarea' },
    { key: 'bgColor',     label: 'Background Color', type: 'color'   },
    { key: 'textColor',   label: 'Text Color',       type: 'color'   },
    { key: 'cardOpacity', label: 'Card Opacity (hex)', type: 'text'  },
  ],
  'login-left': [
    { key: 'bgColor', label: 'Background Color', type: 'color'    },
    { key: 'heading', label: 'Main Heading',     type: 'textarea' },
    { key: 'subtext', label: 'Description',      type: 'textarea' },
  ],
  'login-form': [
    { key: 'heading',      label: 'Heading',           type: 'text'  },
    { key: 'subheading',   label: 'Subheading',        type: 'text'  },
    { key: 'btnText',      label: 'Button Label',      type: 'text'  },
    { key: 'btnBgColor',   label: 'Button Color',      type: 'color' },
    { key: 'btnTextColor', label: 'Button Text Color', type: 'color' },
    { key: 'linkColor',    label: 'Link Color',        type: 'color' },
  ],
};
