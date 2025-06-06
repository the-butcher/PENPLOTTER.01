import { PPGeometry } from "pp-geom";
import { IMapDef } from "./IMapDef";

export class MapDefs {

    static DEFAULT_TEXT_SCALE_LINELABEL = 0.040;
    static DEFAULT_TEXT_SCALE__LOCATION = 0.050;
    static DEFAULT_TEXT_SCALE_____WATER = 0.100;

    static MAP_DEF____SEMMERING: IMapDef = {
        shadeMin: 750,
        magnNord: 5.06,
        hachures: 'hachures_semmering.geojson',
        contours: 'contours_semmering.geojson',
        surface: 'surface_semmering.json',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: '',
        bbox3857: PPGeometry.bboxAtCenter([
            1762500,
            6046300
        ],
            4000 * 2.25,
            2600 * 2.25
        ),
        padding: 200,
        labelDefs: [

        ]
    }

    static MAP_DEF________GREIN: IMapDef = {
        shadeMin: 200,
        magnNord: 4.92,
        hachures: 'hachures_grein.geojson',
        contours: 'contours_grein.geojson',
        surface: 'surface_grein.json',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: '',
        bbox3857: PPGeometry.bboxAtCenter([
            1655200,
            6143600
        ],
            4000 * 2.25,
            2600 * 2.25
        ),
        padding: 200,
        labelDefs: [
            {
                tileName: 'Donau',
                plotName: 'Donau',
                distance: 0.90,
                vertical: 50,
                charsign: 1.2,
                fonttype: 'noto_serif_________italic',
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_____WATER,
                idxvalid: (index: number) => index === 10,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Grein',
                plotName: 'Grein',
                distance: 50,
                vertical: 50,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Greinburg',
                plotName: 'Greinburg',
                distance: 500,
                vertical: 200,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Kren',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Zehethofer',
                plotName: 'Zehethofer',
                distance: 20,
                vertical: -80,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Baumgartner',
                plotName: 'Baumgartner',
                distance: 40,
                vertical: -80,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Maierhofer',
                plotName: 'Maierhofer',
                distance: 40,
                vertical: -50,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Hofstätter',
                plotName: 'Hofstätter',
                distance: 60,
                vertical: 100,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'St. Nikola',
                plotName: 'St. Nikola',
                distance: -300,
                vertical: 160,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Kegler',
                plotName: 'Kegler',
                distance: -200,
                vertical: 110,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Stadler',
                plotName: 'Stadler',
                distance: -100,
                vertical: 130,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Dachberg',
                plotName: 'Dachberg',
                distance: -120,
                vertical: -140,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Mühlberger',
                plotName: 'Mühlberger',
                distance: 40,
                vertical: 100,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Hößgang',
                plotName: 'Hößgang',
                distance: 100,
                vertical: -10,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Struden',
                plotName: 'Struden',
                distance: 20,
                vertical: 60,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Lehrbaumer',
                plotName: 'Lehrbaumer',
                distance: 20,
                vertical: 120,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Ramersböck',
                plotName: 'Ramersböck',
                distance: -80,
                vertical: -60,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Schweighof',
                plotName: 'Schweighof',
                distance: 80,
                vertical: 20,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Nomberger',
                plotName: 'Nomberger',
                distance: -300,
                vertical: 120,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Ufer',
                plotName: 'Ufer',
                distance: 80,
                vertical: -20,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Wiesen',
                plotName: 'Wiesen',
                distance: 10,
                vertical: -20,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Schauberg',
                plotName: 'Schauberg',
                distance: 50,
                vertical: -20,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Herdmann',
                plotName: 'Herdmann',
                distance: 50,
                vertical: -180,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            }
        ]
    }

    static MAP_DEF_________MOON: IMapDef = {
        shadeMin: 0,
        magnNord: 0,
        hachures: 'hachures_moon.geojson',
        contours: 'contours_moon.geojson',
        surface: '',
        locatons: 'craters.geojson',
        clippoly: '',
        bordertx: '',
        water_tx: '',
        bbox3857: PPGeometry.bboxAtCenter([
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
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Cyrillus',
                plotName: 'Cyrillus',
                distance: 5000,
                vertical: 30000,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Cyrillus F',
                plotName: 'Cyrillus F',
                distance: 5000,
                vertical: 10000,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            }, {
                tileName: 'Mons Penck',
                plotName: 'Mons Penck',
                distance: -70000,
                vertical: -10000,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            }
        ]
    }

