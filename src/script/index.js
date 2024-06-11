// Define Wrapper Classes for the External APIs
// In case something changes in the official Plasma/KWin APIs,
// we have to adapt only this section of the code. The main logic can remain unchanged if there are
// no breaking changes.

const MaximizeMode = { Maximized: 3, Normal: 0 };

/**
 * Wrapper for the print Function (like console.log())
 * In order to see the result of the Log, you have to follow the steps, described on the offical KDE site:
 *      https://develop.kde.org/docs/plasma/kwin/#output
 *
 */
class KWinLog {
    /**
     * @param {Configuration} knwinConfiguration
     */
    constructor(knwinConfiguration) {
        this.globalConfiguration = knwinConfiguration;
    }
    printMessage(sMessage) {
        if (this.globalConfiguration.isLoggingEnabled) {
            print("[ repTile ] - " + sMessage);
        }
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

    setWindowPosition(kwinWindow, x, y, width, height) {
        kwinWindow.frameGeometry = {
            x: x,
            y: y,
            width: width,
            height: height,
        };
    }

    getWindowPosition(kwinWindow) {
        return kwinWindow.frameGeometry;
    }

    getWindowDesktop(kwinWindow) {
        // If the Window is on all desktops, the list is empty
        return kwinWindow.desktops[0];
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
     * @param {Configuration} knwinConfiguration
     */
    constructor(kwinLog, kwinWrapper, knwinConfiguration) {
        /** @type {Windowz[]} */
        this.registeredWindows = [];
        this.logging = kwinLog;
        this.kwinWrapper = kwinWrapper;
        this.globalConfiguration = knwinConfiguration;
        this.layout = new Layout(kwinLog, kwinWrapper, knwinConfiguration);
    }

    /**
     * HOOK Method
     *
     * If a new Window is opened, this method is called from the corresponding hook
     * @param {*} kwinWindow
     */
    registerWindow(kwinWindow) {
        this.logging.printMessage(
            "New Window registration started for: " + kwinWindow.resourceName
        );

        // Check if the Window is relevant for us
        if (this._isWindowRelevant(kwinWindow)) {
            // Add the Window to the list
            let addedWindow = new Windowz(kwinWindow.internalId, kwinWindow);
            this.registeredWindows.push(addedWindow);

            this.logging.printMessage(
                "New Window added to the Tiling Manager: " +
                    kwinWindow.resourceName
            );
            this.logging.printMessage(
                "Already registered Windows: " + this.registeredWindows
            );

            // Execute Tiling on the desktop where the Window was opened
            this._tileWindowsOnDesktop(
                this.kwinWrapper.getWindowDesktop(kwinWindow)
            );
        }
    }

    /**
     * HOOK Method
     *
     * @param {*} kwinWindow
     */
    removeWindow(kwinWindow) {
        this.logging.printMessage(
            "Window has been removed: " + kwinWindow.resourceName
        );

        const index = this.registeredWindows.findIndex(
            (element) => element.id === kwinWindow.internalId
        );

        if (index !== -1) {
            this.registeredWindows.splice(index, 1);

            this._tileWindowsOnDesktop(
                this.kwinWrapper.getWindowDesktop(kwinWindow)
            );
        }
    }

    /**
     * HOOK Method
     *
     * @param {*} kwinWindow
     */
    minimizedChangedForWindow(kwinWindow) {
        this.logging.printMessage(
            "Window minimized state changed: " + kwinWindow.resourceName
        );
        // execute Tiling for the Desktop, where the Window minimized state changed
        this._tileWindowsOnDesktop(
            this.kwinWrapper.getWindowDesktop(kwinWindow)
        );
    }

    /**
     * HOOK Method
     *
     * @param {*} kwinWindow
     * @param {*} maximizeMode
     */
    maximizedChangedForWindow(kwinWindow, maximizeMode) {
        this.logging.printMessage(
            "Window maximized state changed: " +
                kwinWindow.resourceName +
                ". MaximizedMode: " +
                maximizeMode
        );

        // Set maximized property for the maximized Window
        let maximizedWindow = this.registeredWindows.find(
            (element) => element.id === kwinWindow.internalId // TODO - move Internal ID to the Wrapper
        );
        if (maximizedWindow) {
            // Assuming that the window was not maximized before :-)
            maximizedWindow.isMaximized =
                maximizeMode == MaximizeMode.Maximized ? true : false;

            // If exit maximize, execute Tiling again, otherwise the screen is completly covered by the maximized window
            if (!maximizedWindow.isMaximized) {
                // execute Tiling for the Desktop, where the Window minimized state changed
                this._tileWindowsOnDesktop(
                    this.kwinWrapper.getWindowDesktop(kwinWindow)
                );
            }
        }
    }

    moveResizedChangedForWindow(kwinWindow) {
        let movedOrResizedWindow = this.registeredWindows.find(
            (element) => element.id === kwinWindow.internalId
        );

        if (
            movedOrResizedWindow &&
            movedOrResizedWindow.isMoved === null &&
            movedOrResizedWindow.isResized === null
        ) {
            // TODO - move move and resize to the Wrapper

            movedOrResizedWindow.isMoved = kwinWindow.move;
            this.logging.printMessage(
                "-> moving: " + movedOrResizedWindow.isMoved
            );
            movedOrResizedWindow.isResized = kwinWindow.resize;
            this.logging.printMessage(
                "-> resizing: " + movedOrResizedWindow.isResized
            );
        }
    }

    interactiveMoveResizeFinishedForWindow(kwinWindow) {
        let movedOrResizedWindow = this.registeredWindows.find(
            (element) => element.id === kwinWindow.internalId
        );
        if (movedOrResizedWindow) {
            // TODO - move move and resize to the Wrapper
            this.logging.printMessage(
                "Window move/resize finished (moved: " +
                    movedOrResizedWindow.isMoved +
                    " resized: " +
                    movedOrResizedWindow.isResized
            );

            // RESIZING
            // -> If resized, tile the windows back to the defined layout
            if (movedOrResizedWindow.isResized) {
                this._tileWindowsOnDesktop(
                    this.kwinWrapper.getWindowDesktop(kwinWindow)
                );
            }

            // MOVING
            // -> Have to check if there is a Window below the new position of the moved Window.
            //    If so, swap the places
            if (movedOrResizedWindow.isMoved) {
                const windowBelowTheMovedWindow =
                    this._getWindowBelowTheWindow(kwinWindow);

                this.logging.printMessage(
                    "-> below the moved window: " + windowBelowTheMovedWindow
                );

                if (windowBelowTheMovedWindow) {
                    this._swapWindowPlaces(
                        kwinWindow,
                        windowBelowTheMovedWindow
                    );

                    this._tileWindowsOnDesktop(
                        this.kwinWrapper.getWindowDesktop(kwinWindow)
                    );
                }
            }

            // Set back the default value after the Move/Resize is finished
            movedOrResizedWindow.isMoved = null;
            movedOrResizedWindow.isResized = null;
        }
    }

    /**
     * Decides if a Window should be Tiled or not
     *
     * @param {*} kwinWindow
     * @param {Windowz} customWindow
     * @returns
     */
    _isWindowRelevant(kwinWindow, customWindow = null) {
        // TODO - Move every direct access to KWin API to the wrapper,
        // since there are a lot of things, maybe put everything in the same method

        if (!this.globalConfiguration.isTilingEnabled) return false;

        // Check wheter the Window is in the List defined in the Configuration to be skipped
        const ignoreList = this.globalConfiguration.ignoreList;

        if (ignoreList.indexOf(kwinWindow.resourceName) !== -1) return false;

        // Check if the Window is not relevant based on his basic properties
        if (kwinWindow.fullScreen) return false;
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
        if (kwinWindow.minimized) return false;
        if (kwinWindow.popupWindow) return false;
        if (kwinWindow.desktopWindow) return false;
        if (kwinWindow.toolbar) return false;
        if (kwinWindow.menu) return false;

        if (!kwinWindow.normalWindow) return false;

        // Custom Window checks
        if (customWindow !== null && customWindow !== undefined) {
            if (customWindow.isMaximized) return false;
        }

        return true;
    }

    _tileWindowsOnDesktop(desktop) {
        if (desktop === undefined || desktop === null) {
            return;
        }

        this.logging.printMessage("Tiling executed on Desktop: " + desktop);

        // Get all relevant Windows on the Desktop
        let windowsForDesktop = this._getWindowsForDesktop(desktop);
        // Call the Layout Manager to tile the Desktop
        this.layout.tileWindowsOnDesktop(desktop, windowsForDesktop);
    }

    _getWindowsForDesktop(desktop) {
        let windowsForDesktop = [];

        this.registeredWindows.forEach((customWindow) => {
            if (
                this.kwinWrapper.getWindowDesktop(customWindow.kwinWindow) ===
                desktop
            ) {
                // Only add the window to the results if it is still in a relevan state
                // e.g. if change on the minimized, fullscreen, set to floating happens
                if (
                    this._isWindowRelevant(
                        customWindow.kwinWindow,
                        customWindow
                    )
                ) {
                    windowsForDesktop.push(customWindow.kwinWindow);
                }
            }
        });

        this.logging.printMessage(
            "-> windows found there: " + windowsForDesktop
        );
        return windowsForDesktop;
    }

    _getWindowBelowTheWindow(movedWindow) {
        let windowBelowTheMovedWindow = undefined;
        const movedWindowPosition =
            this.kwinWrapper.getWindowPosition(movedWindow);

        this.logging.printMessage(
            "-> moved windows new position: " + movedWindowPosition
        );

        // determine the mid point of the moved Window
        const midPointX = movedWindowPosition.x + movedWindowPosition.width / 2;
        const midPointY =
            movedWindowPosition.y + movedWindowPosition.height / 2;

        // Check which Window is below the mid point
        // get all Windows for the Desktop
        const windowsForDesktop = this._getWindowsForDesktop(
            this.kwinWrapper.getWindowDesktop(movedWindow)
        );
        // remove the moved Window from the list, since we dont want to swap with the same one
        windowsForDesktop.splice(windowsForDesktop.indexOf(movedWindow), 1);

        if (windowsForDesktop.length > 0) {
            windowsForDesktop.forEach((windowForDesktop) => {
                const windowForDesktopPosition =
                    this.kwinWrapper.getWindowPosition(windowForDesktop);

                if (
                    // mid point X is between the Windows X and X + Width
                    midPointX >= windowForDesktopPosition.x &&
                    midPointX <=
                        windowForDesktopPosition.x +
                            windowForDesktopPosition.width &&
                    // mid point Y is between the Windows Y and Y + Height
                    midPointY >= windowForDesktopPosition.y &&
                    midPointY <=
                        windowForDesktopPosition.y +
                            windowForDesktopPosition.height
                ) {
                    // The mid point is on top of the Window
                    windowBelowTheMovedWindow = windowForDesktop;
                }
            });
        }

        return windowBelowTheMovedWindow;
    }

    _swapWindowPlaces(windowOne, windowTwo) {
        // Find the indexes of the Windows to be swapped
        const indexWindowOne = this.registeredWindows.findIndex(
            (element) => element.id === windowOne.internalId
        );
        const indexWindowTwo = this.registeredWindows.findIndex(
            (element) => element.id === windowTwo.internalId
        );
        this.logging.printMessage(
            "-> Swapping Windows: " + windowOne + ", " + windowTwo
        );
        this.logging.printMessage("-> index WindowOne: " + indexWindowOne);
        this.logging.printMessage("-> index WindowTwo: " + indexWindowTwo);

        // Swap places
        const tempWindowOne = this.registeredWindows[indexWindowOne];

        this.registeredWindows[indexWindowOne] =
            this.registeredWindows[indexWindowTwo];
        this.registeredWindows[indexWindowTwo] = tempWindowOne;

        this.logging.printMessage(
            "-> registered Windows after Swapping: " + this.registeredWindows
        );
    }
}

class Layout {
    /**
     *
     * @param {KWinLog} kwinLog
     * @param {KWinWrapper} kwinWrapper
     * @param {Configuration} knwinConfiguration
     */
    constructor(kwinLog, kwinWrapper, knwinConfiguration) {
        this.logging = kwinLog;
        this.kwinWrapper = kwinWrapper;
        this.globalConfiguration = knwinConfiguration;
    }

    tileWindowsOnDesktop(desktop, kwinWindows) {
        // Padding around the Windows in Pixel,
        // it will be considered during the calculation of the Window sizes
        const padding = this.globalConfiguration.padding;
        const rootWindowDefaultSizeInPercentage =
            this.globalConfiguration.rootWindowDefaultSizeInPercentage;

        const screenXPos = this.kwinWrapper.getActiveScreenXPos() + padding;
        const screenYPos = this.kwinWrapper.getActiveScreenYPos() + padding;
        const screenWidth =
            this.kwinWrapper.getActiveScreenWidth() - padding * 2;
        const screenHeight =
            this.kwinWrapper.getActiveScreenHeight() - padding * 2;

        // Define the new position of the windows and set the new geometry
        // First one in the list is always the Root Window, the others follow in the order

        // -> if no windows on desktop, nothing to do
        if (kwinWindows === undefined || kwinWindows.length === 0) {
            return;
        }

        // -> only one kwinWindow is found, set the maximum size possible
        if (kwinWindows.length === 1) {
            const windowXPos = screenXPos;
            const windowYPos = screenYPos;
            const windowWidth = screenWidth;
            const windowHeight = screenHeight;

            this.kwinWrapper.setWindowPosition(
                kwinWindows[0],
                windowXPos,
                windowYPos,
                windowWidth,
                windowHeight
            );
            this.logging.printMessage(
                "-> set Window to Fullscreen " + kwinWindows[0].resourceName
            );
        }

        // -> if there are more windows
        if (kwinWindows.length > 1) {
            const nrOfSecondaryWindwos = kwinWindows.length - 1;

            // Determine Root and Secondary Window sizes
            const rootWindowWidth =
                screenWidth * rootWindowDefaultSizeInPercentage;
            const rootWindowHeight = screenHeight;

            const secondaryWindowWidth =
                screenWidth - rootWindowWidth - padding;
            const secondaryWindowHeight =
                (screenHeight - padding * (nrOfSecondaryWindwos - 1)) /
                nrOfSecondaryWindwos;

            // Set some initial values
            let windowXPos = 0;
            let windowYPos = 0;
            let windowWidth = 0;
            let windowHeight = 0;

            for (let i = 0; i < kwinWindows.length; i++) {
                // Root Window is always the first one
                if (i === 0) {
                    windowWidth = rootWindowWidth;
                    windowHeight = rootWindowHeight;
                    windowXPos =
                        this.globalConfiguration.rootWindowPosition ===
                        Position.Right
                            ? screenWidth - windowWidth + padding
                            : screenXPos;
                    windowYPos = screenYPos;

                    this.logging.printMessage(
                        "-> set Root Window position " +
                            kwinWindows[i].resourceName
                    );
                } else {
                    windowWidth = secondaryWindowWidth;
                    windowHeight = secondaryWindowHeight;
                    windowXPos =
                        this.globalConfiguration.rootWindowPosition ===
                        Position.Right
                            ? screenXPos
                            : screenXPos; // TODO has to be defined
                    windowYPos =
                        screenYPos +
                        (i - 1) * secondaryWindowHeight +
                        (i - 1) * padding;

                    this.logging.printMessage(
                        "-> set Secondary Window position " +
                            kwinWindows[i].resourceName
                    );
                }

                this.kwinWrapper.setWindowPosition(
                    kwinWindows[i],
                    windowXPos,
                    windowYPos,
                    windowWidth,
                    windowHeight
                );
            }
        }
    }
}

class Windowz {
    constructor(id, kwinWindow) {
        this.id = id; // KWin Window  - internalId
        this.kwinWindow = kwinWindow; // KWin Window
        this.isFloating = false;
        this.isMaximized = false;
        this.isMoved = null;
        this.isResized = null;
    }
}

const Position = { Left: "left", Right: "right" };

class Configuration {
    constructor() {
        this.rootWindowDefaultSizeInPercentage = 0.65;
        this.rootWindowPosition = Position.Right;
        this.padding = 10;
        this.ignoreList = [
            "krunner",
            "yakuake",
            "spectacle",
            "plasmashell",
            "", // Needed for dummy windows
        ];
        this.isTilingEnabled = true;
        this.isLoggingEnabled = true;
    }
}

//---------------------------------------------------------------------------//
//                      Initialization and execution                         //

// Initialize Wrapper Classes
const knwinConfiguration = new Configuration();
const kwinWrapper = new KWinWrapper();
const kwinLog = new KWinLog(knwinConfiguration);

// Tiling Manager
const tilingManager = new TilingManager(
    kwinLog,
    kwinWrapper,
    knwinConfiguration
);

// Initial execution of the script, register every already opened Window and register
// the Hook methods also, otherwise it will be necesarry to close the apps and restart them to work properly.
let windows = workspace.stackingOrder;
for (let i = 0; i < windows.length; i++) {
    // Register the Hooks
    // -> In case the Window is minimized, we have to react
    windows[i].minimizedChanged.connect(() => {
        tilingManager.minimizedChangedForWindow(windows[i]);
    });

    // -> In case the Window is minimized, we have to react
    windows[i].maximizedAboutToChange.connect((maximizeMode) => {
        tilingManager.maximizedChangedForWindow(windows[i], maximizeMode);
    });

    // -> When the Window is moved or resized, we will store the state of the action for later
    windows[i].moveResizedChanged.connect(() => {
        tilingManager.moveResizedChangedForWindow(windows[i]);
    });

    windows[i].interactiveMoveResizeFinished.connect(() => {
        tilingManager.interactiveMoveResizeFinishedForWindow(windows[i]);
    });

    // Execute Tiling the first time
    tilingManager.registerWindow(windows[i]);
}

//---------------------------------------------------------------------------//
//                      Register Hooks                                       //

workspace.windowAdded.connect((window) => {
    // In case the Window is minimized, we have to react
    window.minimizedChanged.connect(() => {
        tilingManager.minimizedChangedForWindow(window);
    });

    // In case the Window is minimized, we have to react
    window.maximizedAboutToChange.connect((maximizeMode) => {
        tilingManager.maximizedChangedForWindow(window, maximizeMode);
    });

    // When the Window is moved or resized, we will store the state of the action for later
    window.moveResizedChanged.connect(() => {
        tilingManager.moveResizedChangedForWindow(window);
    });

    window.interactiveMoveResizeFinished.connect(() => {
        tilingManager.interactiveMoveResizeFinishedForWindow(window);
    });

    // Attach the Tiling manager for Windows Added
    tilingManager.registerWindow(window);
});

workspace.windowRemoved.connect((window) => {
    // Attach the Tiling manager for Windows Removed
    tilingManager.removeWindow(window);
});
