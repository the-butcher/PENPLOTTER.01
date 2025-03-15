import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { IMapDef } from "./IMapDef"

export class MapDefs {

    static DEFAULT_TEXT_SCALE_LOCATION = 0.030;
    static DEFAULT_TEXT_SCALE____WATER = 0.035;

    static MAP_DEF_________TEST: IMapDef = {
        bbox3857: [ // lobau -> issues with small geometries ("holzhäuser" do not show, but are also in a strange resolution in original basemap)
            1832600, 6139900,
            1836600, 6142900
        ],
        // bbox3857: [ // leopoldsberg
        //     1820635, 6149670,
        //     1822635, 6151670
        // ],
        padding: 200,
        labelDefs: []
    }

    static MAP_DEF_________1010: IMapDef = {
        bbox3857: [ // erster bezirk
            1820500, 6140200,
            1824500, 6143200
        ],
        padding: 200,
        labelDefs: []
    }

    static MAP_DEF____HALLSTATT: IMapDef = {
        bbox3857: VectorTileGeometryUtil.bboxAtCenter([
            1519500,
            6033700
        ],
            4000,
            3000
        ),
        padding: 1000,
        labelDefs: [
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
        bbox3857: [
            1883950, 6130000,
            1887950, 6133000
        ],
        padding: 200,
        labelDefs: [
            {
                tileName: 'Donau',
                plotName: 'Donau',
                distance: 0.25,
                vertical: 8,
                charsign: -1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE____WATER,
                idxvalid: (index: number) => index === 1
            },
        ]
    }

    static MAP_DEF____OLDDANUBE: IMapDef = {
        bbox3857: [
            1825800, 6143500,
            1829800, 6146500
        ],
        // bbox3857: [
        //     1825800, 6144500,
        //     1827200, 6145500
        // ],
        padding: 200,
        labelDefs: []
    }

    static MAP_DEF_____WOLFGANG: IMapDef = {
        bbox3857: [
            1494000, 6062000,
            1498000, 6065000
        ],
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
        bbox3857: [
            1450600, 6072150,
            1454600, 6075150
        ],
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
                idxvalid: () => true
            }
        ]
    }

    static MAP_DEF______HALLEIN: IMapDef = {
        bbox3857: [
            1455600, 6052700,
            1459600, 6055700
        ],
        padding: 200,
        labelDefs: [
            {
                tileName: 'Hallein',
                plotName: 'Hallein',
                distance: 40,
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
                distance: 0.08,
                vertical: 0,
                charsign: -1,
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
        bbox3857: [
            1459800, 6049460,
            1463800, 6052460
        ],
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
                tileName: 'Salzach',
                plotName: 'Salzach',
                distance: 0.50,
                vertical: 18,
                charsign: 1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE____WATER,
                idxvalid: (index: number) => index === 1
            },
        ]
    }

}