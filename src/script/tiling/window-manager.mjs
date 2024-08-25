export class Windowz {
    constructor(id, kwinWindow, desktop) {
        this.id = id; // KWin Window  - internalId
        this.kwinWindow = kwinWindow; // KWin Window
        this.kwinDesktop = desktop; // KWin Desktop
        this.isFloating = false;
        this.isMaximized = false;
        this.isMoved = null;
        this.isResized = null;
        this.isTiled = null;
        this.position = { x: 0, y: 0, width: 0, height: 0 };
    }
}

export class WindowzContainer {
    constructor() {
        /** @type {Windowz[]} */
        this.registeredWindows = [];
    }

    /**
     * Returns the Windowz object of the registered windows based on the iD
     * @param {*} id
     * @returns {Windowz}
     */
    getRegisteredWindowById(id) {
        return this.registeredWindows.find((element) => element.id === id);
    }

    /**
     * Returns the Index of the registered windows based on the iD
     * @param {*} id
     * @returns {number}
     */
    getRegisteredWindowIndexById(id) {
        return this.registeredWindows.findIndex((element) => element.id === id);
    }

    removeWindowFromRegisteredList(id) {
        const index = this.getRegisteredWindowIndexById(id);

        if (index !== -1) {
            this.registeredWindows.splice(index, 1);
            return true; // If it was removed, return true
        } else return false; // If the window was not in the list, return false
    }
}
