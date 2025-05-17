import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { IMapDef } from "./IMapDef"

export class MapDefs {

    static DEFAULT_TEXT_SCALE_LINELABEL = 0.022;
    static DEFAULT_TEXT_SCALE__LOCATION = 16; // 0.032;
    static DEFAULT_TEXT_SCALE_____WATER = 0.036;

    static MAP_DEF_________MOON: IMapDef = {
        hachures: 'hachures_moon.geojson',
        contours: 'contours_moon.geojson',
        locatons: 'craters.geojson',
        clippoly: '',
        bordertx: '',
        water_tx: '',
        bbox3857: VectorTileGeometryUtil.bboxAtCenter([
            2744919.086552,
            -1311337.863211
        ],
            4000 * 399,
            2828 * 399
        ),
        padding: 0,
        labelDefs: [
            {
                tileName: 'Theophilus',
                plotName: 'Theophilus',
                distance: 10000,
                vertical: 15000,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'italic',
                idxvalid: () => true
            },
            {
                tileName: 'Cyrillus',
                plotName: 'Cyrillus',
                distance: 5000,
                vertical: 30000,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'italic',
                idxvalid: () => true
            },
            {
                tileName: 'Cyrillus F',
                plotName: 'Cyrillus F',
                distance: 5000,
                vertical: 10000,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'italic',
                idxvalid: () => true
            }, {
                tileName: 'Mons Penck',
                plotName: 'Mons Penck',
                distance: -70000,
                vertical: -10000,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'italic',
                idxvalid: () => true
            }
        ]
    }

    static MAP_DEF_FUSCHERTOERL: IMapDef = {
        hachures: 'hachures_fuschertoerl.geojson',
        contours: 'contours_fuschertoerl.geojson',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: '',
        bbox3857: VectorTileGeometryUtil.bboxAtCenter([
            1427500,
            5961980
        ],
            4000,
            2828
        ),
        padding: 200,
        labelDefs: [
            {
                tileName: '2550',
                plotName: '2550',
                distance: 0.75,
                vertical: 12,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: '2450',
                plotName: '2450',
                distance: 0.47,
                vertical: 12,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: '2400',
                plotName: '2400',
                distance: 0.60,
                vertical: 12,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: '2250',
                plotName: '2250',
                distance: 0.25,
                vertical: 12,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: 'Aussichtswarte Edelweißspitze',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'regular',
                idxvalid: () => false
            },
            {
                tileName: 'Fuschertörl',
                plotName: 'Fuschertörl',
                distance: 25,
                vertical: -20,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: '2455 m',
                plotName: '2455 m',
                distance: 20,
                vertical: 15,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: 'Edelweißhütte',
                plotName: 'Edelweißhütte',
                distance: -350,
                vertical: -40,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: 'Fuscher Törl',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'regular',
                idxvalid: () => false
            },
            {
                tileName: '2428 m',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'regular',
                idxvalid: () => false
            },
        ]
    }

    // static MAP_DEF_________TEST: IMapDef = {
    //     bbox3857: VectorTileGeometryUtil.bboxAtCenter([
    //         1726650,
    //         6173400
    //     ],
    //         4000,
    //         2828
    //     ),
    //     padding: 200,
    //     labelDefs: []
    // }

    static MAP_DEF___DUERNSTEIN: IMapDef = {
        hachures: 'hachures_duernstein.geojson',
        contours: 'contours_duernstein.geojson',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: '',
        bbox3857: VectorTileGeometryUtil.bboxAtCenter([
            1726700,
            6173400
        ],
            4000,
            2828
        ),
        padding: 200,
        labelDefs: [
            {
                tileName: 'Dürnstein',
                plotName: 'Dürnstein',
                distance: 110,
                vertical: -110,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: 'Rossatz',
                plotName: 'Rossatz',
                distance: 65,
                vertical: 25,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: '200',
                plotName: '200',
                distance: 0.50,
                vertical: 12,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                fonttype: 'regular',
                idxvalid: (index: number) => index === 6
            },
            {
                tileName: '400',
                plotName: '400',
                distance: 0.70,
                vertical: 12,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: '450',
                plotName: '450',
                distance: 0.80,
                vertical: 12,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL * 1.2,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: 'Donau',
                plotName: 'Donau',
                distance: 0.17,
                vertical: 0,
                charsign: -1.1,
                fonttype: 'italic',
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_____WATER,
                idxvalid: (index: number) => index === 1
            },

        ]
    }

