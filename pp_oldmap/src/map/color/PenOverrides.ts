import { Map } from "../Map";
import { IPenOverride, ORIG_PEN, PEN_COLORS } from "./IPenOverride";



export class ColorOverrides {

    static getPenName(name: string, orig: ORIG_PEN) {
        const colorOverride = this.COLOR_OVERRIDES.find(c => c.name === name && c.orig === orig);
        if (colorOverride) {
            return colorOverride.dest;
        } else {
            return orig;
        }
    }

    static getRgba(name: string, orig: ORIG_PEN) {
        const colorOverride = this.COLOR_OVERRIDES.find(c => c.name === name && c.orig === orig);
        if (colorOverride) {
            return PEN_COLORS[colorOverride.dest];
        } else {
            return PEN_COLORS[orig];
        }
    }

    static readonly COLOR_OVERRIDES: IPenOverride[] = [

        {
            name: Map.LAYER__NAME______WATER,
            orig: "p018",
            dest: "w018"
        },
        {
            name: Map.LAYER__NAME______WATER,
            orig: "p035",
            dest: "w035"
        },
        {
            name: Map.LAYER__NAME___RIVER_TX,
            orig: "p018",
            dest: "w018"
        },
        {
            name: Map.LAYER__NAME_VEGETATION,
            orig: "p025",
            dest: "v025"
        },
        {
            name: Map.LAYER__NAME____HACHURE,
            orig: "p018",
            dest: "h018"
        },
        {
            name: Map.LAYER__NAME____CONTOUR,
            orig: "p025",
            dest: "h025"
        },
        {
            name: Map.LAYER__NAME_CONTOUR_TX,
            orig: "p018",
            dest: "h018"
        }, {
            name: Map.LAYER__NAME_______CROP,
            orig: "p025",
            dest: "h025"
        }, {
            name: Map.LAYER__NAME_______CROP,
            orig: "p018",
            dest: "c018"
        }, {
            name: Map.LAYER__NAME______STAMP,
            orig: "p018",
            dest: "w018"
        }, {
            name: Map.LAYER__NAME______STAMP,
            orig: "p035",
            dest: "w035"
        }

    ];

}