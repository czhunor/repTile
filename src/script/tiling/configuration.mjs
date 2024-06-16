export const Position = { Left: "left", Right: "right" };

export class Configuration {
    constructor() {
        // The size of th Root Window defined in percentage
        this.rootWindowDefaultSizeInPercentage = 0.65;
        // The position of the Root Window
        this.rootWindowPosition = Position.Right;
        // The gap between the Windows and Window and Border of the Screen
        this.padding = 10;
        // List of Windows which will be ignored during the execution of the TilingManager
        this.ignoreList = [
            "krunner",
            "yakuake",
            "spectacle",
            "plasmashell",
            "", // Needed for dummy windows
        ];
        // List of Windows which should be placed as Root Window when they are Opened the first time
        this.registerAsRoot = ["vscodium"];
        // Tiling toggle for all Windows on all Screens/Desktops
        this.isTilingEnabled = true;
        // Logging toggle for 'journalctl -f QT_CATEGORY=js QT_CATEGORY=kwin_scripting'
        this.isLoggingEnabled = true;
    }
}
