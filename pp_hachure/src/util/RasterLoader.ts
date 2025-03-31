import { IRasterData } from "./IRasterData";

/**
 * utility type for loading an array of bytes from a given url
 *
 * @author h.fleischer
 * @since 21.07.2019
 */
export class RasterLoader {

    /**
     * load from the given url and return a promise resolving to an instance of Uint8Array
     * @param url
     */
    async load(url: string, sampleToRaster: (sample: number) => number): Promise<IRasterData> {
        return new Promise((resolve, reject) => {

            const image = new Image();
            image.src = url;
            image.addEventListener("load", () => {

                const canvasDimX = image.width;
                const canvasDimY = image.height;

                const canvasElement = document.createElement('canvas');
                canvasElement.width = canvasDimX;
                canvasElement.height = canvasDimY;

                const ctx = canvasElement.getContext("2d")!;

                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvasDimX, canvasDimY);
                ctx.fill();

                ctx.drawImage(image, 0, 0, image.width, image.height);

                const imageData = ctx.getImageData(0, 0, canvasDimX, canvasDimY);

                let pixelIndexRGB: number;

                let valR: number;
                let valG: number;

                let valF: number; // unscaled float value
                const data = new Float32Array(canvasDimX * canvasDimY);

                for (let y = 0; y < canvasDimY; y++) {
                    for (let x = 0; x < canvasDimX; x++) {
                        pixelIndexRGB = (y * canvasDimX + x) * 4;
                        valR = imageData.data[pixelIndexRGB + 1];
                        valG = imageData.data[pixelIndexRGB + 2];
                        valF = valR << 8 | valG;
                        data[pixelIndexRGB / 4] = sampleToRaster(valF);
                    }
                }

                // console.log('data', data);
                resolve({
                    data,
                    width: canvasDimX,
                    height: canvasDimY
                });

            });
            image.addEventListener('error', e => {
                reject(e);
            })

        });
    }

}