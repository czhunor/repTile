export const Position = { Left: "left", Right: "right" };

export class Configuration {
    constructor() {
        /**
         * The size of th Root Window defined in percentage
         *
         * @type  {number}
         */
        this.rootWindowDefaultSizeInPercentage = this._readConfig(
            "RootWindowSize",
            0.65
        );

        /**
         * The position of the Root Window
         *
         * @type {string}
         */
        this.rootWindowPosition =
            this._readConfig("RootWindowPosition", 0) == 0
                ? Position.Right
                : Position.Left;

        /**
         * The gap between the Windows and Window and Border of the Screen
         *
         * @type {number}
         */
        this.padding = this._readConfig("BorderSize", 10);

        /**
         * List of Windows which will be ignored during the execution of the TilingManager
         *
         * @type {Array}
         */
        this.ignoreList = this._readIgnoreList();

        /**
         * List of Windows which should be placed as Root Window when they are Opened the first time
         *
         * @type {Array}
         */
        this.registerAsRoot = this._readRegisterAsRoot();

        /**
         * Tiling toggle for all Windows on all Screens/Desktops
         *
         * @type {boolean}
         */
        this.isTilingEnabled = true;

        /**
         * Logging toggle for 'journalctl -f QT_CATEGORY=js QT_CATEGORY=kwin_scripting'
         *
         * @type {boolean}
         */
        this.isLoggingEnabled = this._readConfig("IsLoggingEnabled", true);
    }

    /**
     *
     * @returns {Array}
     */
    _readIgnoreList() {
        let ignoreList = this._readConfig(
            "IgnoreList",
            "krunner, yakuake, spectacle, plasmashell"
        )
            .toString()
            .toLowerCase()
            .split(",");

        ignoreList.forEach((element, index) => {
            ignoreList[index] = element.trim();
        });

        ignoreList.push(""); // Needed for dummy windows
        print(`repTile: readConfig - Array: ${ignoreList}`);
        return ignoreList;
    }

    /**
     *
     * @returns {Array}
     */
    _readRegisterAsRoot() {
        let registerAsRoot = this._readConfig(
            "RegisterAsRoot",
            "vscodium, codium, code, brave-browser"
        )
            .toString()
            .toLowerCase()
            .split(",");

        registerAsRoot.forEach((element, index) => {
            registerAsRoot[index] = element.trim();
        });

        print(`repTile: readConfig - Array: ${registerAsRoot}`);
        return registerAsRoot;
    }

    /**
     *
     * @param {string} configAttribute
     * @param {any} defaultValue
     * @returns
     */
    _readConfig(configAttribute, defaultValue) {
        const configuration = readConfig(configAttribute, defaultValue);
        print(
            `repTile: readConfig - Attribute:  ${configAttribute}. Value read: ${configuration}`
        );

        return configuration;
    }
}