    // static MAP_DEF_________1010: IMapDef = {
    //     bbox3857: VectorTileGeometryUtil.bboxAtCenter([
    //         1822430 + 4000 * 2,
    //         6141780 + 2828 * 1
    //     ],
    //         4000,
    //         2828
    //         // 400.0,
    //         // 282.8
    //     ),
    //     // bbox3857: [ // erster bezirk
    //     //     1820500, 6140200,
    //     //     1824500, 6143200
    //     // ],
    //     padding: 200,
    //     labelDefs: []
    // }

    // static MAP_DEF_________1200: IMapDef = {
    //     bbox3857: VectorTileGeometryUtil.bboxAtCenter([
    //         1822970,
    //         6144431
    //     ],
    //         4000,
    //         2828
    //     ),
    //     padding: 200,
    //     labelDefs: []
    // }

    static MAP_DEF____HALLSTATT: IMapDef = {
        hachures: 'hachures_hallstatt.geojson',
        contours: 'contours_hallstatt.geojson',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: 'watertx_hallstatt.geojson',
        bbox3857: VectorTileGeometryUtil.bboxAtCenter([
            1519500,
            6034100
        ],
            4000,
            2828
        ),
        padding: 1000,
        labelDefs: [
            {
                tileName: '850',
                plotName: '850',
                distance: 0.47,
                vertical: 12,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: '800',
                plotName: '800',
                distance: 0.45,
                vertical: 12,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: '600',
                plotName: '600',
                distance: 0.46,
                vertical: 12,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: '550',
                plotName: '550',
                distance: 0.435,
                vertical: 12,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: 'Hallstatt',
                plotName: 'Hallstatt',
                distance: 170,
                vertical: 120,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: 'Salzberg',
                plotName: 'Salzberg',
                distance: 20,
                vertical: -30,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: 'Winteralm',
                plotName: 'Winteralm',
                distance: 0,
                vertical: -20,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: 'Hallstätter See',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'regular',
                idxvalid: () => false
            },
            {
                tileName: 'Traun',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'regular',
                idxvalid: () => false
            },
            {
                tileName: 'HALLSTÄTTER SEE',
                plotName: 'HALLSTÄTTER SEE',
                distance: 0.25,
                vertical: 40,
                charsign: 1.05,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_____WATER * 1.5,
                fonttype: 'italic',
                idxvalid: () => true,
            }
        ]
    }

    static MAP_DEF_____HAINBURG: IMapDef = {
        hachures: 'hachures_hainburg.geojson',
        contours: 'contours_hainburg.geojson',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: '',
        bbox3857: VectorTileGeometryUtil.bboxAtCenter([
            1885950,
            6131500
        ],
            4000,
            2828
        ),
        padding: 200,
        labelDefs: [
            {
                tileName: 'Donau',
                plotName: 'Donau',
                distance: 0.15,
                vertical: 8,
                charsign: -1,
                fonttype: 'italic',
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_____WATER,
                idxvalid: (index: number) => index === 1
            },
            {
                tileName: 'Hainburg an der Donau',
                plotName: 'Hainburg',
                distance: 350,
                vertical: -160,
                charsign: 0,
                fonttype: 'regular',
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                idxvalid: () => true
            }
        ]
    }

