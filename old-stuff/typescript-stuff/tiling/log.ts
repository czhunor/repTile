import * as KWin from "../extern/kwin";

export default class Log {
    printMessage: (sMessage: string) => void;

    constructor(kwinRoot: KWin.Root) {
        this.printMessage = kwinRoot.print;
    }
}
