/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Xcel Energy (tx.my.xcelenergy.com) site-wide cleanup.
 *
 * Source is a Salesforce Experience Cloud (Aura/LWC) page. All selectors below
 * are taken directly from migration-work/cleaned.html. Authorable content lives
 * under #xeg-main in div.ui-widget wrappers; everything targeted here is
 * non-authorable site shell / chrome / tracking.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays, chat widget, and messaging context frames that can interfere
    // with block parsing / matching.
    // From cleaned.html:
    //   line 2   <div class="auraMsgBox auraLoadingBox" id="auraLoadingBox">
    //   line 1017 <experience_messaging-embedded-messaging>
    //   line 1096 <iframe class="embeddedMessagingSiteContextFrame" id="embeddedMessagingSiteContextFrame">
    //   line 1098 <div id="embedded-messaging" class="embedded-messaging">
    WebImporter.DOMUtils.remove(element, [
      '#auraLoadingBox',
      '.auraLoadingBox',
      '.auraMsgBox',
      '#auraErrorMask',
      '#auraError',
      '.auraForcedErrorBox',
      '.auraErrorBox',
      'experience_messaging-embedded-messaging',
      '#embeddedMessagingSiteContextFrame',
      '#embedded-messaging',
      '.embeddedMessagingConversationButtonWrapper',
      '#embeddedMessagingLiveRegion',
      // Medallia / feedback survey widgets injected client-side.
      '.medallia-feedback',
      '[id^="mdlogic"]',
      '[class*="kampyle"]',
      '[id*="feedback-btn"]',
      'a[href*="resources.digital-cloud-west.medallia.com"]',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site shell: header, footer, skip link, alerts, and the
    // Aura/Salesforce layout wrappers around the content.
    // From cleaned.html:
    //   line 57  <c-xeg-site-header-alert>
    //   line 59  <a id="xegs2c" href="#xeg-main">Skip to main content</a>
    //   line 60  <c-xeg-site-header-desktop> / line 61 <header ...>
    //   line 774 <c-xeg-site-footer> / line 775 <footer ...>
    //   line 41  <siteforce-record-api-refresh-handler>
    //   line 50  <c-ma-billing-reroute>
    //   line 53  <c-xe-maintenance-redirect>
    //   line 472 <c-xeg-mobile-task>
    WebImporter.DOMUtils.remove(element, [
      'header',
      'c-xeg-site-header-desktop',
      'c-xeg-site-header-alert',
      '#xegs2c',
      'footer',
      'c-xeg-site-footer',
      'siteforce-record-api-refresh-handler',
      'c-ma-billing-reroute',
      'c-xe-maintenance-redirect',
      'c-xeg-mobile-task',
    ]);

    // Salesforce toast/panel managers, spinners, and theme/footer regions.
    // From cleaned.html:
    //   line 1014 <div class="xeg-theme-region">
    //   line 1022 <div class="xeg-footer">
    //   line 1035 <div class="forceCommunityToastManager forceToastManager--default forceToastManager">
    //   line 1044 <div class="forceHoverPrototype">
    //   line 1051 <div class="hideEl siteforceSpinnerManager siteforcePanelsContainer">
    //   line 1065 <div class="DESKTOP comm-panels-container uiContainerManager siteforcePanelsContainer">
    WebImporter.DOMUtils.remove(element, [
      '.xeg-theme-region',
      '.xeg-footer',
      '.forceToastManager',
      '.forceVisualMessageQueue',
      '.forceHoverPrototype',
      '.siteforceSpinnerManager',
      '.siteforcePanelsContainer',
      '#sf-aria-live',
    ]);

    // Tracking pixels, reCAPTCHA, tiqcdn/DMP/TTD iframes, decibelinsight links,
    // and other embedded frames/links/noscript that are never authorable.
    // From cleaned.html:
    //   line 32/33 <link href="//cdn.decibelinsight.net"> / collection.decibelinsight.net
    //   line 1078 <div class="grecaptcha-badge">
    //   line 1091 <iframe id="agency_ast_iFrame" ...>
    //   line 1096 embeddedMessagingSiteContextFrame (also handled beforeTransform)
    //   line 1109 <iframe id="universal_pixel_l4yjqem" ...>
    WebImporter.DOMUtils.remove(element, [
      '.grecaptcha-badge',
      '#agency_ast_iFrame',
      '#universal_pixel_l4yjqem',
      'link',
      'noscript',
      'source',
    ]);

    // Strip Decibel Insight tracking attributes left on authorable elements
    // (data-di-id / data-di-res-id / data-di-rand appear throughout cleaned.html).
    element.querySelectorAll('[data-di-id], [data-di-res-id], [data-di-rand]').forEach((el) => {
      el.removeAttribute('data-di-id');
      el.removeAttribute('data-di-res-id');
      el.removeAttribute('data-di-rand');
    });

    // Remove stray Aura template artifacts: loose "``" text nodes (Aura escape
    // markers near #sf-aria-live in cleaned.html) that otherwise surface as
    // empty backtick paragraphs in the imported content.
    const walker = element.ownerDocument.createTreeWalker(element, 4 /* SHOW_TEXT */);
    const strayText = [];
    let node = walker.nextNode();
    while (node) {
      if (/^[`\s]*``[`\s]*$/.test(node.nodeValue)) strayText.push(node);
      node = walker.nextNode();
    }
    strayText.forEach((n) => n.remove());

    // Medallia feedback survey is injected client-side and loads intermittently,
    // so it can slip past beforeTransform. Sweep any surviving survey anchors here
    // and remove their wrapping paragraph/container so no "Feedback Survey" link
    // leaks into the authored content.
    element
      .querySelectorAll('a[href*="medallia.com"], a[href*="digital-cloud-west"]')
      .forEach((a) => {
        const wrapper = a.closest('p, li, div');
        (wrapper || a).remove();
      });
  }
}
