"use strict";

// src/script/tiling/tilingmanager.ts
var TilingManager = class {
  constructor(kwinLog2) {
    this.registeredWindows = [];
    this.logging = kwinLog2;
  }
  registerWindow(window) {
    this.logging.printMessage("New Window registration started...");
    if (this.isWindowRelevant(window)) {
      this.tileWindow(window);
    }
  }
  isWindowRelevant(window) {
    if (window.fullScreen)
      return false;
    if (window.minimized)
      return false;
    if (window.popupWindow)
      return false;
    if (!window.normalWindow)
      return false;
    return true;
  }
  tileWindow(window) {
    this.registeredWindows.push(window);
    this.logging.printMessage("New Window added to the Tiling Manager.");
  }
};

// src/script/tiling/log.ts
var Log = class {
  constructor(kwinRoot2) {
    this.printMessage = kwinRoot2.print;
  }
};

// src/script/index.ts
var kwinRoot = exports;
var kwinLog = new Log(kwinRoot);
var tilingManager = new TilingManager(kwinLog);
var kwinWorkspace = kwinRoot.workspace;
kwinWorkspace.windowAdded.connect(tilingManager.registerWindow);
