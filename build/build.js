define("script/tiling/log", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Log = /** @class */ (function () {
        function Log(kwinRoot) {
            this.printMessage = kwinRoot.print;
        }
        return Log;
    }());
    exports.default = Log;
});
define("script/tiling/tilingmanager", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TilingManager = void 0;
    var TilingManager = /** @class */ (function () {
        function TilingManager(kwinLog) {
            this.registeredWindows = [];
            this.logging = kwinLog;
        }
        TilingManager.prototype.registerWindow = function (window) {
            this.logging.printMessage("New Window registration started...");
            // Check if the Window is relevant for us
            if (this.isWindowRelevant(window)) {
                this.tileWindow(window);
            }
        };
        TilingManager.prototype.isWindowRelevant = function (window) {
            // Check wheter the Window is in the List defined in the Configuration to be skipped
            // Check if the Window is not relevant based on his basic properties
            if (window.fullScreen)
                return false;
            if (window.minimized)
                return false;
            if (window.popupWindow)
                return false;
            if (!window.normalWindow)
                return false;
            // #TODO if a Window is set to floated. Not supported yet!
            return true;
        };
        TilingManager.prototype.tileWindow = function (window) {
            // Add the Window to the list
            this.registeredWindows.push(window);
            this.logging.printMessage("New Window added to the Tiling Manager.");
            // Determine the Desktop on which the currently added Window has been added
            // Get all relevant Windows on the Desktop
            // Define the new position of the windows and set the new geometry
            // First one in the list is always the Root Window, the others follow in the order
        };
        return TilingManager;
    }());
    exports.TilingManager = TilingManager;
});
define("script/index", ["require", "exports", "script/tiling/tilingmanager", "script/tiling/log"], function (require, exports, tilingmanager_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var kwinRoot = this;
    var kwinLog = new log_1.default(kwinRoot);
    var tilingManager = new tilingmanager_1.TilingManager(kwinLog);
    //@ts-ignore
    var kwinWorkspace = kwinRoot.workspace;
    kwinWorkspace.windowAdded.connect(tilingManager.registerWindow);
});
/**
 * Exports the way to access the Configuration for the Project
 *
 */ 
