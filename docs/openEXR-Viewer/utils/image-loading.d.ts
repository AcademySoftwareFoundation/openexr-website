export declare type Image = LdrImage | HdrImage;
export interface HdrImage {
    type: 'HdrImage';
    url: string;
    width: number;
    height: number;
    nChannels: number;
    data: Float32Array;
}
export interface LdrImage {
    type: 'LdrImage';
    url: string;
    width: number;
    height: number;
    nChannels: number;
    data: HTMLImageElement;
}
export declare function loadImage(url: string): Promise<Image>;
export declare function loadExr(url: string): Promise<HdrImage>;
export declare function loadLdr(url: string): Promise<LdrImage>;
/**
 * Extract a pixel's color
 * Caches data for LDR images
 * @param image image
 * @param x pixel's x coordinate
 * @param y pixel's y coordinate
 * @param c color channel (r=0, g=1, b=2)
 */
export declare function getPixelColor(image: Image, x: number, y: number, c: number): any;
export declare class ImageCache {
    private images;
    private downloading;
    contains(url: string): boolean;
    currentlyDownloading(url: string): boolean;
    size(): number;
    get(url: string): Promise<Image>;
    private store;
    private load;
}
