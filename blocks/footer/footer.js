import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// Inline brand icons for the social row, keyed by link text.
const SOCIAL_ICONS = {
  facebook:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z"/></svg>',
  twitter:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.9 2H22l-7.3 8.3L23.2 22h-6.6l-5.2-6.8L5.4 22H2.3l7.8-8.9L1.2 2h6.8l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.1 3.9H5.2L17.7 20Z"/></svg>',
  instagram:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.4-1.3.8-.4.4-.6.8-.8 1.3-.2.4-.3 1-.4 2.1C2.6 8.5 2.6 8.9 2.6 12s0 3.5.1 4.7c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.3.4.4.8.6 1.3.8.4.2 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.3-.8.4-.4.6-.8.8-1.3.2-.4.3-1 .4-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.4-2.1-.2-.5-.4-.9-.8-1.3-.4-.4-.8-.6-1.3-.8-.4-.2-1-.3-2.1-.4C15.5 4 15.1 4 12 4Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 8.1a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm6.2-8.3a1.1 1.1 0 1 1-2.3 0 1.1 1.1 0 0 1 2.3 0Z"/></svg>',
  linkedin:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2ZM8 19H5V9h3v10ZM6.5 7.7A1.75 1.75 0 1 1 6.5 4.2a1.75 1.75 0 0 1 0 3.5ZM19 19h-3v-4.9c0-1.2 0-2.7-1.7-2.7s-1.9 1.3-1.9 2.6V19h-3V9h2.9v1.4h.1a3.2 3.2 0 0 1 2.9-1.6c3.1 0 3.7 2 3.7 4.7V19Z"/></svg>',
  youtube:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.5 3.9 12 3.9 12 3.9s-7.5 0-9.4.5A3 3 0 0 0 .5 6.5 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.5 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.5ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z"/></svg>',
};

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta
    ? new URL(footerMeta, window.location).pathname
    : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  const sections = [...footer.children];

  // ---- Section 1: link columns ----
  // EDS wraps content in .default-content-wrapper with flat h3 + ul pairs.
  // Group each heading with its following list into a .footer-column so CSS grid
  // sees the columns as direct children.
  const linksSection = sections[0];
  if (linksSection) {
    linksSection.classList.add('footer-links');
    const wrapper = linksSection.querySelector('.default-content-wrapper') || linksSection;
    const grid = document.createElement('div');
    grid.className = 'footer-links-grid';
    let current = null;
    [...wrapper.children].forEach((node) => {
      if (node.tagName === 'H3') {
        current = document.createElement('div');
        current.className = 'footer-column';
        current.append(node);
        grid.append(current);
      } else if (current) {
        current.append(node);
      }
    });
    wrapper.append(grid);
  }

  // ---- Section 2: social + legal ----
  const socialLegal = sections[1];
  if (socialLegal) {
    socialLegal.classList.add('footer-social-legal');
    const lists = socialLegal.querySelectorAll('ul');
    const socialList = lists[0];
    const legalList = lists[1];
    if (socialList) {
      socialList.classList.add('footer-social');
      socialList.querySelectorAll('a').forEach((a) => {
        const key = a.textContent.trim().toLowerCase();
        if (SOCIAL_ICONS[key]) {
          a.setAttribute('aria-label', a.textContent.trim());
          a.innerHTML = SOCIAL_ICONS[key];
        }
      });
    }
    if (legalList) legalList.classList.add('footer-legal');
  }

  // ---- Section 3: brand + copyright ----
  if (sections[2]) {
    sections[2].classList.add('footer-brand');
  } else {
    // Source footer ends with a copyright line; the content fragment omits it,
    // so synthesize the brand/copyright row to match.
    const brand = document.createElement('div');
    brand.className = 'footer-brand';
    const year = new Date().getFullYear();
    const copyright = document.createElement('p');
    copyright.textContent = `© ${year} Xcel Energy Inc. All rights reserved.`;
    brand.append(copyright);
    footer.append(brand);
  }

  block.append(footer);
}
