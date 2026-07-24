/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-blade. Base block: hero.
 * Source: https://tx.my.xcelenergy.com/s/
 * Generated: 2026-07-24
 *
 * xwalk simple block model (blocks/hero-blade/_hero-blade.json):
 *   - image   (reference) -> row 1, field:image  (imageAlt collapses to alt attr)
 *   - text    (richtext)  -> row 2, field:text   (heading + subtext + CTA links)
 *
 * Handles three source instances:
 *   S1 (dark hero):     bg image + <h1> + <p>            (no CTA)
 *   S2 (multi-action):  bg image + <h2> + row of 4 <a>   (no subtext <p>)
 *   S9 (light hero):    bg image + <h2> + <p> + one <a>
 * Background image is carried on the section's inline `background-image` style
 * (there is no <img>), so we synthesise an <img> for the image field.
 */
export default function parse(element, { document }) {
  // --- Extract background image from inline style (no <img> in source) ---
  let bgImg = element.querySelector('img');
  if (!bgImg) {
    const styleAttr = element.getAttribute('style') || '';
    const match = styleAttr.match(/background-image:\s*url\((['"]?)(.*?)\1\)/i);
    if (match && match[2]) {
      bgImg = document.createElement('img');
      bgImg.setAttribute('src', match[2].trim());
    }
  }

  // --- Extract heading (h1 or h2), subtext paragraph, and CTA links ---
  const heading = element.querySelector('h1, h2, h3, [class*="title"]');
  const subtext = element.querySelector('.xeg-content-container > p, p.xeg-h4, p');
  // Prefer the branded button class; fall back to any anchor only when none found.
  let ctaLinks = Array.from(element.querySelectorAll('a.xeg-button'));
  if (ctaLinks.length === 0) {
    ctaLinks = Array.from(element.querySelectorAll('a[href]'));
  }

  // Empty-block guard
  if (!heading && !subtext && ctaLinks.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 1: image field
  const imageCell = document.createDocumentFragment();
  imageCell.appendChild(document.createComment(' field:image '));
  if (bgImg) imageCell.appendChild(bgImg);
  cells.push([imageCell]);

  // Row 2: text field (heading + subtext + CTA links)
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));
  if (heading) textCell.appendChild(heading);
  if (subtext) textCell.appendChild(subtext);
  ctaLinks.forEach((a) => {
    const p = document.createElement('p');
    p.appendChild(a);
    textCell.appendChild(p);
  });
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-blade', cells });
  element.replaceWith(block);
}
