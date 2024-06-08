export interface Signal<T extends Function> {
    connect(callback: T): void;
    disconnect(callback: T): void;
}

export interface QPoint {
    x: number;
    y: number;
}

export interface QSize {
    width: number;
    height: number;
}

export interface QRect extends QPoint, QSize {
    x: number;
    y: number;
    width: number;
    height: number;
}
