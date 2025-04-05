import { IRasterData } from "./IRasterData";

export class RasterUtil {

    static RAD2DEG = 180 / Math.PI;
    static DEG2RAD = Math.PI / 180;

    static getRasterValue(rasterData: IRasterData, x: number, y: number) {

        const xA = Math.floor(x);
        const xB = Math.ceil(x);
        const xF = x - xA;

        const yA = Math.floor(y);
        const yB = Math.ceil(y);
        const yF = y - yA;

        const valXAYA = rasterData.data[yA * rasterData.width + xA];
        const valXAYB = rasterData.data[yB * rasterData.width + xA];
        const valXBYA = rasterData.data[yA * rasterData.width + xB];
        const valXBYB = rasterData.data[yB * rasterData.width + xB];

        const interpolateValue = (a: number, b: number, f: number) => {
            return a + (b - a) * f;
            // const radiansA = a * this.DEG2RAD;
            // const radiansB = b * this.DEG2RAD;
            // const x = Math.cos(radiansA) * f + Math.cos(radiansB) * (1 - f);
            // const y = Math.sin(radiansA) * f + Math.sin(radiansB) * (1 - f);
            // const radiansR = Math.atan2(y, x);
            // return radiansR * this.RAD2DEG;
        }

        // between upper pixels
        const valFYA = interpolateValue(valXAYA, valXBYA, xF);
        // between lower pixels
        const valFYB = interpolateValue(valXAYB, valXBYB, xF);
        // final interpolation
        const valRes = interpolateValue(valFYA, valFYB, yF);

        return valRes;

    }

    // static getPixelIndices(rasterData: IRasterData, x: number, y: number, radius: number): number[] {

    //     const pixelIndices: number[] = [];
    //     for (let y2 = y - radius; y2 <= y + radius; y2++) {
    //         for (let x2 = x - radius; x2 <= x + radius; x2++) {
    //             pixelIndices.push(y2 * rasterData.width + x2);
    //         }
    //     }
    //     return pixelIndices;

    // }

    // static getAspectValue(aspectData: IRasterData, x: number, y: number) {

    //     const xA = Math.floor(x);
    //     const xB = Math.ceil(x);
    //     const xF = x - xA;

    //     const yA = Math.floor(y);
    //     const yB = Math.ceil(y);
    //     const yF = y - yA;

    //     const valXAYA = aspectData.data[yA * aspectData.width + xA];
    //     const valXAYB = aspectData.data[yB * aspectData.width + xA];
    //     const valXBYA = aspectData.data[yA * aspectData.width + xB];
    //     const valXBYB = aspectData.data[yB * aspectData.width + xB];

    //     const interpolateAspect = (a: number, b: number, f: number) => {
    //         const radiansA = a * this.DEG2RAD;
    //         const radiansB = b * this.DEG2RAD;
    //         const x = Math.cos(radiansA) * f + Math.cos(radiansB) * (1 - f);
    //         const y = Math.sin(radiansA) * f + Math.sin(radiansB) * (1 - f);
    //         const radiansR = Math.atan2(y, x);
    //         return radiansR * this.RAD2DEG;
    //     }

    //     // between upper pixels
    //     const valFYA = interpolateAspect(valXAYA, valXBYA, xF);
    //     const valFYB = interpolateAspect(valXAYB, valXBYB, xF);
    //     const valRes = interpolateAspect(valFYA, valFYB, yF);

    //     return valRes;

    // }

    // static applyBorder(heightRaster: IRasterData): void {

    //     for (let x = 0; x < heightRaster.width; x++) {
    //         heightRaster.data[x] = 0;
    //         heightRaster.data[heightRaster.width + x] = 0;
    //         heightRaster.data[(heightRaster.height - 2) * heightRaster.width + x] = 0;
    //         heightRaster.data[(heightRaster.height - 1) * heightRaster.width + x] = 0;
    //     }
    //     for (let y = 0; y < heightRaster.height; y++) {
    //         heightRaster.data[y * heightRaster.width] = 0;
    //         heightRaster.data[y * heightRaster.width + 1] = 0;
    //         heightRaster.data[y * heightRaster.width + (heightRaster.width - 2)] = 0;
    //         heightRaster.data[y * heightRaster.width + (heightRaster.width - 1)] = 0;
    //     }

    // }

    // /**
    //  * https://pro.arcgis.com/en/pro-app/latest/tool-reference/spatial-analyst/how-slope-works.htm
    //  * @param heightRaster
    //  * @returns
    //  */
    // static toSlopeRaster(heightRaster: IRasterData): IRasterData {

