// tiling.js

// Define Wrapper Classes for the External APIs
// In case something changes in the official Plasma/KWin APIs,
// we have to adapt only this section of the code. The main logic can remain unchanged if there are
// no breaking changes.

/**
 * Wrapper for the print Function (like console.log())
 * In order to see the result of the Log, you have to follow the steps, described on the offical KDE site:
 *      https://develop.kde.org/docs/plasma/kwin/#output
 *
 */
class KWinLog {
    printMessage(sMessage) {
        print(sMessage);
    }
}

/**
 * Wrapper for the relevant KWin APIs
 */
class KWinWrapper {
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

    setWindowPosition(window, x, y, width, height) {
        window.frameGeometry = {
            x: x,
            y: y,
            width: width,
            height: height,
        };
    }

    getWindowDesktop(window) {
        // If the Window is on all desktops, the list is empty
        return window.desktops[0];
    }
}

/**
 * The Main Actor in the Script, the Tiling Manager
 * It has all the relevant methods, hooks, which are needed for tiling.
 * It uses the KWin Wrapper, KWin Log, etc. to fulfill all the tasks
 */

class TilingManager {
    /**
     *
     * @param {KWinLog} kwinLog
     * @param {KWinWrapper} kwinWrapper
     */
    constructor(kwinLog, kwinWrapper) {
        this.registeredWindows = [];
        this.logging = kwinLog;
        this.kwinWrapper = kwinWrapper;
        this.layout = new Layout(kwinLog, kwinWrapper);
    }

    registerWindow(window) {
        this.logging.printMessage("New Window registration started...");

        // Check if the Window is relevant for us
        if (this.isWindowRelevant(window)) {
            // Add the Window to the list
            this.registeredWindows.push(window);
            this.logging.printMessage(
                "New Window added to the Tiling Manager."
            );
            this.logging.printMessage(
                "Already registered Windows" + this.registeredWindows
            );

            this.tileWindowsOnDesktop(
                this.kwinWrapper.getWindowDesktop(window)
            );
        }
    }

    removeWindow(window) {
        const index = this.registeredWindows.indexOf(window);

        if (index > -1) {
            this.registeredWindows.splice(index, 1);
        }

        this.tileWindowsOnDesktop(this.kwinWrapper.getWindowDesktop(window));
    }

    isWindowRelevant(window) {
        // Check wheter the Window is in the List defined in the Configuration to be skipped
        const ignoreList = ["krunner", "yakuake", "spectacle", "plasmashell"];
        if (ignoreList.indexOf(window.resourceName) !== -1) return false;

        // Check if the Window is not relevant based on his basic properties
        if (window.fullScreen) return false;
        if (window.minimized) return false;
        if (window.popupWindow) return false;
        if (!window.normalWindow) return false;

        // #TODO if a Window is set to floated. Not supported yet!

        return true;
    }

    tileWindowsOnDesktop(desktop) {
        this.logging.printMessage("Tiling executed on Desktop: " + desktop);

        // Get all relevant Windows on the Desktop
        let windowsForDesktop = this.getWindowsForDesktop(desktop);
        this.logging.printMessage(
            "-> windows found there: " + windowsForDesktop
        );

        // Call the Layout Manager to tile the Desktop
        this.layout.tileWindowsOnDesktop(desktop, windowsForDesktop);
    }

    getWindowsForDesktop(desktop) {
        let windowsForDesktop = [];

        this.registeredWindows.forEach((window) => {
            if (this.kwinWrapper.getWindowDesktop(window) === desktop) {
                windowsForDesktop.push(window);
            }
        });
        return windowsForDesktop;
    }
}

class Layout {
    /**
     *
     * @param {KWinLog} kwinLog
     * @param {KWinWrapper} kwinWrapper
     */
    constructor(kwinLog, kwinWrapper) {
        this.logging = kwinLog;
        this.kwinWrapper = kwinWrapper;
    }

