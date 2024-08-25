import TilingManager from "./tiling-manager.mjs";

export default class Hooks {
    /**
     *
     * @param {TilingManager} tilingManager
     */
    constructor(tilingManager) {
        /** @type {TilingManager} */
        this.tilingManager = tilingManager;
    }

    connect() {
        this._connectToAlreadyRunningWindows();
        this._connectToNewWindows();
    }

    _connectToAlreadyRunningWindows() {
        // Initial execution of the script, register every already opened Window and register
        // the Hook methods also, otherwise it will be necesarry to close the apps and restart them to work properly.
        let windows = workspace.stackingOrder;
        for (let i = 0; i < windows.length; i++) {
            this._connectToWindowAdded(windows[i]);
        }
    }

    _connectToNewWindows() {
        workspace.windowAdded.connect((window) => {
            this._connectToWindowAdded(window);
        });

        workspace.windowRemoved.connect((window) => {
            // Attach the Tiling manager for Windows Removed
            this.tilingManager.removeWindow(window);
        });
    }

    _connectToWindowAdded(window) {
        // Only register relevant Windows
        if (this.tilingManager.isWindowRelevantForRegister(window)) {
            // Setting of some properties of the Windows in order to bahave normally within the
            // tiling process
            // Before we do anything, set the Maximized State to Maximize Restored
            window.setMaximize(false, false);

            // In case the Window is minimized, we have to react
            window.minimizedChanged.connect(() => {
                this.tilingManager.minimizedChangedForWindow(window);
            });

            // In case the Window is minimized, we have to react
            window.maximizedAboutToChange.connect((maximizeMode) => {
                this.tilingManager.maximizedChangedForWindow(
                    window,
                    maximizeMode
                );
            });

            // When the Window is moved or resized, we will store the state of the action for later
            window.moveResizedChanged.connect(() => {
                this.tilingManager.moveResizedChangedForWindow(window);
            });

            window.interactiveMoveResizeFinished.connect(() => {
                this.tilingManager.interactiveMoveResizeFinishedForWindow(
                    window
                );
            });

            // Window was moved to another Desktop
            window.desktopsChanged.connect(() => {
                this.tilingManager.desktopChangedForWindow(window);
            });

            window.frameGeometryChanged.connect((oldGeometry) => {
                this.tilingManager.frameGeometryChangedForWindow(window);
            });

            // Attach the Tiling manager for Windows Added
            this.tilingManager.registerWindow(window);
        }
    }
}