    static MAP_DEF_FUSCHERTOERL: IMapDef = {
        shadeMin: 700,
        magnNord: 0,
        hachures: 'hachures_fuschertoerl.geojson',
        contours: 'contours_fuschertoerl.geojson',
        surface: '',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: '',
        bbox3857: PPGeometry.bboxAtCenter([
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
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: '2450',
                plotName: '2450',
                distance: 0.47,
                vertical: 12,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: '2400',
                plotName: '2400',
                distance: 0.60,
                vertical: 12,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: '2250',
                plotName: '2250',
                distance: 0.25,
                vertical: 12,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Aussichtswarte Edelweißspitze',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'noto_serif________regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Fuschertörl',
                plotName: 'Fuschertörl',
                distance: 25,
                vertical: -20,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: '2455 m',
                plotName: '2455 m',
                distance: 20,
                vertical: 15,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Edelweißhütte',
                plotName: 'Edelweißhütte',
                distance: -350,
                vertical: -40,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Fuscher Törl',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'noto_serif________regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: '2428 m',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'noto_serif________regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
        ]
    }

    // static MAP_DEF_________TEST: IMapDef = {
    //     bbox3857: PPGeometry.bboxAtCenter([
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
        shadeMin: 200,
        magnNord: 0,
        hachures: 'hachures_duernstein.geojson',
        contours: 'contours_duernstein.geojson',
        surface: '',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: '',
        bbox3857: PPGeometry.bboxAtCenter([
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
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Rossatz',
                plotName: 'Rossatz',
                distance: 65,
                vertical: 25,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: '200',
                plotName: '200',
                distance: 0.50,
                vertical: 12,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                fonttype: 'noto_serif________regular',
                idxvalid: (index: number) => index === 6,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: '400',
                plotName: '400',
                distance: 0.70,
                vertical: 12,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: '450',
                plotName: '450',
                distance: 0.80,
                vertical: 12,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL * 1.2,
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Donau',
                plotName: 'Donau',
                distance: 0.17,
                vertical: 0,
                charsign: -1.1,
                fonttype: 'noto_serif________regular',
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_____WATER,
                idxvalid: (index: number) => index === 1,
                fillprop: {
                    type: 'none'
                }
            },

        ]
    }

