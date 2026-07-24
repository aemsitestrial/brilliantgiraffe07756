/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-customer-home.js
  var import_customer_home_exports = {};
  __export(import_customer_home_exports, {
    default: () => import_customer_home_default
  });

  // tools/importer/parsers/hero-blade.js
  function parse(element, { document }) {
    let bgImg = element.querySelector("img");
    if (!bgImg) {
      const styleAttr = element.getAttribute("style") || "";
      const match = styleAttr.match(/background-image:\s*url\((['"]?)(.*?)\1\)/i);
      if (match && match[2]) {
        bgImg = document.createElement("img");
        bgImg.setAttribute("src", match[2].trim());
      }
    }
    const heading = element.querySelector('h1, h2, h3, [class*="title"]');
    const subtext = element.querySelector(".xeg-content-container > p, p.xeg-h4, p");
    let ctaLinks = Array.from(element.querySelectorAll("a.xeg-button"));
    if (ctaLinks.length === 0) {
      ctaLinks = Array.from(element.querySelectorAll("a[href]"));
    }
    if (!heading && !subtext && ctaLinks.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(" field:image "));
    if (bgImg) imageCell.appendChild(bgImg);
    cells.push([imageCell]);
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(" field:text "));
    if (heading) textCell.appendChild(heading);
    if (subtext) textCell.appendChild(subtext);
    ctaLinks.forEach((a) => {
      const p = document.createElement("p");
      p.appendChild(a);
      textCell.appendChild(p);
    });
    cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-blade", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  function parse2(element, { document }) {
    const container = element.querySelector(".xeg-columns") || element;
    let columns = Array.from(
      container.querySelectorAll(":scope > .content, :scope > .image, :scope > .video-wrapper, :scope > [data-column]")
    );
    const seen = /* @__PURE__ */ new Set();
    columns = columns.filter((col) => {
      if (seen.has(col)) return false;
      seen.add(col);
      return col.textContent.trim().length > 0 || col.querySelector("img, iframe, a");
    });
    if (columns.length === 0) {
      columns = Array.from(container.children).filter(
        (c) => c.textContent.trim().length > 0 || c.querySelector("img, iframe, a")
      );
    }
    if (columns.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const rowCells = columns.map((col) => {
      const cellContent = [];
      Array.from(col.children).forEach((child) => {
        const iframe = child.matches("iframe") ? child : child.querySelector("iframe");
        if (iframe && iframe.src) {
          const link = document.createElement("a");
          const embedMatch = iframe.src.match(/youtube\.com\/embed\/([\w-]+)/i);
          link.href = embedMatch ? `https://www.youtube.com/watch?v=${embedMatch[1]}` : iframe.src;
          link.textContent = iframe.getAttribute("title") || link.href;
          const p = document.createElement("p");
          p.appendChild(link);
          cellContent.push(p);
        } else {
          cellContent.push(child);
        }
      });
      return cellContent;
    });
    const cells = [rowCells];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function parse3(element, { document }) {
    const items = Array.from(
      element.querySelectorAll("c-xeg-featured-content-item, [data-image-display-style], .xeg-columns > [data-column]")
    );
    const seen = /* @__PURE__ */ new Set();
    const cards = items.filter((el) => {
      if (seen.has(el)) return false;
      seen.add(el);
      return true;
    });
    if (cards.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const img = card.querySelector("img");
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      if (img) imageCell.appendChild(img);
      const heading = card.querySelector('h2, h3, h4, [class*="title"]');
      const richText = card.querySelector("lightning-formatted-rich-text");
      const descParas = richText ? Array.from(richText.querySelectorAll("p")) : Array.from(card.querySelectorAll(":scope > p"));
      const cta = card.querySelector("a.xeg-button, a[href]");
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      if (heading) textCell.appendChild(heading);
      descParas.forEach((p) => textCell.appendChild(p));
      if (cta) {
        const p = document.createElement("p");
        p.appendChild(cta);
        textCell.appendChild(p);
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/xcelenergy-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#auraLoadingBox",
        ".auraLoadingBox",
        ".auraMsgBox",
        "#auraErrorMask",
        "#auraError",
        ".auraForcedErrorBox",
        ".auraErrorBox",
        "experience_messaging-embedded-messaging",
        "#embeddedMessagingSiteContextFrame",
        "#embedded-messaging",
        ".embeddedMessagingConversationButtonWrapper",
        "#embeddedMessagingLiveRegion",
        // Medallia / feedback survey widgets injected client-side.
        ".medallia-feedback",
        '[id^="mdlogic"]',
        '[class*="kampyle"]',
        '[id*="feedback-btn"]',
        'a[href*="resources.digital-cloud-west.medallia.com"]'
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "c-xeg-site-header-desktop",
        "c-xeg-site-header-alert",
        "#xegs2c",
        "footer",
        "c-xeg-site-footer",
        "siteforce-record-api-refresh-handler",
        "c-ma-billing-reroute",
        "c-xe-maintenance-redirect",
        "c-xeg-mobile-task"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".xeg-theme-region",
        ".xeg-footer",
        ".forceToastManager",
        ".forceVisualMessageQueue",
        ".forceHoverPrototype",
        ".siteforceSpinnerManager",
        ".siteforcePanelsContainer",
        "#sf-aria-live"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".grecaptcha-badge",
        "#agency_ast_iFrame",
        "#universal_pixel_l4yjqem",
        "link",
        "noscript",
        "source"
      ]);
      element.querySelectorAll("[data-di-id], [data-di-res-id], [data-di-rand]").forEach((el) => {
        el.removeAttribute("data-di-id");
        el.removeAttribute("data-di-res-id");
        el.removeAttribute("data-di-rand");
      });
      const walker = element.ownerDocument.createTreeWalker(
        element,
        4
        /* SHOW_TEXT */
      );
      const strayText = [];
      let node = walker.nextNode();
      while (node) {
        if (/^[`\s]*``[`\s]*$/.test(node.nodeValue)) strayText.push(node);
        node = walker.nextNode();
      }
      strayText.forEach((n) => n.remove());
      element.querySelectorAll('a[href*="medallia.com"], a[href*="digital-cloud-west"]').forEach((a) => {
        const wrapper = a.closest("p, li, div");
        (wrapper || a).remove();
      });
    }
  }

  // tools/importer/transformers/xcelenergy-sections.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  var WIDGET_SELECTOR = "#xeg-main div.ui-widget";
  var NON_CONTENT_CHILD_TAGS = ["c-xeg-mobile-task"];
  function contentWrappers(element) {
    const wrappers = Array.from(element.querySelectorAll(WIDGET_SELECTOR));
    return wrappers.filter((w) => {
      const child = w.firstElementChild;
      if (!child) return false;
      return !NON_CONTENT_CHILD_TAGS.includes(child.tagName.toLowerCase());
    });
  }
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const template = payload && payload.template;
    const sections = template && template.sections;
    if (!sections || sections.length < 2) return;
    const doc = element.ownerDocument;
    const wrappers = contentWrappers(element);
    if (wrappers.length === 0) return;
    const count = Math.min(sections.length, wrappers.length);
    for (let i = count - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const wrapper = wrappers[i];
      if (section.style) {
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        wrapper.after(metadataBlock);
      }
      if (i > 0) {
        const hr = doc.createElement("hr");
        wrapper.before(hr);
      }
    }
  }

  // tools/importer/import-customer-home.js
  var parsers = {
    "hero-blade": parse,
    "columns-media": parse2,
    "cards-feature": parse3
  };
  var PAGE_TEMPLATE = {
    name: "customer-home",
    description: "Xcel Energy customer home page - hero banners, media+text promo rows, and featured-content card grids following an 'Our Energy, Your Power' theme",
    urls: [
      "https://tx.my.xcelenergy.com/s/"
    ],
    blocks: [
      {
        name: "hero-blade",
        instances: [
          'section.xegc-hero.xeg-blade[data-blade-theme="dark"]',
          'section.xeg-multi-action.xeg-blade[data-blade-theme="dark"]',
          'section.xegc-hero.xeg-blade[data-blade-theme="light"]'
        ]
      },
      {
        name: "columns-media",
        instances: [
          'section.xeg-two-column.xeg-blade[data-blade-theme="white"]:nth-of-type(1)',
          'section.xeg-two-column.xeg-blade[data-blade-theme="white"]:nth-of-type(2)',
          "section.xeg-two-column.xeg-blade[c-dcvideocomponentv2_dcvideocomponentv2]",
          'section.xegc-cs.xeg-blade[data-blade-bg="contact"]'
        ]
      },
      {
        name: "cards-feature",
        instances: [
          "section.xegc-featured-content.xeg-blade:nth-of-type(1)",
          "section.xegc-featured-content.xeg-blade:nth-of-type(2)",
          "section.xegc-featured-content.xeg-blade:nth-of-type(3)"
        ]
      },
      {
        name: "section-contact",
        instances: [
          'section.xegc-cs.xeg-blade[data-blade-bg="contact"]'
        ],
        section: "brand-maroon"
      }
    ],
    sections: [
      { id: "section-1", name: "Hero - Our Energy Your Power", selector: 'section.xegc-hero.xeg-blade[data-blade-theme="dark"]', style: null, blocks: ["hero-blade"], defaultContent: [] },
      { id: "section-2", name: "Welcome Get Started banner", selector: 'section.xeg-multi-action.xeg-blade[data-blade-theme="dark"]', style: null, blocks: ["hero-blade"], defaultContent: [] },
      { id: "section-3", name: "Convenient Energy", selector: 'section.xeg-two-column.xeg-blade[data-blade-theme="white"]:nth-of-type(1)', style: null, blocks: ["columns-media"], defaultContent: [] },
      { id: "section-4", name: "Affordable Energy", selector: "section.xegc-featured-content.xeg-blade:nth-of-type(1)", style: null, blocks: ["cards-feature"], defaultContent: ["section.xegc-featured-content.xeg-blade:nth-of-type(1) h2", "section.xegc-featured-content.xeg-blade:nth-of-type(1) > p"] },
      { id: "section-5", name: "Personalized Energy", selector: "section.xegc-featured-content.xeg-blade:nth-of-type(2)", style: null, blocks: ["cards-feature"], defaultContent: ["section.xegc-featured-content.xeg-blade:nth-of-type(2) h2", "section.xegc-featured-content.xeg-blade:nth-of-type(2) > p"] },
      { id: "section-6", name: "Safer Energy", selector: 'section.xeg-two-column.xeg-blade[data-blade-theme="white"]:nth-of-type(2)', style: null, blocks: ["columns-media"], defaultContent: [] },
      { id: "section-7", name: "Local Energy video", selector: "section.xeg-two-column.xeg-blade[c-dcvideocomponentv2_dcvideocomponentv2]", style: null, blocks: ["columns-media"], defaultContent: [] },
      { id: "section-8", name: "Cleaner Energy", selector: "section.xegc-featured-content.xeg-blade:nth-of-type(3)", style: null, blocks: ["cards-feature"], defaultContent: ["section.xegc-featured-content.xeg-blade:nth-of-type(3) h2", "section.xegc-featured-content.xeg-blade:nth-of-type(3) > p"] },
      { id: "section-9", name: "Sustainable Energy hero", selector: 'section.xegc-hero.xeg-blade[data-blade-theme="light"]', style: null, blocks: ["hero-blade"], defaultContent: [] },
      { id: "section-10", name: "Contact Customer Service", selector: 'section.xegc-cs.xeg-blade[data-blade-bg="contact"]', style: "brand-maroon", blocks: ["columns-media"], defaultContent: [] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      if (blockDef.name.startsWith("section-")) return;
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_customer_home_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      main.querySelectorAll("a").forEach((a) => {
        const href = a.getAttribute("href") || "";
        const text = (a.textContent || "").trim().toLowerCase();
        if (href.includes("medallia.com") || href.includes("digital-cloud-west") || text === "feedback survey") {
          const wrapper = a.closest("p, li, div");
          (wrapper || a).remove();
        }
      });
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_customer_home_exports);
})();
