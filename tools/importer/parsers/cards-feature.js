/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature. Base block: cards.
 * Source: https://tx.my.xcelenergy.com/s/
 * Generated: 2026-07-24
 *
 * xwalk container block (blocks/cards-feature/_cards-feature.json):
 *   - child model `card` with fields: image (reference) + text (richtext).
 *   - Each card = one row with 2 cells:
 *       cell 1: <!-- field:image --> <img>     (imageAlt collapses to alt attr)
 *       cell 2: <!-- field:text -->  heading + description + CTA link
 *   - The section heading (<h2>) and intro (<p>) are default content
 *     (see page-templates.json defaultContent) and are NOT part of the block.
 *
 * Handles three source instances (2- and 3-column card grids) with identical
 * per-card markup: <c-xeg-featured-content-item> containing
 * <img> + <h3> + <lightning-formatted-rich-text>(description) + <a> CTA.
 */
export default function parse(element, { document }) {
  const items = Array.from(
    element.querySelectorAll('c-xeg-featured-content-item, [data-image-display-style], .xeg-columns > [data-column]')
  );

  // De-duplicate any overlap between the selectors above.
  const seen = new Set();
  const cards = items.filter((el) => {
    if (seen.has(el)) return false;
    seen.add(el);
    return true;
  });

  // Empty-block guard.
  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cards.forEach((card) => {
    // --- Image cell (field:image) ---
    const img = card.querySelector('img');
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    if (img) imageCell.appendChild(img);

    // --- Text cell (field:text): heading + description + CTA ---
    const heading = card.querySelector('h2, h3, h4, [class*="title"]');
    // Description: unwrap lightning rich-text so only the inner richtext is kept.
    const richText = card.querySelector('lightning-formatted-rich-text');
    const descParas = richText
      ? Array.from(richText.querySelectorAll('p'))
      : Array.from(card.querySelectorAll(':scope > p'));
    const cta = card.querySelector('a.xeg-button, a[href]');

    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    if (heading) textCell.appendChild(heading);
    descParas.forEach((p) => textCell.appendChild(p));
    if (cta) {
      const p = document.createElement('p');
      p.appendChild(cta);
      textCell.appendChild(p);
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
