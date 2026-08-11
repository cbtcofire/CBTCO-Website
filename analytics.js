/* ==========================================================================
   CBTCO Fire & Safety — website analytics loader
   --------------------------------------------------------------------------
   PASTE YOUR TWO IDs BELOW. This is the only file you ever need to edit.
   Every page on the site loads this file, so changing an ID here changes it
   everywhere.

   Until you replace the placeholder text, nothing loads and nothing is
   tracked — so this file is safe to deploy right now.
   ========================================================================== */

var GA4_ID     = "G-XD0KG85H8V";      /* looks like: G-ABC1234XYZ   */
var CLARITY_ID = "PASTE-CLARITY-ID-HERE";  /* looks like: q7f2mk9xyz     */

/* ==========================================================================
   No changes needed below this line.
   ========================================================================== */

(function () {
  "use strict";

  var gaReady = GA4_ID && GA4_ID !== "PASTE-GA4-ID-HERE";
  var clReady = CLARITY_ID && CLARITY_ID !== "PASTE-CLARITY-ID-HERE";

  /* ---------------------------------------------------- Google Analytics 4 */
  if (gaReady) {
    var tag = document.createElement("script");
    tag.async = true;
    tag.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4_ID;
    document.head.appendChild(tag);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA4_ID);
  }

  /* ------------------------------------------------- Microsoft Clarity */
  if (clReady) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1;
      t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CLARITY_ID);
  }

  /* --------------------------------------------------------------------
     Lead-action tracking.

     Page views are automatic. These extra events answer the questions that
     actually matter for the business: how many visitors tapped the phone
     number, emailed, hit "Request Service", opened the customer portal, or
     used the travel-charge lookup — and which page they were on when they
     did it. They show up in GA4 under Reports > Engagement > Events.
     -------------------------------------------------------------------- */
  if (!gaReady) return;

  function send(name, params) {
    params = params || {};
    params.page_path = location.pathname;
    window.gtag("event", name, params);
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a") : null;
    if (!a) return;

    var href = (a.getAttribute("href") || "").trim();

    if (href.indexOf("tel:") === 0) {
      send("phone_click", { link_text: a.textContent.trim().slice(0, 80) });
      return;
    }
    if (href.indexOf("mailto:") === 0) {
      send("email_click", { link_text: a.textContent.trim().slice(0, 80) });
      return;
    }
    if (href.indexOf("inspectpoint.com") > -1) {
      send("portal_click");
      return;
    }
    /* "Request Service" and other contact CTAs */
    if (href === "/contact" || href.indexOf("/contact") === 0) {
      send("request_service_click", {
        link_text: a.textContent.trim().slice(0, 80),
        is_button: a.className.indexOf("btn") > -1 || a.className.indexOf("cta") > -1
      });
    }
  }, true);

  /* Contact form submissions (the closest thing to a conversion) */
  document.addEventListener("submit", function (e) {
    if (e.target && e.target.tagName === "FORM") send("form_submit");
  }, true);

  /* Travel-charge lookups: fires once per successful ZIP result */
  if (location.pathname.indexOf("travel-charges") > -1) {
    document.addEventListener("DOMContentLoaded", function () {
      var card = document.getElementById("result") ||
                 document.querySelector(".tc-card");
      if (!card || !window.MutationObserver) return;
      var last = "";
      new MutationObserver(function () {
        if (card.hasAttribute("hidden")) return;
        var zip = (document.getElementById("zip") || {}).value || "";
        if (zip && zip !== last) { last = zip; send("travel_charge_lookup"); }
      }).observe(card, { attributes: true, childList: true, subtree: true });
    });
  }
})();