    static MAP_DEF____OLDDANUBE: IMapDef = {
        contours: 'contours_altedonau.geojson',
        hachures: 'hachures_altedonau.geojson',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: '',
        bbox3857: VectorTileGeometryUtil.bboxAtCenter([
            1827800,
            6145270
        ],
            4000,
            2828
        ),
        padding: 200,
        labelDefs: [
            {
                tileName: 'Donau',
                plotName: 'Donau',
                distance: 0.15,
                vertical: 20,
                charsign: -1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_____WATER,
                fonttype: 'italic',
                idxvalid: () => true
            },
            {
                tileName: 'Neue Donau',
                plotName: 'Neue Donau',
                distance: 0.15,
                vertical: 20,
                charsign: -1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_____WATER,
                fonttype: 'italic',
                idxvalid: () => true
            },
        ]
    }

    static MAP_DEF___BADGASTEIN: IMapDef = {
        contours: 'contours_badgastein.geojson',
        hachures: 'hachures_badgastein.geojson',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: '',
        bbox3857: VectorTileGeometryUtil.bboxAtCenter([
            1462158,
            5960704
        ],
            4000,
            2828
        ),
        padding: 200,
        labelDefs: [

        ]
    }

    static MAP_DEF___KAHLENBERG: IMapDef = {
        contours: 'contours_kahlenberg.geojson',
        hachures: 'hachures_kahlenberg.geojson',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: '',
        bbox3857: VectorTileGeometryUtil.bboxAtCenter([
            1819800,
            6152510
        ],
            4000,
            2828
        ),
        padding: 200,
        labelDefs: [

        ]
    }

    static MAP_DEF__SCHOENBRUNN: IMapDef = {
        contours: 'contours_schoenbrunn.geojson',
        hachures: 'hachures_schoenbrunn.geojson',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: '',
        bbox3857: VectorTileGeometryUtil.bboxAtCenter([
            1815600,
            6137200
        ],
            4000,
            2828
        ),
        padding: 200,
        labelDefs: [
            {
                tileName: 'Schönbrunn',
                plotName: 'Schönbrunn',
                distance: -20,
                vertical: -275,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'regular',
                idxvalid: () => false
            }
        ]
    }

    static MAP_DEF_____WOLFGANG: IMapDef = {
        contours: 'contours_wolfgang.geojson',
        hachures: 'hachures_wolfgang.geojson',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: 'watertx_wolfgang.geojson',
        bbox3857: VectorTileGeometryUtil.bboxAtCenter([
            1496000,
            6063500
        ],
            4000,
            2828
        ),
        padding: 1200,
        labelDefs: [
            {
                tileName: 'Markt',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'regular',
                idxvalid: () => false
            },
            {
                tileName: 'Au',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'regular',
                idxvalid: () => false
            },
            {
                tileName: 'Auer',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'regular',
                idxvalid: () => false
            },
            {
                tileName: 'Pointhäusl',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'regular',
                idxvalid: () => false
            },
            {
                tileName: 'St. Wolfgang',
                plotName: 'St. Wolfgang',
                distance: 100,
                vertical: -30,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'regular',
                idxvalid: () => false
            },
            {
                tileName: 'WOLFGANGSEE',
                plotName: 'WOLFGANGSEE',
                distance: 0.25,
                vertical: 0,
                charsign: 0.8,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_____WATER * 1.5,
                idxvalid: () => true,
                fonttype: 'italic'
            }
        ]
    }

    // static MAP_DEF______BLUNTAU: IMapDef = {
    //     bbox3857: [
    //         1457000, 6034000,
    //         1460000, 6036000
    //     ],
    //     padding: 200,
    //     labelDefs: []
    // }

    static MAP_DEF_____SALZBURG: IMapDef = {
        contours: 'contours_salzburg.geojson',
        hachures: 'hachures_salzburg.geojson',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: '',
        bbox3857: VectorTileGeometryUtil.bboxAtCenter([
            1452600,
            6073600
        ],
            4000,
            2828
        ),
        padding: 200,
        labelDefs: [
            {
                tileName: 'Salzach',
                plotName: 'Salzach',
                distance: 0.45,
                vertical: 23,
                charsign: -1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_____WATER,
                fonttype: 'italic',
                idxvalid: (index: number) => index === 1
            },
            {
                tileName: 'Sankt Sebastianfriedhof',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'regular',
                idxvalid: () => false
            }
        ]
    }

