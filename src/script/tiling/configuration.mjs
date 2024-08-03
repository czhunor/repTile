export const Position = { Left: "left", Right: "right" };

export class Configuration {
    constructor() {
        /**
         * The size of th Root Window defined in percentage
         *
         * @returns  {number}
         */
        this.rootWindowDefaultSizeInPercentage = () => {
            return this._readConfig("RootWindowSize", 0.65);
        };

        /**
         * The position of the Root Window
         *
         * @returns {string}
         */
        this.rootWindowPosition = () => {
            return this._readConfig("RootWindowPosition", 0) == 0
                ? Position.Right
                : Position.Left;
        };

        /**
         * The gap between the Windows and Window and Border of the Screen
         *
         * @returns {number}
         */
        this.padding = () => {
            return this._readConfig("BorderSize", 10);
        };

        /**
         * List of Windows which will be ignored during the execution of the TilingManager
         *
         * @returns {Array}
         */
        this.ignoreList = () => {
            return this._readIgnoreList();
        };

        /**
         * List of Windows which should be placed as Root Window when they are Opened the first time
         *
         * @returns {Array}
         */
        this.registerAsRoot = () => {
            return this._readRegisterAsRoot();
        };

        /**
         * Tiling toggle for all Windows on all Screens/Desktops
         *
         * @returns {boolean}
         */
        this.isTilingEnabled = () => {
            return true;
        };

        /**
         * Logging toggle for 'journalctl -f QT_CATEGORY=js QT_CATEGORY=kwin_scripting'
         *
         * @returns {boolean}
         */
        this.isLoggingEnabled = () => {
            return this._readConfig("IsLoggingEnabled", true);
        };
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
