let miniBrowserWindowId = null;
let miniBrowserTabId = null;

async function openOrToggleMiniBrowser() {
  if (miniBrowserWindowId !== null) {
    try {
      await browser.windows.remove(miniBrowserWindowId);
      miniBrowserWindowId = null;
      miniBrowserTabId = null;
      return;
    } catch (e) { miniBrowserWindowId = null; miniBrowserTabId = null; }
  }

  const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
  const cookieStoreId = currentTab ? currentTab.cookieStoreId : null;

  const currentWindow = await browser.windows.getCurrent();
  const smallWidth = 500;
  const smallHeight = 60;
  const left = currentWindow.left + currentWindow.width - smallWidth - 20;
  const top = currentWindow.top + 20;

  const createParams = {
    url: browser.runtime.getURL('minibrowser.html'),
    type: 'popup',
    width: smallWidth,
    height: smallHeight,
    left, top,
  };

  if (cookieStoreId && cookieStoreId !== 'firefox-default') {
    createParams.cookieStoreId = cookieStoreId;
  }

  const win = await browser.windows.create(createParams);
  miniBrowserWindowId = win.id;
  miniBrowserTabId = win.tabs[0].id;
}

browser.windows.onRemoved.addListener((windowId) => {
  if (windowId === miniBrowserWindowId) {
    miniBrowserWindowId = null;
    miniBrowserTabId = null;
  }
});

// Inject floatingbar into mini browser tabs when they navigate
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Handle quicksearch URL trigger
  if (changeInfo.url && changeInfo.url.startsWith('https://quicksearch.internal/open')) {
    browser.tabs.remove(tabId).catch(() => {});
    openOrToggleMiniBrowser();
    return;
  }

  if (tabId === miniBrowserTabId && tab.url && !tab.url.startsWith('moz-extension://')) {
    // Expand window as soon as navigation starts
    if (changeInfo.url && miniBrowserWindowId !== null) {
      const expandedWidth = 1100;
      const expandedHeight = 700;
      browser.windows.getAll().then(wins => {
        const mainWin = wins.filter(w => w.id !== miniBrowserWindowId)
                            .sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
        
        const screenW = (typeof screen !== 'undefined' && screen.width) ? screen.width : 1920;
        const screenH = (typeof screen !== 'undefined' && screen.height) ? screen.height : 1080;

        const left = mainWin ? Math.round(mainWin.left + (mainWin.width - expandedWidth) / 2) : Math.round((screenW - expandedWidth) / 2);
        const top = mainWin ? Math.round(mainWin.top + (mainWin.height - expandedHeight) / 2) : Math.round((screenH - expandedHeight) / 2);
        
        browser.windows.update(miniBrowserWindowId, { width: expandedWidth, height: expandedHeight, left, top }).catch(() => {});
      });
    }
    // Inject floating bar once page is loaded
    if (changeInfo.status === 'complete') {
      browser.tabs.executeScript(tabId, { file: 'floatingbar.js' }).catch((e) => console.error('floatingbar inject failed:', e));
    }
  }
});

browser.commands.onCommand.addListener((command) => {
  if (command === 'toggle-minibrowser') openOrToggleMiniBrowser();
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSearchEngines') {
    browser.search.get().then((engines) => sendResponse({ engines }));
    return true;
  }
  if (message.action === 'openAsTab') {
    const tabParams = { url: message.url };
    if (message.cookieStoreId) tabParams.cookieStoreId = message.cookieStoreId;
    browser.tabs.create(tabParams);
    if (sender.tab && sender.tab.windowId) {
      browser.windows.remove(sender.tab.windowId).catch(() => {});
    }
    return true;
  }
  if (message.action === 'expandMiniBrowser') {
    if (miniBrowserWindowId !== null) {
      const expandedWidth = 1100;
      const expandedHeight = 700;
      browser.windows.getAll().then(wins => {
        const mainWin = wins.filter(w => w.id !== miniBrowserWindowId)
                            .sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
        
        const screenW = (typeof screen !== 'undefined' && screen.width) ? screen.width : 1920;
        const screenH = (typeof screen !== 'undefined' && screen.height) ? screen.height : 1080;

        let left, top;
        if (mainWin) {
          left = Math.round(mainWin.left + (mainWin.width - expandedWidth) / 2);
          top = Math.round(mainWin.top + (mainWin.height - expandedHeight) / 2);
        } else {
          left = Math.round((screenW - expandedWidth) / 2);
          top = Math.round((screenH - expandedHeight) / 2);
        }
        browser.windows.update(miniBrowserWindowId, {
          width: expandedWidth, height: expandedHeight, left, top,
        }).catch(() => {});
      });
    }
    return true;
  }
});