/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media. Base block: columns.
 * Source: https://tx.my.xcelenergy.com/s/
 * Generated: 2026-07-24
 *
 * xwalk Columns block (blocks/columns-media/_columns-media.json):
 *   - Per hinting Rule 4, Columns blocks DO NOT use field:xyz hints.
 *   - Structure: 1 content row with 2 cells (one per column). Default content only.
 *
 * Handles four source instances (all `.xeg-columns` with data-column-count="2"):
 *   S3 / S6 (two-column media): .content (h2 + p + CTA) column + .image (img) column
 *   S7 (video):                 .content column + .video-wrapper (YouTube iframe -> link)
 *   S10 (contact strip):        div[data-column="1"] (h2 + p) + div[data-column="2"] (CTA)
 *
 * YouTube iframes are carried as a plain <a> link so the embed URL survives import.
 */
export default function parse(element, { document }) {
  const container = element.querySelector('.xeg-columns') || element;

  // Direct-child column wrappers. Source uses several markers across instances:
  //   .content / .image (S3, S6, S7), div[data-column] (S10, and generic).
  let columns = Array.from(
    container.querySelectorAll(':scope > .content, :scope > .image, :scope > .video-wrapper, :scope > [data-column]')
  );

  // De-duplicate (a wrapper could match both .content and [data-column]) and
  // drop empty marker spans like <span class="path">.
  const seen = new Set();
  columns = columns.filter((col) => {
    if (seen.has(col)) return false;
    seen.add(col);
    return col.textContent.trim().length > 0 || col.querySelector('img, iframe, a');
  });

  // Fallback: if no explicit column wrappers, treat the container's element
  // children as columns.
  if (columns.length === 0) {
    columns = Array.from(container.children).filter(
      (c) => c.textContent.trim().length > 0 || c.querySelector('img, iframe, a')
    );
  }

  // Empty-block guard.
  if (columns.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Build each column cell, converting YouTube iframes to link anchors.
  const rowCells = columns.map((col) => {
    const cellContent = [];
    Array.from(col.children).forEach((child) => {
      const iframe = child.matches('iframe') ? child : child.querySelector('iframe');
      if (iframe && iframe.src) {
        const link = document.createElement('a');
        // Normalise YouTube embed URLs to a watchable link.
        const embedMatch = iframe.src.match(/youtube\.com\/embed\/([\w-]+)/i);
        link.href = embedMatch
          ? `https://www.youtube.com/watch?v=${embedMatch[1]}`
          : iframe.src;
        link.textContent = iframe.getAttribute('title') || link.href;
        const p = document.createElement('p');
        p.appendChild(link);
        cellContent.push(p);
      } else {
        cellContent.push(child);
      }
    });
    return cellContent;
  });

  const cells = [rowCells];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