    // static MAP_DEF_________1010: IMapDef = {
    //     bbox3857: PPGeometry.bboxAtCenter([
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
    //     bbox3857: PPGeometry.bboxAtCenter([
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
        shadeMin: 0,
        magnNord: 0,
        hachures: 'hachures_hallstatt.geojson',
        contours: 'contours_hallstatt.geojson',
        surface: '',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: 'watertx_hallstatt.geojson',
        bbox3857: PPGeometry.bboxAtCenter([
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
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: '800',
                plotName: '800',
                distance: 0.45,
                vertical: 12,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: '600',
                plotName: '600',
                distance: 0.46,
                vertical: 12,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: '550',
                plotName: '550',
                distance: 0.435,
                vertical: 12,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Hallstatt',
                plotName: 'Hallstatt',
                distance: 170,
                vertical: 120,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Salzberg',
                plotName: 'Salzberg',
                distance: 20,
                vertical: -30,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Winteralm',
                plotName: 'Winteralm',
                distance: 0,
                vertical: -20,
                charsign: 1.02,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Hallstätter See',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'noto_serif________regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Traun',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'noto_serif________regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'HALLSTÄTTER SEE',
                plotName: 'HALLSTÄTTER SEE',
                distance: 0.25,
                vertical: 40,
                charsign: 1.05,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_____WATER * 1.5,
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            }
        ]
    }

    static MAP_DEF_____HAINBURG: IMapDef = {
        shadeMin: 0,
        magnNord: 0,
        hachures: 'hachures_hainburg.geojson',
        contours: 'contours_hainburg.geojson',
        surface: '',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: '',
        bbox3857: PPGeometry.bboxAtCenter([
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
                fonttype: 'noto_serif________regular',
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_____WATER,
                idxvalid: (index: number) => index === 1,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Hainburg an der Donau',
                plotName: 'Hainburg',
                distance: 350,
                vertical: -160,
                charsign: 0,
                fonttype: 'noto_serif________regular',
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            }
        ]
    }

    static MAP_DEF____OLDDANUBE: IMapDef = {
        shadeMin: 0,
        magnNord: 0,
        contours: 'contours_altedonau.geojson',
        hachures: 'hachures_altedonau.geojson',
        surface: '',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: '',
        bbox3857: PPGeometry.bboxAtCenter([
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
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Neue Donau',
                plotName: 'Neue Donau',
                distance: 0.15,
                vertical: 20,
                charsign: -1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_____WATER,
                fonttype: 'noto_serif________regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
        ]
    }

    static MAP_DEF___BADGASTEIN: IMapDef = {
        shadeMin: 0,
        magnNord: 0,
        contours: 'contours_badgastein.geojson',
        hachures: 'hachures_badgastein.geojson',
        surface: '',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: '',
        bbox3857: PPGeometry.bboxAtCenter([
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
        shadeMin: 0,
        magnNord: 0,
        contours: 'contours_kahlenberg.geojson',
        hachures: 'hachures_kahlenberg.geojson',
        surface: '',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: '',
        bbox3857: PPGeometry.bboxAtCenter([
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
        shadeMin: 0,
        magnNord: 0,
        contours: 'contours_schoenbrunn.geojson',
        hachures: 'hachures_schoenbrunn.geojson',
        surface: '',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: '',
        bbox3857: PPGeometry.bboxAtCenter([
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
                fonttype: 'noto_serif________regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            }
        ]
    }

    static MAP_DEF_____WOLFGANG: IMapDef = {
        shadeMin: 0,
        magnNord: 0,
        contours: 'contours_wolfgang.geojson',
        hachures: 'hachures_wolfgang.geojson',
        surface: '',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: 'watertx_wolfgang.geojson',
        bbox3857: PPGeometry.bboxAtCenter([
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
                fonttype: 'noto_serif________regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Au',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'noto_serif________regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Auer',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'noto_serif________regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Pointhäusl',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'noto_serif________regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'St. Wolfgang',
                plotName: 'St. Wolfgang',
                distance: 100,
                vertical: -30,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif________regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'WOLFGANGSEE',
                plotName: 'WOLFGANGSEE',
                distance: 0.25,
                vertical: 0,
                charsign: 0.8,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_____WATER * 1.5,
                idxvalid: () => true,
                fonttype: 'noto_serif________regular',
                fillprop: {
                    type: 'none'
                }
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
        shadeMin: 0,
        magnNord: 0,
        contours: 'contours_salzburg.geojson',
        hachures: 'hachures_salzburg.geojson',
        surface: '',
        locatons: '',
        clippoly: '',
        bordertx: '',
        water_tx: '',
        bbox3857: PPGeometry.bboxAtCenter([
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
                fonttype: 'noto_serif________regular',
                idxvalid: (index: number) => index === 1,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Sankt Sebastianfriedhof',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                fonttype: 'noto_serif________regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            }
        ]
    }

    static MAP_DEF______HALLEIN: IMapDef = {
        shadeMin: 400,
        magnNord: 4.50,
        contours: 'contours_hallein.geojson',
        hachures: 'hachures_hallein.geojson',
        surface: 'surface_hallein.json',
        clippoly: 'clippoly_hallein.geojson',
        bordertx: 'bordertx_hallein.geojson',
        locatons: '',
        water_tx: '',
        bbox3857: PPGeometry.bboxAtCenter([
            1459300,
            6053250
        ],
            2815 * 2.25,
            3800 * 2.25
        ),
        padding: 200,
        labelDefs: [
            {
                tileName: '450',
                plotName: '450',
                distance: 0.65,
                vertical: 16,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'HALLEIN_OBERALM',
                plotName: 'HALLEIN',
                distance: 0.04,
                vertical: 60,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'OBERALM_HALLEIN',
                plotName: 'OBERALM',
                distance: 0.04,
                vertical: -14,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'OBERALM_ADNET',
                plotName: '',
                distance: 0.33,
                vertical: 0,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'ADNET_OBERALM',
                plotName: '',
                distance: 0.33,
                vertical: 0,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'HALLEIN_KUCHL',
                plotName: '',
                distance: 0.33,
                vertical: 0,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'KUCHL_HALLEIN',
                plotName: '',
                distance: 0.33,
                vertical: 0,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'HALLEIN_ADNET',
                plotName: 'ADNET',
                distance: 0.35,
                vertical: 60,
                charsign: -1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'ADNET_HALLEIN',
                plotName: 'HALLEIN',
                distance: 0.335,
                vertical: -14,
                charsign: -1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'HALLEIN_VIGAUN',
                plotName: '',
                distance: 0.267,
                vertical: 0,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'VIGAUN_HALLEIN',
                plotName: '',
                distance: 0.26,
                vertical: 0,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'ADNET_VIGAUN',
                plotName: 'ADNET',
                distance: 0.76,
                vertical: -14,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'VIGAUN_ADNET',
                plotName: 'VIGAUN',
                distance: 0.75,
                vertical: 60,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'KUCHL_VIGAUN',
                plotName: 'KUCHL',
                distance: 0.54,
                vertical: 58,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'VIGAUN_KUCHL',
                plotName: 'VIGAUN',
                distance: 0.52,
                vertical: -14,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'DEUTSCHLAND',
                plotName: 'GERMANY',
                distance: 0.34,
                vertical: 80,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION * 1.25,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'ÖSTERREICH',
                plotName: 'AUSTRIA',
                distance: 0.38,
                vertical: -24,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION * 1.25,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => true,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Hallein',
                plotName: 'Hallein',
                distance: 330,
                vertical: 0,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'buff'
                }
            },
            {
                tileName: 'Leprosenhauskapelle',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Tauglmaut Siedlung',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Vigaun',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Fischpointleiten',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Grubbauern Siedlung',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Harreis',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Samhofkapelle',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Stiglippen',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Kahlsperg',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Oberalm',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Motzensiedlung',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Guglhaide',
                plotName: 'Guglhaide',
                distance: 80,
                vertical: 140,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Mitterau',
                plotName: 'Mitterau',
                distance: 200,
                vertical: -70,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Neualm',
                plotName: 'Neualm',
                distance: 170,
                vertical: -20,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Adneter Gries',
                plotName: 'Adneter Gries',
                distance: -110,
                vertical: -40,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Gries',
                plotName: 'Gries',
                distance: 80,
                vertical: 80,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Hühnerau',
                plotName: 'Hühnerau',
                distance: 30,
                vertical: 90,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Burgfried',
                plotName: 'Burgfried',
                distance: -80,
                vertical: 40,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Salzwelten Hallein',
                plotName: 'Salzwelten Hallein',
                distance: -10,
                vertical: -150,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Keltendorf',
                plotName: 'Keltendorf',
                distance: -40,
                vertical: 130,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Winterstall',
                plotName: 'Winterstall',
                distance: 40,
                vertical: 40,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Plaick',
                plotName: 'Plaick',
                distance: 30,
                vertical: 90,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Stocker',
                plotName: 'Stocker',
                distance: 100,
                vertical: -30,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Langwies',
                plotName: 'Langwies',
                distance: 40,
                vertical: -100,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Bad Vigaun',
                plotName: 'Bad Vigaun',
                distance: 30,
                vertical: 60,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Bad Dürrnberg',
                plotName: 'Bad Dürrnberg',
                distance: 60,
                vertical: 10,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Seeleiten',
                plotName: 'Seeleiten',
                distance: -450,
                vertical: -20,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Tauglmaut',
                plotName: 'Tauglmaut',
                distance: 40,
                vertical: -30,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Gamp',
                plotName: 'Gamp',
                distance: 150,
                vertical: -10,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Gmerk',
                plotName: 'Gmerk',
                distance: 70,
                vertical: -20,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Kranzbichl',
                plotName: 'Kranzbichl',
                distance: -90,
                vertical: -120,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Gasting',
                plotName: 'Gasting',
                distance: 90,
                vertical: -20,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Wirtstaller',
                plotName: 'Wirtstaller',
                distance: -450,
                vertical: -90,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Sankt Margarethen',
                plotName: 'Sankt Margarethen',
                distance: -120,
                vertical: -70,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Lasterhub',
                plotName: 'Lasterhub',
                distance: -440,
                vertical: -40,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Obermaierhof',
                plotName: 'Obermaierhof',
                distance: 90,
                vertical: -30,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Untermaierhof',
                plotName: 'Untermaierhof',
                distance: 130,
                vertical: -20,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Adneter Riedl',
                plotName: 'Adneter Riedl',
                distance: 380,
                vertical: -90,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Haunsperg',
                plotName: 'Haunsperg',
                distance: 50,
                vertical: 60,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Hammer',
                plotName: 'Hammer',
                distance: 50,
                vertical: 70,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Adnet',
                plotName: 'Adnet',
                distance: 40,
                vertical: -30,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Sulzenbach',
                plotName: 'Sulzenbach',
                distance: 120,
                vertical: -40,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Lacknersiedlung',
                plotName: 'Lacknersiedlung',
                distance: -500,
                vertical: -50,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                fonttype: 'noto_serif___bold_regular',
                idxvalid: () => false,
                fillprop: {
                    type: 'none'
                }
            },
            {
                tileName: 'Salzach',
                plotName: 'Salzach',
                distance: 0.61,
                vertical: 35,
                charsign: 1.2,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_____WATER * 0.62,
                fonttype: 'noto_serif___bold__italic',
                idxvalid: (index: number) => index === 1,
                fillprop: {
                    type: 'none'
                }
            }
        ]
    }

    // static MAP_DEF_______VIGAUN: IMapDef = {
    //     contours: 'contours_vigaun.geojson',
    //     hachures: 'hachures_vigaun.geojson',
    //     surface: '',
    //     locatons: '',
    //     clippoly: '',
    //     bordertx: '',
    //     water_tx: '',
    //     bbox3857: PPGeometry.bboxAtCenter([
    //         1461800,
    //         6050920
    //     ],
    //         4000,
    //         2828
    //     ),
    //     padding: 200,
    //     labelDefs: [
    //         {
    //             tileName: 'Bad Vigaun',
    //             plotName: 'Bad Vigaun',
    //             distance: 130,
    //             vertical: 0,
    //             charsign: 1.02,
    //             fonttype: 'noto_serif________regular',
    //             txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
    //             idxvalid: () => false,
    //             fillprop: {
    //                 type: 'none'
    //             }
    //         },
    //         {
    //             tileName: 'Langwies',
    //             plotName: 'Langwies',
    //             distance: 60,
    //             vertical: -90,
    //             charsign: 1.02,
    //             fonttype: 'noto_serif________regular',
    //             txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
    //             idxvalid: () => false,
    //             fillprop: {
    //                 type: 'none'
    //             }
    //         },
    //         {
    //             tileName: 'Weinleiten',
    //             plotName: 'Weinleiten',
    //             distance: -40,
    //             vertical: 30,
    //             charsign: 1.02,
    //             fonttype: 'noto_serif________regular',
    //             txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
    //             idxvalid: () => false,
    //             fillprop: {
    //                 type: 'none'
    //             }
    //         },
    //         {
    //             tileName: 'Brettstein',
    //             plotName: 'Brettstein',
    //             distance: -50,
    //             vertical: -30,
    //             charsign: 1.02,
    //             fonttype: 'noto_serif________regular',
    //             txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
    //             idxvalid: () => false,
    //             fillprop: {
    //                 type: 'none'
    //             }
    //         },
    //         {
    //             tileName: 'Vigaun',
    //             plotName: '',
    //             distance: 0,
    //             vertical: 0,
    //             charsign: 0,
    //             txtscale: 0,
    //             fonttype: 'noto_serif________regular',
    //             idxvalid: () => false,
    //             fillprop: {
    //                 type: 'none'
    //             }
    //         },
    //         {
    //             tileName: 'Wirtstaller',
    //             plotName: '',
    //             distance: 0,
    //             vertical: 0,
    //             charsign: 0,
    //             txtscale: 0,
    //             fonttype: 'noto_serif________regular',
    //             idxvalid: () => false,
    //             fillprop: {
    //                 type: 'none'
    //             }
    //         },
    //         {
    //             tileName: 'Samhofkapelle',
    //             plotName: '',
    //             distance: 0,
    //             vertical: 0,
    //             charsign: 0,
    //             txtscale: 0,
    //             fonttype: 'noto_serif________regular',
    //             idxvalid: () => false,
    //             fillprop: {
    //                 type: 'none'
    //             }
    //         },
    //         {
    //             tileName: 'Salzach',
    //             plotName: 'Salzach',
    //             distance: 0.25,
    //             vertical: 24,
    //             charsign: 1.02,
    //             fonttype: 'noto_serif________regular',
    //             txtscale: MapDefs.DEFAULT_TEXT_SCALE_____WATER,
    //             idxvalid: (index: number) => index === 1,
    //             fillprop: {
    //                 type: 'none'
    //             }
    //         },
    //     ]
    // }

}