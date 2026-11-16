/* Opulence FNA: saves in-progress answers in this browser so clients can come back later.
   Only shipped with the website (the hosted preview does not allow browser storage). */
(function () {
  var KEY = 'opulence-fna-progress-v1';
  try {
    var ls = window.localStorage; ls.getItem(KEY);
    window.FNA_STORE = {
      get: function () { return ls.getItem(KEY); },
      set: function (v) { ls.setItem(KEY, v); },
      remove: function () { ls.removeItem(KEY); }
    };
  } catch (e) { /* storage blocked (private mode etc.) - Save progress still downloads a file */ }
})();
