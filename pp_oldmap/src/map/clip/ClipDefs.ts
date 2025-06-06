import { Map } from "../Map";
import { IClipDef } from "./IClipDef";

export class ClipDefs {

    static readonly CLIP_DEFS: IClipDef[] = [ // , setClipDefs
        /////////////////////////////////////////////
        // GREENAREA
        /////////////////////////////////////////////
        {
            layerNameDest: Map.LAYER__NAME_VEGETATION,
            layerNameClip: Map.LAYER__NAME__GREENAREA,
            distance: 9,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME__GREENAREA,
            layerNameClip: Map.LAYER__NAME__BUILDINGS,
            distance: 9,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME__GREENAREA,
            layerNameClip: Map.LAYER__NAME______WATER,
            distance: 9,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME__GREENAREA,
            layerNameClip: Map.LAYER__NAME______ROADS,
            distance: 6,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____HACHURE,
            layerNameClip: Map.LAYER__NAME______ROADS,
            distance: 6,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME__GREENAREA,
            layerNameClip: Map.LAYER__NAME_____CHURCH,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME__GREENAREA,
            layerNameClip: Map.LAYER__NAME_____SUMMIT,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME__GREENAREA,
            layerNameClip: Map.LAYER__NAME___LOCATION,
            distance: 0,
            status: 'pending'
        },
        /////////////////////////////////////////////
        // VEGETATION
        /////////////////////////////////////////////
        {
            layerNameDest: Map.LAYER__NAME_VEGETATION,
            layerNameClip: Map.LAYER__NAME__BUILDINGS,
            distance: 9,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_VEGETATION,
            layerNameClip: Map.LAYER__NAME______WATER,
            distance: 9,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME____CONTOUR,
            layerNameClip: Map.LAYER__NAME______WATER,
            distance: 9,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_CONTOUR_TX,
            layerNameClip: Map.LAYER__NAME______WATER,
            distance: 9,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_VEGETATION,
            layerNameClip: Map.LAYER__NAME______ROADS,
            distance: 6,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_VEGETATION,
            layerNameClip: Map.LAYER__NAME_____CHURCH,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_VEGETATION,
            layerNameClip: Map.LAYER__NAME_____SUMMIT,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_VEGETATION,
            layerNameClip: Map.LAYER__NAME___LOCATION,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME______WATER,
            layerNameClip: Map.LAYER__NAME______ROADS,
            distance: 3,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME______WATER,
            layerNameClip: Map.LAYER__NAME____RAILWAY,
            distance: 6,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME______WATER,
            layerNameClip: Map.LAYER__NAME_______TRAM,
            distance: 6,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____RAILWAY,
            layerNameClip: Map.LAYER__NAME_____BRIDGE,
            distance: 6,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME______ROADS,
            layerNameClip: Map.LAYER__NAME____RAILWAY,
            distance: 3,
            status: 'pending'
        }, // remove roads underneath tracks (this may be a problem in urban areas)
        {
            layerNameDest: Map.LAYER__NAME______ROADS,
            layerNameClip: Map.LAYER__NAME__BUILDINGS,
            distance: 6,
            status: 'pending',
            // options: {
            //     skip025: true,
            //     skip050: true,
            // }
        },
        {
            layerNameDest: Map.LAYER__NAME____HACHURE,
            layerNameClip: Map.LAYER__NAME_______TRAM,
            distance: 2,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____HACHURE,
            layerNameClip: Map.LAYER__NAME___BORDER_C,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME____HACHURE,
            layerNameClip: Map.LAYER__NAME___BORDER_N,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME____HACHURE,
            layerNameClip: Map.LAYER__NAME_BORDER_TXC,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME____HACHURE,
            layerNameClip: Map.LAYER__NAME_BORDER_TXN,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME____CONTOUR,
            layerNameClip: Map.LAYER__NAME_BORDER_TXC,
            distance: 9,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME____CONTOUR,
            layerNameClip: Map.LAYER__NAME_BORDER_TXN,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_VEGETATION,
            layerNameClip: Map.LAYER__NAME_BORDER_TXC,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_VEGETATION,
            layerNameClip: Map.LAYER__NAME_BORDER_TXN,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME__GREENAREA,
            layerNameClip: Map.LAYER__NAME_BORDER_TXC,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME__GREENAREA,
            layerNameClip: Map.LAYER__NAME_BORDER_TXN,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_CONTOUR_TX,
            layerNameClip: Map.LAYER__NAME_BORDER_TXN,
            distance: 12,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_CONTOUR_TX,
            layerNameClip: Map.LAYER__NAME_BORDER_TXC,
            distance: 12,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        /////////////////////////////////////////////
        // FRAME (as clipping layer)
        /////////////////////////////////////////////
        {
            layerNameDest: Map.LAYER__NAME___BORDER_C,
            layerNameClip: Map.LAYER__NAME_______CROP,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME___BORDER_N,
            layerNameClip: Map.LAYER__NAME_______CROP,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_CONTOUR_TX,
            layerNameClip: Map.LAYER__NAME_______CROP,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_____SUMMIT,
            layerNameClip: Map.LAYER__NAME_______CROP,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_____CHURCH,
            layerNameClip: Map.LAYER__NAME_______CROP,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME___LOCATION,
            layerNameClip: Map.LAYER__NAME_______CROP,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME____HACHURE,
            layerNameClip: Map.LAYER__NAME_______CROP,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME______WATER,
            layerNameClip: Map.LAYER__NAME_______CROP,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME__GREENAREA,
            layerNameClip: Map.LAYER__NAME_______CROP,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME_VEGETATION,
            layerNameClip: Map.LAYER__NAME_______CROP,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME__BUILDINGS,
            layerNameClip: Map.LAYER__NAME_______CROP,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME______ROADS,
            layerNameClip: Map.LAYER__NAME_______CROP,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____RAILWAY,
            layerNameClip: Map.LAYER__NAME_______CROP,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME_______TRAM,
            layerNameClip: Map.LAYER__NAME_______CROP,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME_____TUNNEL,
            layerNameClip: Map.LAYER__NAME_______CROP,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____CONTOUR,
            layerNameClip: Map.LAYER__NAME_______CROP,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME_CONTOUR_TX,
            layerNameClip: Map.LAYER__NAME_______CROP,
            distance: 9,
            status: 'pending'
        },
        /////////////////////////////////////////////
        // CHURCH AND SUMMIT (as clipping layer)
        /////////////////////////////////////////////
        {
            layerNameDest: Map.LAYER__NAME__BUILDINGS,
            layerNameClip: Map.LAYER__NAME_____CHURCH,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME__BUILDINGS,
            layerNameClip: Map.LAYER__NAME_____SUMMIT,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME__BUILDINGS,
            layerNameClip: Map.LAYER__NAME___LOCATION,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME__BUILDINGS,
            layerNameClip: Map.LAYER__NAME_BORDER_TXC,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME__BUILDINGS,
            layerNameClip: Map.LAYER__NAME_BORDER_TXN,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME______ROADS,
            layerNameClip: Map.LAYER__NAME_____CHURCH,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME______ROADS,
            layerNameClip: Map.LAYER__NAME_____SUMMIT,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME___BORDER_C,
            layerNameClip: Map.LAYER__NAME_____SUMMIT,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME___BORDER_N,
            layerNameClip: Map.LAYER__NAME_____SUMMIT,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME______ROADS,
            layerNameClip: Map.LAYER__NAME___LOCATION,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME___BORDER_C,
            layerNameClip: Map.LAYER__NAME___LOCATION,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME___BORDER_N,
            layerNameClip: Map.LAYER__NAME___LOCATION,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME______ROADS,
            layerNameClip: Map.LAYER__NAME_BORDER_TXC,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME______ROADS,
            layerNameClip: Map.LAYER__NAME_BORDER_TXN,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME__SHIP_LINE,
            layerNameClip: Map.LAYER__NAME_____CHURCH,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME__SHIP_LINE,
            layerNameClip: Map.LAYER__NAME_____SUMMIT,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME__SHIP_LINE,
            layerNameClip: Map.LAYER__NAME___LOCATION,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____RAILWAY,
            layerNameClip: Map.LAYER__NAME_____CHURCH,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____RAILWAY,
            layerNameClip: Map.LAYER__NAME_____SUMMIT,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____RAILWAY,
            layerNameClip: Map.LAYER__NAME___LOCATION,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME_______TRAM,
            layerNameClip: Map.LAYER__NAME_____CHURCH,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME_______TRAM,
            layerNameClip: Map.LAYER__NAME_____SUMMIT,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME_______TRAM,
            layerNameClip: Map.LAYER__NAME___LOCATION,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME______WATER,
            layerNameClip: Map.LAYER__NAME_____CHURCH,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME______WATER,
            layerNameClip: Map.LAYER__NAME_____SUMMIT,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME______WATER,
            layerNameClip: Map.LAYER__NAME___LOCATION,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____HACHURE,
            layerNameClip: Map.LAYER__NAME______WATER,
            distance: 2,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME____HACHURE,
            layerNameClip: Map.LAYER__NAME_____CHURCH,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME____HACHURE,
            layerNameClip: Map.LAYER__NAME_____SUMMIT,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME____HACHURE,
            layerNameClip: Map.LAYER__NAME___LOCATION,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME____CONTOUR,
            layerNameClip: Map.LAYER__NAME___LOCATION,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        /////////////////////////////////////////////
        // MISC
        /////////////////////////////////////////////
        // { // duplicate
        //     layerNameDest: Map.LAYER__NAME__BUILDINGS,
        //     layerNameClip: Map.LAYER__NAME______FRAME,
        //     distance: 0,
        //     status: 'pending',
        //     options: {
        //         skipMlt: false
        //     }
        // },
        {
            layerNameDest: Map.LAYER__NAME__SHIP_LINE,
            layerNameClip: Map.LAYER__NAME___RIVER_TX,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME______WATER,
            layerNameClip: Map.LAYER__NAME___RIVER_TX,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME____CONTOUR,
            layerNameClip: Map.LAYER__NAME_____SUMMIT,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____CONTOUR,
            layerNameClip: Map.LAYER__NAME_CONTOUR_TX,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____HACHURE,
            layerNameClip: Map.LAYER__NAME_CONTOUR_TX,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____HACHURE,
            layerNameClip: Map.LAYER__NAME___CLIPPOLY,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____CONTOUR,
            layerNameClip: Map.LAYER__NAME___CLIPPOLY,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME_CONTOUR_TX,
            layerNameClip: Map.LAYER__NAME___CLIPPOLY,
            distance: 0,
            status: 'pending'
        }

    ];

}