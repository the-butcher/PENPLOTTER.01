import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { IMapDef } from "./IMapDef"

export class MapDefs {


    static MAP_DEF_________TEST: IMapDef = {
        // bbox3857: VectorTileGeometryUtil.bboxAtCenter([
        //     1834000,
        //     6138000
        // ],
        //     5000,
        //     10000
        // ),
        bbox3857: [ // erster bezirk
            1820500, 6140200,
            1824500, 6143200
        ],
        padding: 200,
        labelDefs: []
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
                txtscale: 0.035,
                idxvalid: (index: number) => index === 1
            },
        ]
    }

    static MAP_DEF_DANUBE_CANAL: IMapDef = {
        bbox3857: [
            1823000, 6141000,
            1825000, 6143000
        ],
        padding: 200,
        labelDefs: [
            {
                tileName: 'Wienfluss',
                plotName: 'Wienfluss',
                distance: 0.27,
                vertical: 11,
                charsign: -1,
                txtscale: 0.022,
                idxvalid: (index: number) => {
                    return index === 2;
                }
            },
            {
                tileName: 'Donaukanal',
                plotName: 'Donaukanal',
                distance: 0.50,
                vertical: 11,
                charsign: -1,
                txtscale: 0.022,
                idxvalid: (index: number) => {
                    // console.log('index', index);
                    return index === 5;
                }
            }
        ]
    }

    static MAP_DEF____OLDDANUBE: IMapDef = {
        bbox3857: [
            1828000, 6144000,
            1830000, 6146000
        ],
        padding: 200,
        labelDefs: []
    }

    static MAP_DEF_____WOLFGANG: IMapDef = {
        bbox3857: [
            1494000, 6062000,
            1498000, 6065000
        ],
        padding: 1200,
        labelDefs: []
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
                txtscale: 0.035,
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
                tileName: 'Salzach',
                plotName: 'Salzach',
                distance: 0.35,
                vertical: 25,
                charsign: -1,
                txtscale: 0.04,
                idxvalid: (index: number) => index === 1
            },
            // {
            //     tileName: 'Kleine Salzach',
            //     plotName: 'Kleine Salzach',
            //     distance: 0.305,
            //     vertical: 12,
            //     charsign: 1,
            //     txtscale: 0.022,
            //     idxvalid: () => true
            // },
            // {
            //     tileName: 'Oberalm',
            //     plotName: 'Oberalm',
            //     distance: 0.02,
            //     vertical: 8,
            //     charsign: 1,
            //     txtscale: 0.022,
            //     idxvalid: () => true
            // },
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
                tileName: 'Salzach',
                plotName: 'Salzach',
                distance: 0.55,
                vertical: 25,
                charsign: -1,
                txtscale: 0.04,
                idxvalid: () => true
            },
            {
                tileName: 'Taugl Tennengau',
                plotName: 'Taugl',
                distance: 0.42,
                vertical: 25,
                charsign: -1,
                txtscale: 0.04,
                idxvalid: () => true
            }
        ]
    }

}