    tileWindowsOnDesktop(desktop, windows) {
        // Padding around the Windows in Pixel,
        // it will be considered during the calculation of the Window sizes
        const padding = 10;

        // Define the new position of the windows and set the new geometry
        // First one in the list is always the Root Window, the others follow in the order

        // -> if no windows on desktop, nothing to do
        if (windows === undefined || windows.length === 0) {
            return;
        }

        // -> only one window is found, set the maximum size possible
        if (windows.length === 1) {
            const windowXPos = this.kwinWrapper.getActiveScreenXPos() + padding;
            const windowYPos = this.kwinWrapper.getActiveScreenYPos() + padding;
            const windowWidth =
                this.kwinWrapper.getActiveScreenWidth() - padding * 2;
            const windowHeight =
                this.kwinWrapper.getActiveScreenHeight() - padding * 2;

            this.kwinWrapper.setWindowPosition(
                windows[0],
                windowXPos,
                windowYPos,
                windowWidth,
                windowHeight
            );
            this.logging.printMessage(
                "-> set Window to Fullscreen " + windows[0]
            );
        }

        // -> if there are more windows
        if (windows.length > 1) {
            const rootWindowDefaultSizeInPercentage = 0.65;
            const nrOfSecondaryWindwos = windows.length - 1;

            const screenXPos = this.kwinWrapper.getActiveScreenXPos();
            const screenYPos = this.kwinWrapper.getActiveScreenYPos();
            const screenWidth = this.kwinWrapper.getActiveScreenWidth();
            const screenHeight = this.kwinWrapper.getActiveScreenHeight();

            // Determine Root and Secondary Window sizes
            const rootWindowWidth =
                screenWidth * rootWindowDefaultSizeInPercentage;
            const rootWindowHeight = screenHeight - padding * 2;

            const secondaryWindowWidth =
                screenWidth - rootWindowWidth - padding * 3;
            // e.g. 1000PX screen height with 10PX padding 3 Windows
            // secondaryWindowHeight = (1000 - 10 * (3+1)) / 3 = 320
            const secondaryWindowHeight =
                (screenHeight - padding * (nrOfSecondaryWindwos + 1)) /
                nrOfSecondaryWindwos;

            // Set some initial values
            let windowXPos = screenXPos;
            let windowYPos = screenYPos;
            let windowWidth = screenWidth;
            let windowHeight = screenHeight;

            for (let i = 0; i < windows.length; i++) {
                // Root Window is always the first one
                if (i === 0) {
                    windowWidth = rootWindowWidth;
                    windowHeight = rootWindowHeight;
                    windowXPos = screenWidth - windowWidth - padding;
                    windowYPos = screenYPos + padding;

                    this.logging.printMessage(
                        "-> set Root Window position " + windows[i]
                    );
                } else {
                    windowWidth = secondaryWindowWidth;
                    windowHeight = secondaryWindowHeight;
                    windowXPos = screenXPos + padding;
                    windowYPos =
                        screenYPos +
                        padding +
                        (i - 1) * secondaryWindowHeight +
                        (i - 1) * padding;

                    this.logging.printMessage(
                        "-> set Secondary Window position " + windows[i]
                    );
                }

                this.kwinWrapper.setWindowPosition(
                    windows[i],
                    windowXPos,
                    windowYPos,
                    windowWidth,
                    windowHeight
                );
            }
        }
    }
}

////////////////////////////////////////
// Initialization and execution

// Initialize Wrapper Classes
const kwinLog = new KWinLog();
const kwinWrapper = new KWinWrapper();

// Tiling Manager
const tilingManager = new TilingManager(kwinLog, kwinWrapper);

var clients = workspace.stackingOrder;
for (var i = 0; i < clients.length; i++) {
    tilingManager.registerWindow(clients[i]);
}

workspace.windowAdded.connect(function (client) {
    tilingManager.registerWindow(client);
});

workspace.windowRemoved.connect(function (client) {
    tilingManager.removeWindow(client);
});
