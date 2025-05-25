import { Position } from "geojson";
import { ISurface } from "./ISurface";


/**
 * utility type for surface operations
 *
 * @author h.fleischer
 * @since 19.04.2025
 */
export class Surface {

    static RAD2DEG = 180 / Math.PI;
    static DEG2RAD = Math.PI / 180;

    static getSurfaceValue(surface: ISurface, position3857: Position) {

        const x = (position3857[0] - surface.originProj[0]) / surface.cellsize;
        const y = (surface.originProj[1] - position3857[1]) / surface.cellsize;

        // console.log('x', x, 'y', y, 'position3857', position3857);

        const xA = Math.floor(x);
        const xB = Math.ceil(x);
        const xF = x - xA;

        const yA = Math.floor(y);
        const yB = Math.ceil(y);
        const yF = y - yA;

        const valXAYA = surface.data[yA * surface.width + xA];
        const valXAYB = surface.data[yB * surface.width + xA];
        const valXBYA = surface.data[yA * surface.width + xB];
        const valXBYB = surface.data[yB * surface.width + xB];

        const interpolateValue = (a: number, b: number, f: number) => {
            return a + (b - a) * f;
        };

        // between upper pixels
        const valFYA = interpolateValue(valXAYA, valXBYA, xF);
        // between lower pixels
        const valFYB = interpolateValue(valXAYB, valXBYB, xF);
        // final interpolation
        const valRes = interpolateValue(valFYA, valFYB, yF);

        return valRes;

    }

}