import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { IMapDef } from "./IMapDef"

export class MapDefs {

    static DEFAULT_TEXT_SCALE_LOCATION = 0.030;
    static DEFAULT_TEXT_SCALE____WATER = 0.035;

    static MAP_DEF_________TEST: IMapDef = {
        bbox3857: VectorTileGeometryUtil.bboxAtCenter([
            1726650,
            6173400
        ],
            4000,
            2828
        ),
        padding: 200,
        labelDefs: []
    }

    static MAP_DEF__DUERRNSTEIN: IMapDef = {
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
                tileName: 'Donau',
                plotName: 'Donau',
                distance: 0.17,
                vertical: 0,
                charsign: -1.1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE____WATER,
                idxvalid: (index: number) => index === 1
            },

        ]
    }

    static MAP_DEF_________1010: IMapDef = {
        bbox3857: VectorTileGeometryUtil.bboxAtCenter([
            1822430 + 4000 * 2,
            6141780 + 2828 * 1
        ],
            4000,
            2828
            // 400.0,
            // 282.8
        ),
        // bbox3857: [ // erster bezirk
        //     1820500, 6140200,
        //     1824500, 6143200
        // ],
        padding: 200,
        labelDefs: []
    }

    static MAP_DEF_________1200: IMapDef = {
        bbox3857: VectorTileGeometryUtil.bboxAtCenter([
            1822970,
            6144431
        ],
            4000,
            2828
        ),
        padding: 200,
        labelDefs: []
    }

    static MAP_DEF____HALLSTATT: IMapDef = {
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
                tileName: 'Hallstatt',
                plotName: 'Hallstatt',
                distance: 170,
                vertical: 120,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LOCATION,
                idxvalid: () => true
            },
            {
                tileName: 'Hallstätter See',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                idxvalid: () => false
            },
            {
                tileName: 'Traun',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                idxvalid: () => false
            }
        ]
    }

    static MAP_DEF_____HAINBURG: IMapDef = {
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
                txtscale: MapDefs.DEFAULT_TEXT_SCALE____WATER,
                idxvalid: (index: number) => index === 1
            },
            {
                tileName: 'Hainburg an der Donau',
                plotName: 'Hainburg',
                distance: 350,
                vertical: -160,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LOCATION,
                idxvalid: () => true
            }
        ]
    }

    static MAP_DEF____OLDDANUBE: IMapDef = {
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
                txtscale: MapDefs.DEFAULT_TEXT_SCALE____WATER,
                idxvalid: () => true
            },
            {
                tileName: 'Neue Donau',
                plotName: 'Neue Donau',
                distance: 0.15,
                vertical: 20,
                charsign: -1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE____WATER,
                idxvalid: () => true
            },
        ]
    }

    static MAP_DEF_____WOLFGANG: IMapDef = {
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
                idxvalid: () => false
            },
            {
                tileName: 'Au',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                idxvalid: () => false
            },
            {
                tileName: 'Auer',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                idxvalid: () => false
            },
            {
                tileName: 'Pointhäusl',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                idxvalid: () => false
            },
            {
                tileName: 'St. Wolfgang',
                plotName: 'St. Wolfgang',
                distance: 100,
                vertical: -30,
                charsign: 0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LOCATION,
                idxvalid: () => false
            },
            {
                tileName: 'WOLFGANGSEE',
                plotName: 'WOLFGANGSEE',
                distance: 0.25,
                vertical: 0,
                charsign: 0.8,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE____WATER * 1.5,
                idxvalid: () => true,
                geometry: [
                    [
                        13.439543460347924,
                        47.736844561911148
                    ],
                    [
                        13.441857650775541,
                        47.73590580155475
                    ],
                    [
                        13.443822794511297,
                        47.734753491991448
                    ],
                    [
                        13.445359004376982,
                        47.733292973176191
                    ],
                    [
                        13.4463706556089,
                        47.731780241805801
                    ],
                    [
                        13.447705975227615,
                        47.730272292448099
                    ],
                    [
                        13.44916819894819,
                        47.729182253179758
                    ],
                    [
                        13.451018241546583,
                        47.728214248566324
                    ],
                    [
                        13.4531551341815,
                        47.727442299353626
                    ],
                    [
                        13.45524339292526,
                        47.727107406991934
                    ]
                ]
            }
        ]
    }

    static MAP_DEF______BLUNTAU: IMapDef = {
        bbox3857: [
            1457000, 6034000,
            1460000, 6036000
        ],
        padding: 200,
        labelDefs: []
    }

    static MAP_DEF_____SALZBURG: IMapDef = {
        bbox3857: VectorTileGeometryUtil.bboxAtCenter([
            1452600,
            6073600
        ],
            4000,
            2828
        ),
        // bbox3857: [ // salzburg kleiner
        //     1451900, 6072700,
        //     1452700, 6073200
        // ],
        // bbox3857: [ // salzburg klein 1
        //     1451700, 6072250,
        //     1452900, 6073200
        // ],
        padding: 200,
        labelDefs: [
            {
                tileName: 'Salzach',
                plotName: 'Salzach',
                distance: 0.45,
                vertical: 23,
                charsign: -1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE____WATER,
                idxvalid: (index: number) => index === 1
            },
            {
                tileName: 'Sankt Sebastianfriedhof',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                idxvalid: () => false
            }
        ]
    }

    static MAP_DEF______HALLEIN: IMapDef = {
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
                tileName: 'Hallein',
                plotName: 'Hallein',
                distance: 50,
                vertical: -12,
                charsign: 1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LOCATION,
                idxvalid: () => false
            },
            {
                tileName: 'Mitterau',
                plotName: 'Mitterau',
                distance: -150,
                vertical: 20,
                charsign: 1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LOCATION,
                idxvalid: () => false
            },
            {
                tileName: 'Salzach',
                plotName: 'Salzach',
                distance: 0.060,
                vertical: -5,
                charsign: -1.1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE____WATER,
                idxvalid: () => true
            },
            {
                tileName: 'Leprosenhauskapelle',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                idxvalid: () => false
            }
        ]
    }

    static MAP_DEF_______VIGAUN: IMapDef = {
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
                distance: 40,
                vertical: -12,
                charsign: 1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LOCATION,
                idxvalid: () => false
            },
            {
                tileName: 'Langwies',
                plotName: 'Langwies',
                distance: 40,
                vertical: -90,
                charsign: 1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LOCATION,
                idxvalid: () => false
            },
            {
                tileName: 'Vigaun',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                idxvalid: () => false
            },
            {
                tileName: 'Wirtstaller',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                idxvalid: () => false
            },
            {
                tileName: 'Samhofkapelle',
                plotName: '',
                distance: 0,
                vertical: 0,
                charsign: 0,
                txtscale: 0,
                idxvalid: () => false
            },
            {
                tileName: 'Salzach',
                plotName: 'Salzach',
                distance: 0.25,
                vertical: 24,
                charsign: 1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE____WATER,
                idxvalid: (index: number) => index === 1
            },
        ]
    }

}