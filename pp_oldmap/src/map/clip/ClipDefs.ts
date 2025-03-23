import { Map } from "../Map";
import { IClipDef } from "./IClipDef";

export class ClipDefs {

    static readonly CLIP_DEFS: IClipDef[] = [ // , setClipDefs
        /////////////////////////////////////////////
        // GREENAREA
        /////////////////////////////////////////////
        {
            layerNameDest: Map.LAYER__NAME_______WOOD,
            layerNameClip: Map.LAYER__NAME__GREENAREA,
            distance: 6,
            status: 'pending'
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
            distance: 2,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME__GREENAREA,
            layerNameClip: Map.LAYER__NAME____HIGHWAY,
            distance: 2,
            status: 'pending'
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
        // WOOD
        /////////////////////////////////////////////
        {
            layerNameDest: Map.LAYER__NAME_______WOOD,
            layerNameClip: Map.LAYER__NAME__BUILDINGS,
            distance: 6,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME_______WOOD,
            layerNameClip: Map.LAYER__NAME______WATER,
            distance: 6,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME_______WOOD,
            layerNameClip: Map.LAYER__NAME______ROADS,
            distance: 2,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME_______WOOD,
            layerNameClip: Map.LAYER__NAME____HIGHWAY,
            distance: 2,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME_______WOOD,
            layerNameClip: Map.LAYER__NAME_____CHURCH,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME_______WOOD,
            layerNameClip: Map.LAYER__NAME_____SUMMIT,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME_______WOOD,
            layerNameClip: Map.LAYER__NAME___LOCATION,
            distance: 0,
            status: 'pending'
        },
        /////////////////////////////////////////////
        // WATER
        /////////////////////////////////////////////
        {
            layerNameDest: Map.LAYER__NAME______WATER,
            layerNameClip: Map.LAYER__NAME______ROADS,
            distance: 2,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME______WATER,
            layerNameClip: Map.LAYER__NAME____HIGHWAY,
            distance: 2,
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
        /////////////////////////////////////////////
        // ROADS
        /////////////////////////////////////////////
        // {
        //     layerNameDest: Map.LAYER__NAME______WATER,
        //     layerNameClip: Map.LAYER__NAME_____BRIDGE, //
        //     distance: 0,
        //     status: 'pending',
        //     options: {
        //         skipMlt: false
        //     }
        // },
        {
            layerNameDest: Map.LAYER__NAME____HIGHWAY,
            layerNameClip: Map.LAYER__NAME_____BRIDGE,
            distance: 2,
            status: 'pending',
            options: {
                skipMlt: false
            }
        }, // clip highways underneath bridges
        {
            layerNameDest: Map.LAYER__NAME____RAILWAY,
            layerNameClip: Map.LAYER__NAME_____BRIDGE,
            distance: 2,
            status: 'pending',
            options: {
                skipMlt: false
            }
        }, // clip tracks underneath bridges
        {
            layerNameDest: Map.LAYER__NAME_____BRIDGE,
            layerNameClip: Map.LAYER__NAME______ROADS,
            distance: 2,
            status: 'pending'
        }, // remove bridges
        {
            layerNameDest: Map.LAYER__NAME______ROADS,
            layerNameClip: Map.LAYER__NAME____HIGHWAY,
            distance: 1,
            status: 'pending'
        }, // remove roads underneath highways
        {
            layerNameDest: Map.LAYER__NAME______ROADS,
            layerNameClip: Map.LAYER__NAME____HIGHWAY,
            distance: 1,
            status: 'pending'
        }, // remove roads underneath tracks (this may be a problem in urban areas)
        {
            layerNameDest: Map.LAYER__NAME______ROADS,
            layerNameClip: Map.LAYER__NAME__BUILDINGS,
            distance: 5,
            status: 'pending',
            options: {
                skip005: true,
                skip030: true, // single line roads
            }
        },
        {
            layerNameDest: Map.LAYER__NAME______ROADS,
            layerNameClip: Map.LAYER__NAME__BUILDINGS,
            distance: 8,
            status: 'pending',
            options: {
                skip010: true,
                skip050: true,
            }
        },
        /////////////////////////////////////////////
        // FRAME (as clipping layer)
        /////////////////////////////////////////////
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
            layerNameDest: Map.LAYER__NAME_______WOOD,
            layerNameClip: Map.LAYER__NAME______FRAME,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME__BUILDINGS,
            layerNameClip: Map.LAYER__NAME______FRAME,
            distance: 0,
            status: 'pending'
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
            layerNameDest: Map.LAYER__NAME__ELEVATE_A,
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
            layerNameDest: Map.LAYER__NAME____HIGHWAY,
            layerNameClip: Map.LAYER__NAME_____CHURCH,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____HIGHWAY,
            layerNameClip: Map.LAYER__NAME_____SUMMIT,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____HIGHWAY,
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
            layerNameDest: Map.LAYER__NAME______WATER,
            layerNameClip: Map.LAYER__NAME___RIVER_TX,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME__ELEVATE_A,
            layerNameClip: Map.LAYER__NAME__ELEVATE_B,
            distance: 0,
            status: 'pending'
        }

    ];

    //     clip(Map.LAYER__NAME_______WOOD, Map.LAYER__NAME__GREENAREA, 6); // remove duplicates between greenarea and wood

    //     clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME__BUILDINGS, 6);
    //     clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME______WATER, 6);
    //     clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME______ROADS, 6);
    //     clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME_____CHURCH, 6);
    //     clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME_____SUMMIT, 6);

    //     clip(Map.LAYER__NAME_______WOOD, Map.LAYER__NAME__BUILDINGS, 6);
    //     clip(Map.LAYER__NAME_______WOOD, Map.LAYER__NAME______WATER, 6);
    //     clip(Map.LAYER__NAME_______WOOD, Map.LAYER__NAME______ROADS, 6);
    //     clip(Map.LAYER__NAME_______WOOD, Map.LAYER__NAME_____CHURCH, 6);
    //     clip(Map.LAYER__NAME_______WOOD, Map.LAYER__NAME_____SUMMIT, 6);

    //     clip(Map.LAYER__NAME______WATER, Map.LAYER__NAME______ROADS, 6); // remove water where roads pass over or nearby
    //     clip(Map.LAYER__NAME______WATER, Map.LAYER__NAME_____TRACKS, 6); // remove water where tracks pass over or nearby

    //     clip(
    //       Map.LAYER__NAME______ROADS,
    //       Map.LAYER__NAME__BUILDINGS,
    //       3,
    //       {
    //         skip005: true,
    //         skip030: true, // single line roads
    //       }
    //     ); // remove road boundaries where a building boundary is nearby
    //     clip(
    //       Map.LAYER__NAME______ROADS,
    //       Map.LAYER__NAME__BUILDINGS,
    //       8,
    //       {
    //         skip010: true,
    //         skip050: true,
    //       }
    //     ); // remove road boundaries where a building boundary is nearby, different threshold
    //     clip(Map.LAYER__NAME______ROADS, Map.LAYER__NAME_____CHURCH, 0); // prebuffered
    //     clip(Map.LAYER__NAME______ROADS, Map.LAYER__NAME_____SUMMIT, 0); // prebuffered

    //     clip(Map.LAYER__NAME______WATER, Map.LAYER__NAME______FRAME, 0);
    //     clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME______FRAME, 0);
    //     clip(Map.LAYER__NAME_______WOOD, Map.LAYER__NAME______FRAME, 0);
    //     clip(Map.LAYER__NAME__BUILDINGS, Map.LAYER__NAME______FRAME, 0);
    //     clip(Map.LAYER__NAME______ROADS, Map.LAYER__NAME______FRAME, 0);
    //     clip(Map.LAYER__NAME_____TRACKS, Map.LAYER__NAME______FRAME, 0);
    //     clip(Map.LAYER__NAME_____TUNNEL, Map.LAYER__NAME______FRAME, 0);
    //     clip(Map.LAYER__NAME__ELEVATE_A, Map.LAYER__NAME______FRAME, 0);

    //     clip(Map.LAYER__NAME__BUILDINGS, Map.LAYER__NAME_____CHURCH, 0, {
    //       skipMlt: false,
    //     });
    //     clip(Map.LAYER__NAME__BUILDINGS, Map.LAYER__NAME_____SUMMIT, 0, { // prebuffered
    //       skipMlt: false,
    //     });
    //     clip(Map.LAYER__NAME__BUILDINGS, Map.LAYER__NAME______FRAME, 0, { // prebuffered
    //       skipMlt: false,
    //     });
    //     clip(Map.LAYER__NAME______WATER, Map.LAYER__NAME___RIVER_TX, 0, { // prebuffered
    //       skipMlt: false,
    //     });
    //     clip(Map.LAYER__NAME__ELEVATE_A, Map.LAYER__NAME__ELEVATE_B, 0); // prebuffered


}