    static MAP_DEF______HALLEIN: IMapDef = {
        contours: 'contours_hallein.geojson',
        hachures: 'hachures_hallein.geojson',
        clippoly: 'clippoly_hallein.geojson',
        bordertx: 'bordertx_hallein.geojson',
        locatons: '',
        water_tx: '',
        bbox3857: VectorTileGeometryUtil.bboxAtCenter([
            1457650,
            6054200
        ],
            4000,
            2828
        ),
        // bbox3857: [
        //     1455650, 6052700,
        //     1459650, 6055700
        // ],
        padding: 200,
        labelDefs: [
            {
                tileName: '450',
                plotName: '450',
                distance: 0.30,
                vertical: 12,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: 'DEUTSCHLAND',
                plotName: 'DEUTSCHLAND',
                distance: 0.78,
                vertical: -28,
                charsign: -1.1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: 'ÖSTERREICH',
                plotName: 'ÖSTERREICH',
                distance: 0.78,
                vertical: 50,
                charsign: -1.1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: 'Hallein',
                plotName: 'Hallein',
                distance: 50,
                vertical: -12,
                charsign: 1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'regular',
                idxvalid: () => false
            },
            {
                tileName: 'Mitterau',
                plotName: 'Mitterau',
                distance: -150,
                vertical: 20,
                charsign: 1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'regular',
                idxvalid: () => false
            },
            {
                tileName: 'Adneter Gries',
                plotName: 'Adneter Gries',
                distance: 75,
                vertical: 60,
                charsign: 1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'regular',
                idxvalid: () => false
            },
            {
                tileName: 'Salzach',
                plotName: 'Salzach',
                distance: 0.060,
                vertical: -5,
                charsign: -1.1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_____WATER,
                fonttype: 'italic',
                idxvalid: () => true
            },
            {
                tileName: 'Leprosenhauskapelle',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'regular',
                idxvalid: () => false
            }
        ]
    }

    static MAP_DEF_______VIGAUN: IMapDef = {
        contours: 'contours_vigaun.geojson',
        hachures: 'hachures_vigaun.geojson',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: '',
        bbox3857: VectorTileGeometryUtil.bboxAtCenter([
            1461800,
            6050920
        ],
            4000,
            2828
        ),
        padding: 200,
        labelDefs: [
            {
                tileName: 'Bad Vigaun',
                plotName: 'Bad Vigaun',
                distance: 130,
                vertical: 0,
                charsign: 1.02,
                fonttype: 'regular',
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                idxvalid: () => false
            },
            {
                tileName: 'Langwies',
                plotName: 'Langwies',
                distance: 60,
                vertical: -90,
                charsign: 1.02,
                fonttype: 'regular',
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                idxvalid: () => false
            },
            {
                tileName: 'Weinleiten',
                plotName: 'Weinleiten',
                distance: -40,
                vertical: 30,
                charsign: 1.02,
                fonttype: 'regular',
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                idxvalid: () => false
            },
            {
                tileName: 'Brettstein',
                plotName: 'Brettstein',
                distance: -50,
                vertical: -30,
                charsign: 1.02,
                fonttype: 'regular',
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                idxvalid: () => false
            },
            {
                tileName: 'Vigaun',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'regular',
                idxvalid: () => false
            },
            {
                tileName: 'Wirtstaller',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'regular',
                idxvalid: () => false
            },
            {
                tileName: 'Samhofkapelle',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'regular',
                idxvalid: () => false
            },
            {
                tileName: 'Salzach',
                plotName: 'Salzach',
                distance: 0.25,
                vertical: 24,
                charsign: 1.02,
                fonttype: 'italic',
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_____WATER,
                idxvalid: (index: number) => index === 1
            },
        ]
    }

}