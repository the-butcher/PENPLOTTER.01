import { IRange } from "./IRange";


export class ObjectUtil {

    static NUMBER_OPTIONS_DEFAULT: Intl.NumberFormatOptions = {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    };

    /**
     * create a unique 6-digit id
     * @returns
     */
    static createId(): string {
        return Math.round(Math.random() * 100000000000).toString(16).substring(0, 16);
    }

    static mapValues(valI: number, srcRange: IRange, dstRange: IRange): number {
        // return Math.max(dstRange.min, Math.min(dstRange.max, dstRange.min + (valI - srcRange.min) * (dstRange.max - dstRange.min) / (srcRange.max - srcRange.min)));
        return dstRange.min + (valI - srcRange.min) * (dstRange.max - dstRange.min) / (srcRange.max - srcRange.min);
    }

}