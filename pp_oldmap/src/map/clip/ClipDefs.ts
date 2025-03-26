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
            layerNameClip: Map.LAYER__NAME____ROADS_A,
            distance: 2,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME__GREENAREA,
            layerNameClip: Map.LAYER__NAME____ROADS_B,
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
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_______WOOD,
            layerNameClip: Map.LAYER__NAME______WATER,
            distance: 6,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_______WOOD,
            layerNameClip: Map.LAYER__NAME____ROADS_A,
            distance: 2,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_______WOOD,
            layerNameClip: Map.LAYER__NAME____ROADS_B,
            distance: 2,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_______WOOD,
            layerNameClip: Map.LAYER__NAME_____CHURCH,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_______WOOD,
            layerNameClip: Map.LAYER__NAME_____SUMMIT,
            distance: 0,
            status: 'pending',
            options: {
                skipMlt: false
            }
        },
        {
            layerNameDest: Map.LAYER__NAME_______WOOD,
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
            layerNameClip: Map.LAYER__NAME____ROADS_A,
            distance: 2,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME______WATER,
            layerNameClip: Map.LAYER__NAME____ROADS_B,
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
        {
            layerNameDest: Map.LAYER__NAME___BRIDGE_A,
            layerNameClip: Map.LAYER__NAME___BRIDGE_B,
            distance: 2,
            status: 'pending',
            options: {
                skipMlt: false
            }
        }, // priority to highway bridges
        {
            layerNameDest: Map.LAYER__NAME____ROADS_B,
            layerNameClip: Map.LAYER__NAME___BRIDGE_A,
            distance: 2,
            status: 'pending',
            options: {
                skipMlt: false
            }
        }, // clip highways underneath bridges
        {
            layerNameDest: Map.LAYER__NAME____RAILWAY,
            layerNameClip: Map.LAYER__NAME___BRIDGE_A,
            distance: 2,
            status: 'pending',
            options: {
                skipMlt: false
            }
        }, // clip tracks underneath bridges
        {
            layerNameDest: Map.LAYER__NAME___BRIDGE_A,
            layerNameClip: Map.LAYER__NAME____ROADS_A,
            distance: 2,
            status: 'pending'
        }, // remove bridges, only roads should remain
        {
            layerNameDest: Map.LAYER__NAME___BRIDGE_B,
            layerNameClip: Map.LAYER__NAME____ROADS_B,
            distance: 2,
            status: 'pending'
        }, // remove bridges, only roads should remain
        {
            layerNameDest: Map.LAYER__NAME____ROADS_A,
            layerNameClip: Map.LAYER__NAME____ROADS_B,
            distance: 1,
            status: 'pending'
        }, // remove roads underneath highways
        {
            layerNameDest: Map.LAYER__NAME____ROADS_A,
            layerNameClip: Map.LAYER__NAME____RAILWAY,
            distance: 1,
            status: 'pending'
        }, // remove roads underneath tracks (this may be a problem in urban areas)
        {
            layerNameDest: Map.LAYER__NAME____ROADS_A,
            layerNameClip: Map.LAYER__NAME__BUILDINGS,
            distance: 5,
            status: 'pending',
            options: {
                skip018: true,
                skip035: true, // single line roads
            }
        },
        {
            layerNameDest: Map.LAYER__NAME____ROADS_A,
            layerNameClip: Map.LAYER__NAME__BUILDINGS,
            distance: 8,
            status: 'pending',
            options: {
                skip025: true,
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
            layerNameDest: Map.LAYER__NAME____ROADS_A,
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
            layerNameDest: Map.LAYER__NAME____ROADS_A,
            layerNameClip: Map.LAYER__NAME_____CHURCH,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____ROADS_A,
            layerNameClip: Map.LAYER__NAME_____SUMMIT,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____ROADS_A,
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
            layerNameDest: Map.LAYER__NAME____ROADS_B,
            layerNameClip: Map.LAYER__NAME_____CHURCH,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____ROADS_B,
            layerNameClip: Map.LAYER__NAME_____SUMMIT,
            distance: 0,
            status: 'pending'
        },
        {
            layerNameDest: Map.LAYER__NAME____ROADS_B,
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

}