(function () {
  var STORAGE_KEY = "cookie-consent";

  /* Il sito può essere mostrato dentro un iframe (inoltro "mascherato" di Aruba su inglibardo.it).
     Su iPhone/Safari gli elementi position:fixed dentro un iframe si vedono ma non ricevono i tocchi
     nel punto giusto: in quel caso banner e finestra impostazioni vengono mostrati "nel flusso"
     in cima alla pagina (classe cookie-inframe, vedi style.css). */
  var IN_FRAME = false;
  try { IN_FRAME = window.self !== window.top; } catch (e) { IN_FRAME = true; }

  function getConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(consent) {
    try {
      consent.timestamp = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch (e) {}
  }

  function removeBanner() {
    var b = document.getElementById("cookie-banner");
    if (b) b.remove();
  }

  function removeModal() {
    var m = document.getElementById("cookie-modal-overlay");
    if (m) m.remove();
  }

  function showBanner() {
    if (document.getElementById("cookie-banner")) return;
    var el = document.createElement("div");
    el.id = "cookie-banner";
    el.innerHTML =
      '<div class="cookie-inner">' +
      "<p>Questo sito utilizza cookie tecnici necessari al funzionamento. Con il tuo consenso potremmo utilizzare anche cookie statistici e di marketing. Puoi accettare, negare o personalizzare le tue preferenze.</p>" +
      '<div class="cookie-actions">' +
      '<button type="button" data-action="settings">Impostazioni</button>' +
      '<button type="button" data-action="reject">Nega</button>' +
      '<button type="button" class="cookie-accept" data-action="accept">Accetta</button>' +
      "</div></div>";
    if (IN_FRAME) {
      el.className = "cookie-inframe";
      document.body.insertBefore(el, document.body.firstChild);
    } else {
      document.body.appendChild(el);
    }

    el.querySelector('[data-action="accept"]').addEventListener("click", function () {
      saveConsent({ necessary: true, statistics: true, marketing: true });
      removeBanner();
    });
    el.querySelector('[data-action="reject"]').addEventListener("click", function () {
      saveConsent({ necessary: true, statistics: false, marketing: false });
      removeBanner();
    });
    el.querySelector('[data-action="settings"]').addEventListener("click", function () {
      showModal();
    });
  }

  function showModal() {
    if (document.getElementById("cookie-modal-overlay")) return;
    var current = getConsent() || { necessary: true, statistics: false, marketing: false };

    var overlay = document.createElement("div");
    overlay.id = "cookie-modal-overlay";
    overlay.innerHTML =
      '<div id="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">' +
      '<h2 id="cookie-modal-title">Impostazioni cookie</h2>' +
      '<p class="desc">Scegli quali categorie di cookie autorizzare. Puoi modificare queste preferenze in qualsiasi momento.</p>' +
      '<div class="cookie-cat">' +
      '<div class="cat-info"><strong>Necessari</strong><span>Indispensabili al funzionamento del sito, sempre attivi.</span></div>' +
      '<input type="checkbox" checked disabled>' +
      "</div>" +
      '<div class="cookie-cat">' +
      '<div class="cat-info"><strong>Statistiche</strong><span>Aiutano a capire come viene utilizzato il sito.</span></div>' +
      '<input type="checkbox" id="cc-statistics">' +
      "</div>" +
      '<div class="cookie-cat">' +
      '<div class="cat-info"><strong>Marketing</strong><span>Utilizzati per mostrare contenuti pertinenti.</span></div>' +
      '<input type="checkbox" id="cc-marketing">' +
      "</div>" +
      '<div class="cookie-actions">' +
      '<button type="button" data-action="cancel">Annulla</button>' +
      '<button type="button" class="cookie-accept" data-action="save">Salva preferenze</button>' +
      "</div></div>";
    if (IN_FRAME) {
      overlay.className = "cookie-inframe";
      document.body.insertBefore(overlay, document.body.firstChild);
      window.scrollTo(0, 0);
    } else {
      document.body.appendChild(overlay);
    }

    document.getElementById("cc-statistics").checked = !!current.statistics;
    document.getElementById("cc-marketing").checked = !!current.marketing;

    overlay.querySelector('[data-action="cancel"]').addEventListener("click", removeModal);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) removeModal();
    });
    overlay.querySelector('[data-action="save"]').addEventListener("click", function () {
      saveConsent({
        necessary: true,
        statistics: document.getElementById("cc-statistics").checked,
        marketing: document.getElementById("cc-marketing").checked
      });
      removeModal();
      removeBanner();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!getConsent()) showBanner();
  });

  window.openCookieSettings = showModal;
})();
