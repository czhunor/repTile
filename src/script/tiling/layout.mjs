import { KWinLog, KWinWrapper } from "../extern/kwin.mjs";
import { Configuration, Position } from "./configuration.mjs";

export default class BaseLayout {
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
        // -> if no windows on desktop, nothing to do
        if (kwinWindows === undefined || kwinWindows.length === 0) {
            return;
        }

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
                "-> set Window to Fullscreen " +
                    this.kwinWrapper.getWindowResourceName(kwinWindows[0])
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
                            ? screenXPos + secondaryWindowWidth + padding
                            : screenXPos;
                    windowYPos = screenYPos;

                    this.logging.printMessage(
                        "-> set Root Window position " +
                            this.kwinWrapper.getWindowResourceName(
                                kwinWindows[i]
                            )
                    );
                } else {
                    windowWidth = secondaryWindowWidth;
                    windowHeight = secondaryWindowHeight;
                    windowXPos =
                        this.globalConfiguration.rootWindowPosition ===
                        Position.Right
                            ? screenXPos
                            : screenXPos + rootWindowWidth + padding;
                    windowYPos =
                        screenYPos +
                        (i - 1) * secondaryWindowHeight +
                        (i - 1) * padding;

                    this.logging.printMessage(
                        "-> set Secondary Window position " +
                            this.kwinWrapper.getWindowResourceName(
                                kwinWindows[i]
                            )
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
