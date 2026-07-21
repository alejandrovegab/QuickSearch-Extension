let currentEngines = [];
let currentEngine = null;

browser.runtime.sendMessage({ action: 'getSearchEngines' }).then((response) => {
  if (response && response.engines) {
    currentEngines = response.engines;
    currentEngine = response.engines.find(e => e.name === 'Startpage')
      || response.engines.find(e => e.isDefault)
      || response.engines[0];
    updateEngineBtn();
    populateEngineOptions();
  }
});

function updateEngineBtn() {
  const engineBtn = document.getElementById('engine-btn');
  if (!engineBtn) return;
  engineBtn.innerHTML = '';
  if (currentEngine) {
    if (currentEngine.favIconUrl) {
      const img = document.createElement('img');
      img.src = currentEngine.favIconUrl;
      img.onerror = () => img.remove();
      engineBtn.appendChild(img);
    }
    engineBtn.appendChild(document.createTextNode(currentEngine.name));
  } else {
    engineBtn.textContent = 'Search';
  }
}

function populateEngineOptions() {
  const engineOptions = document.getElementById('engine-options');
  if (!engineOptions) return;
  engineOptions.innerHTML = '';
  currentEngines.forEach(engine => {
    const opt = document.createElement('div');
    opt.className = 'engine-option';
    if (engine.favIconUrl) {
      const img = document.createElement('img');
      img.src = engine.favIconUrl;
      img.onerror = () => img.remove();
      opt.appendChild(img);
    }
    opt.appendChild(document.createTextNode(engine.name));
    opt.addEventListener('click', () => {
      currentEngine = engine;
      updateEngineBtn();
      engineOptions.style.display = 'none';
      const q = document.getElementById('search-input').value.trim();
      if (q) performSearch(q);
    });
    engineOptions.appendChild(opt);
  });
}

function buildUrl(query) {
  if (!currentEngine) return `https://www.startpage.com/search?q=${encodeURIComponent(query)}`;
  const n = currentEngine.name;
  if (n === 'Google') return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  if (n === 'DuckDuckGo') return `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
  if (n === 'Bing') return `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
  if (n.includes('Wikipedia')) return `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`;
  if (n === 'Startpage') return `https://www.startpage.com/search?q=${encodeURIComponent(query)}`;
  return `https://www.startpage.com/search?q=${encodeURIComponent(query)}`;
}

function isUrl(input) {
  return /^https?:\/\//i.test(input) || (/\S+\.\S+/.test(input) && !input.includes(' '));
}

function performSearch(query) {
  browser.runtime.sendMessage({ action: 'expandMiniBrowser' });
  if (isUrl(query)) {
    window.location.href = /^https?:\/\//i.test(query) ? query : 'https://' + query;
  } else {
    window.location.href = buildUrl(query);
  }
}

const searchInput = document.getElementById('search-input');
const engineBtn = document.getElementById('engine-btn');
const engineOptions = document.getElementById('engine-options');
const openTabBtn = document.getElementById('open-tab-btn');

engineBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  engineOptions.style.display = engineOptions.style.display === 'block' ? 'none' : 'block';
});
document.addEventListener('click', () => { engineOptions.style.display = 'none'; });

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const q = searchInput.value.trim();
    if (q) performSearch(q);
  }
  if (e.key === 'Escape') window.close();
});

openTabBtn.addEventListener('click', () => {
  const q = searchInput.value.trim();
  if (q) browser.runtime.sendMessage({ action: 'openAsTab', url: buildUrl(q) });
});

searchInput.focus();
