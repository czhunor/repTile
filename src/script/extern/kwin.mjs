import { Configuration } from "../tiling/configuration.mjs";

// Define Wrapper Classes for the External APIs
// In case something changes in the official Plasma/KWin APIs,
// we have to adapt only this section of the code. The main logic can remain unchanged if there are
// no breaking changes.

export const MaximizeMode = { Maximized: 3, Normal: 0 };

export const maxWindowSize = 2147483647;

/**
 * Wrapper for the print Function (like console.log())
 * In order to see the result of the Log, you have to follow the steps, described on the offical KDE site:
 *      https://develop.kde.org/docs/plasma/kwin/#output
 *      journalctl -f QT_CATEGORY=js QT_CATEGORY=kwin_scripting
 */
export class KWinLog {
    /**
     * @param {Configuration} knwinConfiguration
     */
    constructor(knwinConfiguration) {
        this.globalConfiguration = knwinConfiguration;
    }

    /**
     *
     * @param {string} sMessage
     */
    printMessage(sMessage) {
        if (this.globalConfiguration.isLoggingEnabled) {
            print("repTile: " + sMessage);
        }
    }
}

/**
 * Wrapper for the relevant KWin APIs
 */
export class KWinWrapper {
    // --- WORKSPACE API
    getActiveScreen() {
        return workspace.activeScreen;
    }

    getActiveScreenWidth() {
        return workspace.clientArea(
            KWin.PlacementArea,
            workspace.activeScreen,
            workspace.currentDesktop
        ).width;
    }

    getActiveScreenHeight() {
        return workspace.clientArea(
            KWin.PlacementArea,
            workspace.activeScreen,
            workspace.currentDesktop
        ).height;
    }

    getActiveScreenXPos() {
        return workspace.clientArea(
            KWin.PlacementArea,
            workspace.activeScreen,
            workspace.currentDesktop
        ).x;
    }

    getActiveScreenYPos() {
        return workspace.clientArea(
            KWin.PlacementArea,
            workspace.activeScreen,
            workspace.currentDesktop
        ).y;
    }

    getCurrentDesktop() {
        return workspace.currentDesktop;
    }

    // --- WINDOW API
    setWindowPosition(kwinWindow, x, y, width, height) {
        kwinWindow.frameGeometry = {
            x: x,
            y: y,
            width: width,
            height: height,
        };
    }

    /**
     *
     * @param {*} kwinWindow
     * @returns {*} An Object with the following parameters: x, y, width ,height
     */
    getWindowPosition(kwinWindow) {
        return kwinWindow.frameGeometry;
    }

    getWindowDesktop(kwinWindow) {
        // If the Window is on all desktops, the list is empty
        return kwinWindow.desktops[0];
    }

    getWindowResourceName(kwinWindow) {
        return kwinWindow.resourceName;
    }

    getWindowInternalId(kwinWindow) {
        return kwinWindow.internalId;
    }

    getWindowMove(kwinWindow) {
        return kwinWindow.move;
    }

    getWindowResize(kwinWindow) {
        return kwinWindow.resize;
    }

    /**
     * Since there are a lot of attributes and they are only used in one place
     */
    isWindowRelevantForRegister(kwinWindow) {
        // Check if the Window is not relevant based on his basic properties
        if (kwinWindow.dialog) return false;
        if (kwinWindow.splash) return false;
        if (kwinWindow.utility) return false;
        if (kwinWindow.dropdownMenu) return false;
        if (kwinWindow.tooltip) return false;
        if (kwinWindow.notification) return false;
        if (kwinWindow.criticalNotification) return false;
        if (kwinWindow.appletPopup) return false;
        if (kwinWindow.onScreenDisplay) return false;
        if (kwinWindow.comboBox) return false;
        if (kwinWindow.dndIcon) return false;
        if (kwinWindow.specialWindow) return false;
        if (kwinWindow.popupWindow) return false;
        if (kwinWindow.desktopWindow) return false;
        if (kwinWindow.toolbar) return false;
        if (kwinWindow.menu) return false;

        // If a Windows maxSize is defined and lower then the default max Int
        // will be considered as a pop up and will be ignored
        /* if (
            kwinWindow.maxSize.width != maxWindowSize ||
            kwinWindow.maxSize.height != maxWindowSize
        )
            return false; */

        return true;
    }

    /**
     * Since there are a lot of attributes and they are only used in one place
     */
    isWindowRelevantForTiling(kwinWindow) {
        // Check if the Window is not relevant based on his basic properties
        if (kwinWindow.fullScreen) return false;
        if (kwinWindow.minimized) return false;
        if (!kwinWindow.normalWindow) return false;

        return true;
    }
}
