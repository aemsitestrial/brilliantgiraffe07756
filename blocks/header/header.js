import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeAllPanels(navSections) {
  navSections.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((d) => {
    d.setAttribute('aria-expanded', 'false');
  });
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (isDesktop.matches) {
      closeAllPanels(navSections);
    } else {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget) && isDesktop.matches) {
    closeAllPanels(nav.querySelector('.nav-sections'));
  }
}

/**
 * Toggles the entire nav (mobile drawer)
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = expanded || isDesktop.matches ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  closeAllPanels(navSections);
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * Builds the megamenu top-level items. Each top-level <li> that contains a
 * nested <ul> becomes a nav-drop trigger; the nested <ul> becomes the panel.
 */
function decorateSections(navSections) {
  const topList = navSections.querySelector('ul');
  if (!topList) return;

  topList.querySelectorAll(':scope > li').forEach((navItem) => {
    const panel = navItem.querySelector(':scope > ul');
    if (panel) {
      navItem.classList.add('nav-drop');
      navItem.setAttribute('aria-expanded', 'false');
      panel.classList.add('nav-panel');

      // Mark each column (a nested <li> whose label precedes a <ul>) for grid layout.
      panel.querySelectorAll(':scope > li').forEach((col) => {
        if (col.querySelector(':scope > ul')) col.classList.add('nav-column');
        else col.classList.add('nav-panel-cta');
      });

      // The clickable trigger is the text node before the panel — wrap it.
      const label = document.createElement('span');
      label.className = 'nav-drop-label';
      // move all child nodes that are NOT the panel <ul> into the label
      [...navItem.childNodes].forEach((n) => {
        if (n !== panel) label.appendChild(n);
      });
      navItem.prepend(label);

      const toggle = () => {
        const open = navItem.getAttribute('aria-expanded') === 'true';
        closeAllPanels(navSections);
        navItem.setAttribute('aria-expanded', open ? 'false' : 'true');
      };
      label.addEventListener('click', toggle);
      // desktop: open on hover
      navItem.addEventListener('mouseenter', () => {
        if (isDesktop.matches) {
          closeAllPanels(navSections);
          navItem.setAttribute('aria-expanded', 'true');
        }
      });
      navItem.addEventListener('mouseleave', () => {
        if (isDesktop.matches) navItem.setAttribute('aria-expanded', 'false');
      });
    }
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment (localhost first, then DA/EDS)
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/content/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Brand: turn the logo picture into a linked home logo
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const logo = navBrand.querySelector('picture');
    if (logo) {
      const homeLink = document.createElement('a');
      homeLink.href = '/';
      homeLink.setAttribute('aria-label', 'Xcel Energy - Homepage');
      homeLink.className = 'nav-logo';
      homeLink.appendChild(logo);
      navBrand.prepend(homeLink);
      const logoImg = navBrand.querySelector('img');
      if (logoImg) logoImg.setAttribute('loading', 'eager');
    }
    // the utility links list keeps its own class for styling
    const utilList = navBrand.querySelector('ul');
    if (utilList) utilList.classList.add('nav-utility');
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) decorateSections(navSections);

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, navSections, isDesktop.matches);
    if (navSections) closeAllPanels(navSections);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