    //     const radius = 1;

    //     const slopeData = new Float32Array(heightRaster.data.length);
    //     let a: number;
    //     let b: number;
    //     let c: number;
    //     let d: number;
    //     let f: number;
    //     let g: number;
    //     let h: number;
    //     let i: number;
    //     let dzdx: number;
    //     let dzdy: number;
    //     let slope: number;
    //     for (let y = radius; y < heightRaster.height - radius; y++) {
    //         for (let x = radius; x < heightRaster.width - radius; x++) {

    //             a = heightRaster.data[(y - 1) * heightRaster.width + x - 1];
    //             b = heightRaster.data[(y - 1) * heightRaster.width + x];
    //             c = heightRaster.data[(y - 1) * heightRaster.width + x + 1];
    //             d = heightRaster.data[y * heightRaster.width + x - 1];
    //             f = heightRaster.data[y * heightRaster.width + x + 1];
    //             g = heightRaster.data[(y + 1) * heightRaster.width + x + 1];
    //             h = heightRaster.data[(y + 1) * heightRaster.width + x];
    //             i = heightRaster.data[(y + 1) * heightRaster.width + x + 1];

    //             dzdx = ((c + 2 * f + i) * 4 / 4 - (a + 2 * d + g) * 4 / 4) / (8 * 10);
    //             dzdy = ((g + 2 * h + i) * 4 / 4 - (a + 2 * b + c) * 4 / 4) / (8 * 10);

    //             slope = Math.atan(Math.sqrt(dzdx ** 2 + dzdy ** 2)) * this.RAD2DEG;
    //             slopeData[y * heightRaster.width + x] = slope;

    //         }
    //     }
    //     return {
    //         ...heightRaster,
    //         data: slopeData
    //     };

    // }



    // /**
    //  * https://pro.arcgis.com/en/pro-app/latest/tool-reference/spatial-analyst/how-aspect-works.htm
    //  * formula has been adapted
    //  * @param heightRaster
    //  * @returns
    //  */
    // static toAspectRaster(heightRaster: IRasterData): IRasterData {

    //     const radius = 1;

    //     const aspectData = new Float32Array(heightRaster.data.length);
    //     let b: number;
    //     let d: number;
    //     let f: number;
    //     let h: number;
    //     let dzdx: number;
    //     let dzdy: number;
    //     let aspect: number;
    //     for (let y = radius; y < heightRaster.height - radius; y++) {
    //         for (let x = radius; x < heightRaster.width - radius; x++) {

    //             b = heightRaster.data[(y - 1) * heightRaster.width + x];
    //             d = heightRaster.data[y * heightRaster.width + x - 1];
    //             f = heightRaster.data[y * heightRaster.width + x + 1];
    //             h = heightRaster.data[(y + 1) * heightRaster.width + x];

    //             dzdx = f - d;
    //             dzdy = b - h;
    //             aspect = Math.atan2(dzdy, dzdx) * this.RAD2DEG;
    //             if (aspect < 0) {
    //                 aspect = 90.0 - aspect
    //             } else if (aspect > 90.0) {
    //                 aspect = 360.0 - aspect + 90.0
    //             } else {
    //                 aspect = 90.0 - aspect
    //             }
    //             aspectData[y * heightRaster.width + x] = aspect;

    //         }
    //     }
    //     return {
    //         ...heightRaster,
    //         data: aspectData
    //     };

    // }

    // static blur(rasterData: IRasterData): IRasterData {

    //     const radius = 3;
    //     const blurredData = rasterData.data.slice();

    //     for (let y = radius; y < rasterData.height - radius; y++) {
    //         for (let x = radius; x < rasterData.width - radius; x++) {

    //             const pixelIndices = this.getPixelIndices(rasterData, x, y, radius);
    //             let xSum = 0;
    //             let ySum = 0;
    //             for (let i = 0; i < pixelIndices.length; i++) {
    //                 const radians = rasterData.data[pixelIndices[i]] * Math.PI / 180;
    //                 xSum += Math.cos(radians);
    //                 ySum += Math.sin(radians);
    //             }
    //             const radians2 = Math.atan2(ySum, xSum);
    //             blurredData[y * rasterData.width + x] = radians2 * 180 / Math.PI;

    //         }
    //     }
    //     return {
    //         ...rasterData,
    //         data: blurredData
    //     };

    // }

}