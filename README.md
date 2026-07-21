# QuickSearch Extension

A Little Arc-style quick search overlay for Firefox and Gecko-based browsers (Zen Browser, LibreWolf, Floorp, etc.).

A spruced-up native WebExtension port of **[Darsh-A's original userChrome script](https://github.com/Darsh-A/Quick-Search-Zen-Browser/tree/main)**—re-engineered for one-click installation, pop-up windows, container context preservation, and zero manual configuration.

---

## ✨ Features

- **Hotkey Trigger:** Launch a clean search overlay instantly from inside the browser using `Ctrl+Alt+N` (Windows/Linux) or `Cmd+Option+N` (macOS).
- **Arc-Style Mini Browser:** Expands fluidly from a lightweight search bar into a full browser window upon submitting queries or navigating to URLs.
- **Container Support:** Automatically preserves your active Firefox container tab context for seamlessly isolated browsing sessions.
- **In-Page Floating Bar:** Dynamically injects a minimal top navigation bar onto loaded pages with quick search and a `⌘O` / `Ctrl+O` shortcut to open the active URL into a full browser tab.
- **Multi-Engine Support:** Built-in engine picker with support for Google, Startpage, DuckDuckGo, Bing, and Wikipedia.
- **Native & Lightweight:** Fast and easy to set up—no `userChrome.css`, `userContent.css`, or `autoconfig` scripts required.

---

## 🚀 Installation

### Option 1: Firefox Add-ons Store (Recommended)

Install QuickSearch directly from the official Mozilla Add-ons directory:

👉 **[Get QuickSearch on Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/quicksearch-arc-style-overlay/)**

*(Works on Firefox, Zen Browser, LibreWolf, and other Gecko-based browsers).*

---

### Option 2: Manual / Developer Installation

If you prefer to load the extension locally or contribute to development:

1. Clone or download this repository:
   ```bash
   git clone [https://github.com/alejandrovegab/QuickSearch-Extension.git](https://github.com/alejandrovegab/QuickSearch-Extension.git)
   ```
2. Open your browser and navigate to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...**
4. Select the `manifest.json` file inside the project directory.
