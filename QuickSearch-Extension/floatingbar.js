(function() {
  if (document.getElementById('qs-floating-bar')) return;

  const styleEl = document.createElement('style');
  styleEl.textContent = `
    #qs-floating-bar {
      position: fixed;
      top: -42px;
      left: 0; right: 0;
      height: 42px;
      background: #2a2a2a;
      border-bottom: 1px solid #404040;
      display: flex;
      align-items: center;
      padding: 0 12px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      color: #e0e0e0;
      gap: 8px;
      transition: top 0.2s ease;
    }
    #qs-floating-bar.qs-bar-visible { top: 0; }
    #qs-bar-input {
      flex-grow: 1;
      background: transparent;
      border: none; outline: none;
      color: #e0e0e0; font-size: 13px;
      caret-color: #e0e0e0; min-width: 0;
    }
    #qs-open-tab-btn {
      display: flex; align-items: center; gap: 5px;
      padding: 5px 10px; border-radius: 6px;
      border: 1px solid #404040;
      background: #1e1f1f; color: #e0e0e0;
      font-size: 13px; cursor: pointer; white-space: nowrap; flex-shrink: 0;
    }
    #qs-open-tab-btn:hover { background: #333; }
    #qs-bar-hint { font-size: 11px; color: #aaa; white-space: nowrap; flex-shrink: 0; }
  `;
  document.head.appendChild(styleEl);

  const bar = document.createElement('div');
  bar.id = 'qs-floating-bar';

  const searchIcon = document.createElement('span');
  searchIcon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2.5" style="display:block"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
  searchIcon.style.flexShrink = '0';

  const searchInput = document.createElement('input');
  searchInput.id = 'qs-bar-input';
  searchInput.type = 'text';
  searchInput.placeholder = 'Search or enter URL...';

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q') || urlParams.get('search') || urlParams.get('query') || '';
    searchInput.value = q || window.location.href;
  } catch(e) {}

  const hint = document.createElement('span');
  hint.id = 'qs-bar-hint';
  hint.textContent = '⌘O to open as tab';

  const openTabBtn = document.createElement('button');
  openTabBtn.id = 'qs-open-tab-btn';
  openTabBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> Open tab`;

  function openAsTab() {
    bar.classList.remove('qs-bar-visible');
    browser.runtime.sendMessage({ action: 'openAsTab', url: window.location.href });
  }
  openTabBtn.addEventListener('click', openAsTab);

  bar.appendChild(searchIcon);
  bar.appendChild(searchInput);
  bar.appendChild(hint);
  bar.appendChild(openTabBtn);
  document.body.prepend(bar);

  let hideTimer = null;

  function showBar() {
    clearTimeout(hideTimer);
    bar.classList.add('qs-bar-visible');
  }

  function scheduleHide() {
    if (searchInput === document.activeElement) return;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => bar.classList.remove('qs-bar-visible'), 500);
  }

  document.addEventListener('mousemove', (e) => {
    if (e.clientY <= 10) showBar();
    else if (!bar.matches(':hover') && searchInput !== document.activeElement) scheduleHide();
  });

  bar.addEventListener('mouseenter', showBar);
  bar.addEventListener('mouseleave', scheduleHide);
  searchInput.addEventListener('focus', showBar);
  searchInput.addEventListener('blur', scheduleHide);

  function isUrl(input) {
    return /^https?:\/\//i.test(input) || (/\S+\.\S+/.test(input) && !input.includes(' '));
  }

  function buildUrl(query) {
    const host = window.location.hostname;
    if (host.includes('google.com')) return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    if (host.includes('duckduckgo.com')) return `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    if (host.includes('bing.com')) return `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    if (host.includes('wikipedia.org')) return `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`;
    if (host.includes('startpage.com')) return `https://www.startpage.com/search?q=${encodeURIComponent(query)}`;
    return `https://www.startpage.com/search?q=${encodeURIComponent(query)}`;
  }

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = searchInput.value.trim();
      if (!val) return;
      window.location.href = isUrl(val) ? (/^https?:\/\//i.test(val) ? val : 'https://' + val) : buildUrl(val);
    }
    if (e.key === 'Escape') searchInput.blur();
    e.stopPropagation();
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
      e.preventDefault(); e.stopPropagation();
      showBar(); searchInput.focus(); searchInput.select();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
      e.preventDefault(); e.stopPropagation();
      openAsTab();
    }
  }, true);

})();
