/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Xcel Energy (tx.my.xcelenergy.com) section breaks + section metadata.
 *
 * Runs in afterTransform only.
 *
 * DOM anchoring: the 10 content sections each live inside a `div.ui-widget`
 * wrapper directly under `#xeg-main`. Each wrapper holds exactly one LWC
 * component whose rendered `<section class="... xeg-blade">` may not be present
 * yet at page-load time, so we anchor on the stable `.ui-widget` wrappers (and
 * their component child tag) rather than the inner `<section>`.
 *
 * Under `#xeg-main` the wrappers appear in this document order (verified live
 * and in cleaned.html):
 *   c-xeg-mobile-task           (non-content; removed by cleanup transformer)
 *   c-xeg-hero-v2               → section-1  (hero dark)
 *   c-xeg-multi-action-banner   → section-2
 *   c-xeg-two-column-v2         → section-3
 *   c-xeg-featured-content-v2   → section-4
 *   c-xeg-featured-content-v2   → section-5
 *   c-xeg-two-column-v2         → section-6
 *   c-dc-video-component-v2     → section-7
 *   c-xeg-featured-content-v2   → section-8
 *   c-xeg-hero-v2               → section-9
 *   c-xeg-contact-support       → section-10 (contact; style 'brand-maroon')
 *
 * The mobile-task wrapper is skipped; the remaining wrappers map 1:1 to
 * payload.template.sections by document order. For each mapped section
 * (processed in reverse so insertions don't shift indices):
 *   - append a Section Metadata block after the wrapper when the section
 *     declares a `style` (section-10 → 'brand-maroon')
 *   - insert an <hr> before the wrapper for every non-first section.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

// Content section wrappers live directly under #xeg-main as div.ui-widget.
const WIDGET_SELECTOR = '#xeg-main div.ui-widget';
// Non-content component that shares the .ui-widget wrapper but is not a section.
const NON_CONTENT_CHILD_TAGS = ['c-xeg-mobile-task'];

/**
 * Return the ordered list of content-section wrappers under #xeg-main,
 * excluding wrappers whose only child is a known non-content component.
 */
function contentWrappers(element) {
  const wrappers = Array.from(element.querySelectorAll(WIDGET_SELECTOR));
  return wrappers.filter((w) => {
    const child = w.firstElementChild;
    if (!child) return false;
    return !NON_CONTENT_CHILD_TAGS.includes(child.tagName.toLowerCase());
  });
}

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const template = payload && payload.template;
  const sections = template && template.sections;
  if (!sections || sections.length < 2) return;

  const doc = element.ownerDocument;

  const wrappers = contentWrappers(element);
  if (wrappers.length === 0) return;

  // Map template sections to wrappers positionally, bounded by whichever is
  // shorter so a partially-rendered DOM cannot throw.
  const count = Math.min(sections.length, wrappers.length);

  // Process in reverse so inserting nodes does not shift earlier indices.
  for (let i = count - 1; i >= 0; i -= 1) {
    const section = sections[i];
    const wrapper = wrappers[i];

    // Section Metadata block for sections that declare a style.
    if (section.style) {
      const metadataBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      wrapper.after(metadataBlock);
    }

    // Section break before every non-first section.
    if (i > 0) {
      const hr = doc.createElement('hr');
      wrapper.before(hr);
    }
  }
}
