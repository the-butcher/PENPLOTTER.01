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
            distance: 6,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME__GREENAREA,
            layerNameClip: Map.LAYER__NAME__BUILDINGS,
            distance: 6,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME__GREENAREA,
            layerNameClip: Map.LAYER__NAME______WATER,
            distance: 6,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME__GREENAREA,
            layerNameClip: Map.LAYER__NAME______ROADS,
            distance: 4,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____HACHURE,
            layerNameClip: Map.LAYER__NAME______ROADS,
            distance: 4,
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
            distance: 6,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_VEGETATION,
            layerNameClip: Map.LAYER__NAME______WATER,
            distance: 6,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_VEGETATION,
            layerNameClip: Map.LAYER__NAME______ROADS,
            distance: 4,
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
        /////////////////////////////////////////////
        // WATER
        /////////////////////////////////////////////
        {
            layerNameDest: Map.LAYER__NAME______WATER,
            layerNameClip: Map.LAYER__NAME______ROADS,
            distance: 4,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME______WATER,
            layerNameClip: Map.LAYER__NAME____RAILWAY,
            distance: 4,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME______WATER,
            layerNameClip: Map.LAYER__NAME_______TRAM,
            distance: 4,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____RAILWAY,
            layerNameClip: Map.LAYER__NAME_____BRIDGE,
            distance: 4,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        // can not clip tram with bridges, because otherwise it would hide trams running on bridges
        // {
        //     layerNameDest: Map.LAYER__NAME_______TRAM,
        //     layerNameClip: Map.LAYER__NAME_____BRIDGE,
        //     distance: 4,
        //     status: 'pending',
        //     options: {
        //         skipMlt: false
        //     }
        // },
        {
            layerNameDest: Map.LAYER__NAME______ROADS,
            layerNameClip: Map.LAYER__NAME____RAILWAY,
            distance: 2,
            status: 'pending'
        }, // remove roads underneath tracks (this may be a problem in urban areas)
        {
            layerNameDest: Map.LAYER__NAME______ROADS,
            layerNameClip: Map.LAYER__NAME__BUILDINGS,
            distance: 8,
            status: 'pending',
            // options: {
            //     skip025: true,
            //     skip050: true,
            // }
        },
        /////////////////////////////////////////////
        // FRAME (as clipping layer)
        /////////////////////////////////////////////
        {
            layerNameDest: Map.LAYER__NAME____HACHURE,
            layerNameClip: Map.LAYER__NAME_____BORDER,
            distance: 6,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME____HACHURE,
            layerNameClip: Map.LAYER__NAME__BORDER_TX,
            distance: 6,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME____CONTOUR,
            layerNameClip: Map.LAYER__NAME__BORDER_TX,
            distance: 6,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_VEGETATION,
            layerNameClip: Map.LAYER__NAME__BORDER_TX,
            distance: 6,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME__GREENAREA,
            layerNameClip: Map.LAYER__NAME__BORDER_TX,
            distance: 6,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME____HACHURE,
            layerNameClip: Map.LAYER__NAME______FRAME,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME______WATER,
            layerNameClip: Map.LAYER__NAME______FRAME,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME__GREENAREA,
            layerNameClip: Map.LAYER__NAME______FRAME,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME_VEGETATION,
            layerNameClip: Map.LAYER__NAME______FRAME,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME__BUILDINGS,
            layerNameClip: Map.LAYER__NAME______FRAME,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME______ROADS,
            layerNameClip: Map.LAYER__NAME______FRAME,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____RAILWAY,
            layerNameClip: Map.LAYER__NAME______FRAME,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME_______TRAM,
            layerNameClip: Map.LAYER__NAME______FRAME,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME_____TUNNEL,
            layerNameClip: Map.LAYER__NAME______FRAME,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____CONTOUR,
            layerNameClip: Map.LAYER__NAME______FRAME,
            distance: 0,
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
            layerNameDest: Map.LAYER__NAME______ROADS,
            layerNameClip: Map.LAYER__NAME___LOCATION,
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
            distance: 1,
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
        /////////////////////////////////////////////
        // MISC
        /////////////////////////////////////////////
        {
            layerNameDest: Map.LAYER__NAME__BUILDINGS,
            layerNameClip: Map.LAYER__NAME______FRAME,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
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
        }
        ,
        {
            layerNameDest: Map.LAYER__NAME_CONTOUR_TX,
            layerNameClip: Map.LAYER__NAME___CLIPPOLY,
            distance: 0,
            status: 'pending'
        }

    ];

}