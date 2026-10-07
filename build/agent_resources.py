"""Public shell only. Private resource metadata is fetched after server authorization."""
def body():
    return """
<section class="agent-page" aria-labelledby="agent-title">
  <div class="container--wide agent-container">
    <div class="agent-intro">
      <div class="eyebrow">OPULENCE VENTURE GROUP · AGENT ACCESS</div>
      <h1 id="agent-title">Resources for<br>your next step.</h1>
      <p class="body-lg">One place for approved agent materials, training, and videos.</p>
    </div>
    <div id="agent-gate" class="agent-gate">
      <div class="agent-gate-heading"><span class="agent-access-tag">Agent Resources</span><h2>Enter your access code</h2>
      <p>Use the shared four-digit passcode provided by your agency leadership.</p></div>
      <form id="agent-login" novalidate>
        <label for="agent-code">Four-digit passcode</label>
        <div class="agent-code-control">
          <input id="agent-code" name="code" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" minlength="4" autocomplete="off" spellcheck="false" required aria-describedby="agent-code-help agent-login-error">
          <button id="agent-show-code" type="button" aria-label="Show passcode" aria-pressed="false">Show</button>
        </div>
        <p id="agent-code-help" class="agent-help">Access is for approved agents only. Please do not share this code outside your team.</p>
        <button class="btn btn-primary btn-block" id="agent-unlock" type="submit">Unlock Agent Resources</button>
        <p id="agent-login-error" class="agent-notice agent-error" role="alert" hidden></p>
      </form>
      <div class="agent-access-help"><h3>Need access?</h3><p>Ask your agency leader for the current code, or <a href="mailto:info@opulenceinvestments.net?subject=Agent%20Resources%20Access">contact our team</a>.</p></div>
      <noscript><p class="agent-notice agent-error">Please enable JavaScript to use the access screen.</p></noscript>
    </div>
    <section id="agent-library" class="agent-library" aria-labelledby="agent-library-title" hidden>
      <div class="agent-library-heading">
        <div><span class="agent-access-tag">Access granted</span><h2 id="agent-library-title" tabindex="-1">Your resource library</h2><p>Find the tools and training you need for your next conversation.</p></div>
        <button id="agent-signout" class="btn btn-outline" type="button">Sign out</button>
      </div>
      <div class="agent-library-tools">
        <div class="agent-search"><label for="agent-search">Search the library</label><input id="agent-search" type="search" placeholder="Search titles, topics, or descriptions" autocomplete="off"></div>
        <div class="agent-filters" role="group" aria-label="Resource type">
          <button type="button" data-resource-filter="all" aria-pressed="true">All resources</button>
          <button type="button" data-resource-filter="material" aria-pressed="false">Materials</button>
          <button type="button" data-resource-filter="video" aria-pressed="false">Videos</button>
        </div>
      </div>
      <p id="agent-resource-count" class="agent-help" role="status" aria-live="polite"></p>
      <div id="agent-resource-grid" class="agent-resource-grid"></div>
      <div id="agent-empty" class="agent-empty" hidden><span class="agent-access-tag">Library updates</span><h3 id="agent-empty-title">Your library is ready to grow.</h3><p id="agent-empty-description">Approved materials and training videos will appear here as they are added. Check back with your agency leader for the first resources.</p></div>
      <p class="agent-session-note">This session lasts up to two hours. Refreshing or closing this page locks the library again.</p>
    </section>
    <p id="agent-session-status" class="agent-help" role="status" aria-live="polite"></p>
  </div>
</section>
<script src="agent-resources.js" defer></script>
"""
