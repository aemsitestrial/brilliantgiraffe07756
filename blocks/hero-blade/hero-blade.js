/**
 * hero-blade block
 *
 * Full-bleed banner. Authored as two rows:
 *   row 1 -> background image (field:image)
 *   row 2 -> text content: heading + optional paragraph + optional CTA link(s)
 *
 * Supports three variants (auto-detected from content):
 *   - hero (default): headline + subtext over a photo, white text
 *   - multi-action:   headline + a row of CTA buttons (2+ links, no paragraph)
 *   - light:          headline + subtext + single CTA on a light background
 *
 * The light variant is opt-in via the section style `light` (section metadata)
 * or by adding the `light` class to the block.
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Identify the image row (contains a picture) and the content row.
  const imageRow = rows.find((row) => row.querySelector('picture'));
  const contentRow = rows.find((row) => row !== imageRow);

  if (imageRow) {
    imageRow.classList.add('hero-blade-image');
  }
  if (contentRow) {
    contentRow.classList.add('hero-blade-content');
  }

  // Count CTA links to detect the multi-action variant.
  const links = contentRow ? [...contentRow.querySelectorAll('a')] : [];
  if (links.length >= 2 && !contentRow.querySelector('picture')) {
    block.classList.add('multi-action');

    // Wrap the row of CTA links in a dedicated container for flex layout.
    const actions = document.createElement('div');
    actions.className = 'hero-blade-actions';
    links.forEach((a) => {
      const container = a.closest('.button-container') || a.parentElement;
      actions.append(container);
    });
    const heading = contentRow.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) heading.after(actions);
    else contentRow.prepend(actions);
  }

  // If the block has no photo at all, mark it so the layout can adapt.
  if (!imageRow) {
    block.classList.add('no-image');
  }
}
