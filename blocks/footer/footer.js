import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/content/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Tag the three sections: link columns, social/legal, brand/copyright.
  const sections = footer.children;
  if (sections[0]) sections[0].classList.add('footer-links');
  if (sections[1]) sections[1].classList.add('footer-social-legal');
  if (sections[2]) sections[2].classList.add('footer-brand');

  block.append(footer);
}
