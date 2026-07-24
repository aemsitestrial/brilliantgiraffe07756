/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBladeParser from './parsers/hero-blade.js';
import columnsMediaParser from './parsers/columns-media.js';
import cardsFeatureParser from './parsers/cards-feature.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/xcelenergy-cleanup.js';
import sectionsTransformer from './transformers/xcelenergy-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-blade': heroBladeParser,
  'columns-media': columnsMediaParser,
  'cards-feature': cardsFeatureParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'customer-home',
  description: "Xcel Energy customer home page - hero banners, media+text promo rows, and featured-content card grids following an 'Our Energy, Your Power' theme",
  urls: [
    'https://tx.my.xcelenergy.com/s/',
  ],
  blocks: [
    {
      name: 'hero-blade',
      instances: [
        'section.xegc-hero.xeg-blade[data-blade-theme="dark"]',
        'section.xeg-multi-action.xeg-blade[data-blade-theme="dark"]',
        'section.xegc-hero.xeg-blade[data-blade-theme="light"]',
      ],
    },
    {
      name: 'columns-media',
      instances: [
        'section.xeg-two-column.xeg-blade[data-blade-theme="white"]:nth-of-type(1)',
        'section.xeg-two-column.xeg-blade[data-blade-theme="white"]:nth-of-type(2)',
        'section.xeg-two-column.xeg-blade[c-dcvideocomponentv2_dcvideocomponentv2]',
        'section.xegc-cs.xeg-blade[data-blade-bg="contact"]',
      ],
    },
    {
      name: 'cards-feature',
      instances: [
        'section.xegc-featured-content.xeg-blade:nth-of-type(1)',
        'section.xegc-featured-content.xeg-blade:nth-of-type(2)',
        'section.xegc-featured-content.xeg-blade:nth-of-type(3)',
      ],
    },
    {
      name: 'section-contact',
      instances: [
        'section.xegc-cs.xeg-blade[data-blade-bg="contact"]',
      ],
      section: 'brand-maroon',
    },
  ],
  sections: [
    { id: 'section-1', name: 'Hero - Our Energy Your Power', selector: 'section.xegc-hero.xeg-blade[data-blade-theme="dark"]', style: null, blocks: ['hero-blade'], defaultContent: [] },
    { id: 'section-2', name: 'Welcome Get Started banner', selector: 'section.xeg-multi-action.xeg-blade[data-blade-theme="dark"]', style: null, blocks: ['hero-blade'], defaultContent: [] },
    { id: 'section-3', name: 'Convenient Energy', selector: 'section.xeg-two-column.xeg-blade[data-blade-theme="white"]:nth-of-type(1)', style: null, blocks: ['columns-media'], defaultContent: [] },
    { id: 'section-4', name: 'Affordable Energy', selector: 'section.xegc-featured-content.xeg-blade:nth-of-type(1)', style: null, blocks: ['cards-feature'], defaultContent: ['section.xegc-featured-content.xeg-blade:nth-of-type(1) h2', 'section.xegc-featured-content.xeg-blade:nth-of-type(1) > p'] },
    { id: 'section-5', name: 'Personalized Energy', selector: 'section.xegc-featured-content.xeg-blade:nth-of-type(2)', style: null, blocks: ['cards-feature'], defaultContent: ['section.xegc-featured-content.xeg-blade:nth-of-type(2) h2', 'section.xegc-featured-content.xeg-blade:nth-of-type(2) > p'] },
    { id: 'section-6', name: 'Safer Energy', selector: 'section.xeg-two-column.xeg-blade[data-blade-theme="white"]:nth-of-type(2)', style: null, blocks: ['columns-media'], defaultContent: [] },
    { id: 'section-7', name: 'Local Energy video', selector: 'section.xeg-two-column.xeg-blade[c-dcvideocomponentv2_dcvideocomponentv2]', style: null, blocks: ['columns-media'], defaultContent: [] },
    { id: 'section-8', name: 'Cleaner Energy', selector: 'section.xegc-featured-content.xeg-blade:nth-of-type(3)', style: null, blocks: ['cards-feature'], defaultContent: ['section.xegc-featured-content.xeg-blade:nth-of-type(3) h2', 'section.xegc-featured-content.xeg-blade:nth-of-type(3) > p'] },
    { id: 'section-9', name: 'Sustainable Energy hero', selector: 'section.xegc-hero.xeg-blade[data-blade-theme="light"]', style: null, blocks: ['hero-blade'], defaultContent: [] },
    { id: 'section-10', name: 'Contact Customer Service', selector: 'section.xegc-cs.xeg-blade[data-blade-bg="contact"]', style: 'brand-maroon', blocks: ['columns-media'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY - cleanup runs first, sections after (section breaks + metadata)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    // Skip section-metadata pseudo-blocks; handled by the sections transformer
    if (blockDef.name.startsWith('section-')) return;

    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Discover blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block, skipping any already replaced/detached
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 4.5 Final safety sweep: the Medallia feedback survey widget is injected
    // client-side and can land in the DOM after the transformer hooks run. Its
    // href often isn't resolved to the medallia.com URL until serialization, so
    // match on the stable visible text ("Feedback Survey") as well as the href.
    main.querySelectorAll('a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const text = (a.textContent || '').trim().toLowerCase();
      if (
        href.includes('medallia.com')
        || href.includes('digital-cloud-west')
        || text === 'feedback survey'
      ) {
        const wrapper = a.closest('p, li, div');
        (wrapper || a).remove();
      }
    });

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
