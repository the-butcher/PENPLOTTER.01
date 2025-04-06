import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { IMapDef } from "./IMapDef"

export class MapDefs {

    static DEFAULT_TEXT_SCALE_LOCATION = 0.030;
    static DEFAULT_TEXT_SCALE____WATER = 0.035;

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

    // static MAP_DEF__DUERRNSTEIN: IMapDef = {
    //     bbox3857: VectorTileGeometryUtil.bboxAtCenter([
    //         1726700,
    //         6173400
    //     ],
    //         4000,
    //         2828
    //     ),
    //     padding: 200,
    //     labelDefs: [
    //         {
    //             tileName: 'Donau',
    //             plotName: 'Donau',
    //             distance: 0.17,
    //             vertical: 0,
    //             charsign: -1.1,
    //             txtscale: MapDefs.DEFAULT_TEXT_SCALE____WATER,
    //             idxvalid: (index: number) => index === 1
    //         },

    //     ]
    // }

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
        clippoly: '',
        bordertx: '',
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
                charsign: 1.0,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE____WATER * 1.5,
                fonttype: 'italic',
                idxvalid: () => true,
                geometry: [[13.65682209527194, 47.561546527424646], [13.656986018048356, 47.559806704497348], [13.656997467996199, 47.559694813565088], [13.657010725245687, 47.559583013298138], [13.657025788220512, 47.559471316990368], [13.657042655129649, 47.559359737923373], [13.657061323967602, 47.559248289364938], [13.657081792514603, 47.55913698456736], [13.657128118787069, 47.558914859177406], [13.657181611914584, 47.558693467403565], [13.657242246456173, 47.558472914548219], [13.657309993574456, 47.558253305516118], [13.65738482104936, 47.558034744764377], [13.657466693293435, 47.557817336252796], [13.657555571368793, 47.557601183394411], [13.657651413005615, 47.557386389006247], [13.657754172622266, 47.557173055260414], [13.657863801346956, 47.556961283635488], [13.657980247041001, 47.556751174868197], [13.658103454323609, 47.556542828905464], [13.658233364598221, 47.556336344856859], [13.658369916080384, 47.556131820947407], [13.658513043827124, 47.555929354470834], [13.658662679767847, 47.55572904174327], [13.658818752736703, 47.555530978057341], [13.658981188506433, 47.555335257636848], [13.659149909823675, 47.555141973591901], [13.6593248364457, 47.55495121787456], [13.65950588517858, 47.554763081235095], [13.659692969916753, 47.55457765317869], [13.659886001683965, 47.554395021922936], [13.660084888675611, 47.554215274355734], [13.660289536302361, 47.554038495993922], [13.660499847235183, 47.553864770942589], [13.660715721451606, 47.553694181854986], [13.660937056283297, 47.553526809893157], [13.661163746464895, 47.553362734689287], [13.662091507625703, 47.552705758483953]]
            }
        ]
    }

    // static MAP_DEF_____HAINBURG: IMapDef = {
    //     bbox3857: VectorTileGeometryUtil.bboxAtCenter([
    //         1885950,
    //         6131500
    //     ],
    //         4000,
    //         2828
    //     ),
    //     padding: 200,
    //     labelDefs: [
    //         {
    //             tileName: 'Donau',
    //             plotName: 'Donau',
    //             distance: 0.15,
    //             vertical: 8,
    //             charsign: -1,
    //             txtscale: MapDefs.DEFAULT_TEXT_SCALE____WATER,
    //             idxvalid: (index: number) => index === 1
    //         },
    //         {
    //             tileName: 'Hainburg an der Donau',
    //             plotName: 'Hainburg',
    //             distance: 350,
    //             vertical: -160,
    //             charsign: 0,
    //             txtscale: MapDefs.DEFAULT_TEXT_SCALE_LOCATION,
    //             idxvalid: () => true
    //         }
    //     ]
    // }

    static MAP_DEF____OLDDANUBE: IMapDef = {
        contours: 'contours_altedonau.geojson',
        hachures: 'hachures_altedonau.geojson',
        clippoly: '',
        bordertx: '',
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
                fonttype: 'italic',
                idxvalid: () => true
            },
            {
                tileName: 'Neue Donau',
                plotName: 'Neue Donau',
                distance: 0.15,
                vertical: 20,
                charsign: -1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE____WATER,
                fonttype: 'italic',
                idxvalid: () => true
            },
        ]
    }

    static MAP_DEF___BADGASTEIN: IMapDef = {
        contours: 'contours_badgastein.geojson',
        hachures: 'hachures_badgastein.geojson',
        clippoly: '',
        bordertx: '',
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

    // static MAP_DEF_____WOLFGANG: IMapDef = {
    //     bbox3857: VectorTileGeometryUtil.bboxAtCenter([
    //         1496000,
    //         6063500
    //     ],
    //         4000,
    //         2828
    //     ),
    //     padding: 1200,
    //     labelDefs: [
    //         {
    //             tileName: 'Markt',
    //             plotName: '',
    //             distance: 0,
    //             vertical: 0,
    //             charsign: 0,
    //             txtscale: 0,
    //             idxvalid: () => false
    //         },
    //         {
    //             tileName: 'Au',
    //             plotName: '',
    //             distance: 0,
    //             vertical: 0,
    //             charsign: 0,
    //             txtscale: 0,
    //             idxvalid: () => false
    //         },
    //         {
    //             tileName: 'Auer',
    //             plotName: '',
    //             distance: 0,
    //             vertical: 0,
    //             charsign: 0,
    //             txtscale: 0,
    //             idxvalid: () => false
    //         },
    //         {
    //             tileName: 'Pointhäusl',
    //             plotName: '',
    //             distance: 0,
    //             vertical: 0,
    //             charsign: 0,
    //             txtscale: 0,
    //             idxvalid: () => false
    //         },
    //         {
    //             tileName: 'St. Wolfgang',
    //             plotName: 'St. Wolfgang',
    //             distance: 100,
    //             vertical: -30,
    //             charsign: 0,
    //             txtscale: MapDefs.DEFAULT_TEXT_SCALE_LOCATION,
    //             idxvalid: () => false
    //         },
    //         {
    //             tileName: 'WOLFGANGSEE',
    //             plotName: 'WOLFGANGSEE',
    //             distance: 0.25,
    //             vertical: 0,
    //             charsign: 0.8,
    //             txtscale: MapDefs.DEFAULT_TEXT_SCALE____WATER * 1.5,
    //             idxvalid: () => true,
    //             geometry: [
    //                 [
    //                     13.439543460347924,
    //                     47.736844561911148
    //                 ],
    //                 [
    //                     13.441857650775541,
    //                     47.73590580155475
    //                 ],
    //                 [
    //                     13.443822794511297,
    //                     47.734753491991448
    //                 ],
    //                 [
    //                     13.445359004376982,
    //                     47.733292973176191
    //                 ],
    //                 [
    //                     13.4463706556089,
    //                     47.731780241805801
    //                 ],
    //                 [
    //                     13.447705975227615,
    //                     47.730272292448099
    //                 ],
    //                 [
    //                     13.44916819894819,
    //                     47.729182253179758
    //                 ],
    //                 [
    //                     13.451018241546583,
    //                     47.728214248566324
    //                 ],
    //                 [
    //                     13.4531551341815,
    //                     47.727442299353626
    //                 ],
    //                 [
    //                     13.45524339292526,
    //                     47.727107406991934
    //                 ]
    //             ]
    //         }
    //     ]
    // }

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
        clippoly: '',
        bordertx: '',
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
                txtscale: MapDefs.DEFAULT_TEXT_SCALE____WATER,
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
                txtscale: 0.022,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: 'DEUTSCHLAND',
                plotName: 'DEUTSCHLAND',
                distance: 0.78,
                vertical: -28,
                charsign: -1.1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LOCATION,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: 'ÖSTERREICH',
                plotName: 'ÖSTERREICH',
                distance: 0.78,
                vertical: 50,
                charsign: -1.1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LOCATION,
                fonttype: 'regular',
                idxvalid: () => true
            },
            {
                tileName: 'Hallein',
                plotName: 'Hallein',
                distance: 50,
                vertical: -12,
                charsign: 1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LOCATION,
                fonttype: 'regular',
                idxvalid: () => false
            },
            {
                tileName: 'Mitterau',
                plotName: 'Mitterau',
                distance: -150,
                vertical: 20,
                charsign: 1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LOCATION,
                fonttype: 'regular',
                idxvalid: () => false
            },
            {
                tileName: 'Adneter Gries',
                plotName: 'Adneter Gries',
                distance: 75,
                vertical: 60,
                charsign: 1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE_LOCATION,
                fonttype: 'regular',
                idxvalid: () => false
            },
            {
                tileName: 'Salzach',
                plotName: 'Salzach',
                distance: 0.060,
                vertical: -5,
                charsign: -1.1,
                txtscale: MapDefs.DEFAULT_TEXT_SCALE____WATER,
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

    // static MAP_DEF_______VIGAUN: IMapDef = {
    //     bbox3857: VectorTileGeometryUtil.bboxAtCenter([
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
    //             distance: 40,
    //             vertical: -12,
    //             charsign: 1,
    //             txtscale: MapDefs.DEFAULT_TEXT_SCALE_LOCATION,
    //             idxvalid: () => false
    //         },
    //         {
    //             tileName: 'Langwies',
    //             plotName: 'Langwies',
    //             distance: 40,
    //             vertical: -90,
    //             charsign: 1,
    //             txtscale: MapDefs.DEFAULT_TEXT_SCALE_LOCATION,
    //             idxvalid: () => false
    //         },
    //         {
    //             tileName: 'Vigaun',
    //             plotName: '',
    //             distance: 0,
    //             vertical: 0,
    //             charsign: 0,
    //             txtscale: 0,
    //             idxvalid: () => false
    //         },
    //         {
    //             tileName: 'Wirtstaller',
    //             plotName: '',
    //             distance: 0,
    //             vertical: 0,
    //             charsign: 0,
    //             txtscale: 0,
    //             idxvalid: () => false
    //         },
    //         {
    //             tileName: 'Samhofkapelle',
    //             plotName: '',
    //             distance: 0,
    //             vertical: 0,
    //             charsign: 0,
    //             txtscale: 0,
    //             idxvalid: () => false
    //         },
    //         {
    //             tileName: 'Salzach',
    //             plotName: 'Salzach',
    //             distance: 0.25,
    //             vertical: 24,
    //             charsign: 1,
    //             txtscale: MapDefs.DEFAULT_TEXT_SCALE____WATER,
    //             idxvalid: (index: number) => index === 1
    //         },
    //     ]
    // }

}