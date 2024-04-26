var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// src/script/tiling/tilingmanager.ts
var TilingManager;
var init_tilingmanager = __esm({
  "src/script/tiling/tilingmanager.ts"() {
    "use strict";
    TilingManager = class {
      constructor(kwinLog) {
        this.registeredWindows = [];
        this.logging = kwinLog;
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
  }
});

// src/script/tiling/log.ts
var Log;
var init_log = __esm({
  "src/script/tiling/log.ts"() {
    "use strict";
    Log = class {
      constructor(kwinRoot) {
        this.printMessage = kwinRoot.print;
      }
    };
  }
});

// src/script/index.ts
var require_script = __commonJS({
  "src/script/index.ts"(exports) {
    init_tilingmanager();
    init_log();
    var kwinRoot = exports;
    var kwinLog = new Log(kwinRoot);
    var tilingManager = new TilingManager(kwinLog);
    var kwinWorkspace = kwinRoot.workspace;
    kwinWorkspace.windowAdded.connect(tilingManager.registerWindow);
  }
});
export default require_script();
