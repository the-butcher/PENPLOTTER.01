import { ByteLoader } from "./ByteLoader";
import { IRasterData } from "./IRasterData";
import { decode } from 'fast-png';

/**
 * utility type for loading a 16bit png from a given source
 *
 * @author h.fleischer
 * @since 13.04.2025
 */
export class Png16Loader {

    /**
     * load from the given url and return a promise resolving to an instance of Uint8Array
     * @param url
     */
    async load(url: string, sampleToRaster: (sample: number) => number): Promise<IRasterData> {
        return new Promise((resolve, reject) => {

            new ByteLoader().load(url).then(bytes => {

                const decodedPng = decode(bytes);

                const imageDimX = decodedPng.width;
                const imageDimY = decodedPng.height;

                let pixelIndexRGB: number;
                const data = new Float32Array(imageDimX * imageDimY);
                for (let y = 0; y < imageDimY; y++) {
                    for (let x = 0; x < imageDimX; x++) {
                        pixelIndexRGB = y * imageDimX + x;
                        data[pixelIndexRGB] = sampleToRaster(decodedPng.data[pixelIndexRGB]);
                    }
                }

                resolve({
                    data,
                    width: imageDimX,
                    height: imageDimY
                });

            }).catch((e: Error) => {
                reject(e);
            });

        });
    }

}