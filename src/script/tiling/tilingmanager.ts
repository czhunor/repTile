/**
 * Tiling Manager Module consist of the following:
 *  - Tiling Manager
 *      keeping track of the currently opened Windows
 *  - Window
 *  - Desktop
 *  - Screen (Monitor)
 *  - Activity
 *
 */
import * as KWin from "../extern/kwin";
import Log from "./log";

export class TilingManager {
    private registeredWindows: KWin.Window[];
    private logging: Log;

    constructor(kwinLog: Log) {
        this.registeredWindows = [];
        this.logging = kwinLog;
    }

    public registerWindow(window: KWin.Window) {
        this.logging.printMessage("New Window registration started...");

        // Check if the Window is relevant for us
        if (this.isWindowRelevant(window)) {
            this.tileWindow(window);
        }
    }

    private isWindowRelevant(window: KWin.Window): boolean {
        // Check wheter the Window is in the List defined in the Configuration to be skipped

        // Check if the Window is not relevant based on his basic properties
        if (window.fullScreen) return false;
        if (window.minimized) return false;
        if (window.popupWindow) return false;
        if (!window.normalWindow) return false;

        // #TODO if a Window is set to floated. Not supported yet!

        return true;
    }

    private tileWindow(window: KWin.Window) {
        // Add the Window to the list
        this.registeredWindows.push(window);

        this.logging.printMessage("New Window added to the Tiling Manager.");

        // Determine the Desktop on which the currently added Window has been added

        // Get all relevant Windows on the Desktop

        // Define the new position of the windows and set the new geometry
        // First one in the list is always the Root Window, the others follow in the order
    }
}
