import { IMapDef } from "./IMapDef"

export class Maps {

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
                distance: 0.20,
                vertical: 11,
                charsign: -1,
                txtscale: 0.035,
                idxvalid: (index: number) => {
                    return index === 3;
                }
            },
            {
                tileName: 'UG. [Donau]',
                plotName: '',
                distance: 0.20,
                vertical: 11,
                charsign: -1,
                txtscale: 0.035,
                idxvalid: () => {
                    return false;
                }
            },
            {
                tileName: 'Pfaffenbergweggraben',
                plotName: '',
                distance: 0.20,
                vertical: 11,
                charsign: -1,
                txtscale: 0.035,
                idxvalid: () => {
                    return false;
                }
            },
            {
                tileName: 'Hundsheimergraben',
                plotName: '',
                distance: 0.20,
                vertical: 11,
                charsign: -1,
                txtscale: 0.035,
                idxvalid: () => {
                    return false;
                }
            },
            {
                tileName: 'Westliche Runse',
                plotName: '',
                distance: 0.20,
                vertical: 11,
                charsign: -1,
                txtscale: 0.035,
                idxvalid: () => {
                    return false;
                }
            },
            {
                tileName: 'Östliche Runse',
                plotName: '',
                distance: 0.20,
                vertical: 11,
                charsign: -1,
                txtscale: 0.035,
                idxvalid: () => {
                    return false;
                }
            },
            {
                tileName: 'Runsen am Südhang des Braunsberges',
                plotName: '',
                distance: 0.20,
                vertical: 11,
                charsign: -1,
                txtscale: 0.035,
                idxvalid: () => {
                    return false;
                }
            }
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
        labelDefs: [
            {
                tileName: 'Dietelbach',
                plotName: '',
                distance: 0.50,
                vertical: 11,
                charsign: -1,
                txtscale: 0.022,
                idxvalid: () => {
                    return false;
                }
            },
            {
                tileName: 'Zinkenbach',
                plotName: '',
                distance: 0.50,
                vertical: 11,
                charsign: -1,
                txtscale: 0.022,
                idxvalid: () => {
                    return false;
                }
            },
            {
                tileName: 'Ischl',
                plotName: '',
                distance: 0.50,
                vertical: 11,
                charsign: -1,
                txtscale: 0.022,
                idxvalid: () => {
                    return false;
                }
            },
            {
                tileName: 'Appesbach',
                plotName: '',
                distance: 0.50,
                vertical: 11,
                charsign: -1,
                txtscale: 0.022,
                idxvalid: () => {
                    return false;
                }
            },
            {
                tileName: 'Dürstenbach',
                plotName: '',
                distance: 0.50,
                vertical: 11,
                charsign: -1,
                txtscale: 0.022,
                idxvalid: (index: number) => {
                    // console.log('index', index);
                    return index === 5;
                }
            },
            {
                tileName: 'Steingraben',
                plotName: '',
                distance: 0.50,
                vertical: 11,
                charsign: -1,
                txtscale: 0.022,
                idxvalid: (index: number) => {
                    // console.log('index', index);
                    return index === 5;
                }
            },
            {
                tileName: 'Moosbach-Wolfgangsee',
                plotName: '',
                distance: 0.50,
                vertical: 11,
                charsign: -1,
                txtscale: 0.022,
                idxvalid: (index: number) => {
                    // console.log('index', index);
                    return index === 5;
                }
            },
            {
                tileName: 'Laingraben',
                plotName: '',
                distance: 0.50,
                vertical: 11,
                charsign: -1,
                txtscale: 0.022,
                idxvalid: (index: number) => {
                    // console.log('index', index);
                    return index === 5;
                }
            },
            {
                tileName: 'Hubritzbach',
                plotName: '',
                distance: 0.50,
                vertical: 11,
                charsign: -1,
                txtscale: 0.022,
                idxvalid: (index: number) => {
                    // console.log('index', index);
                    return index === 5;
                }
            },
            {
                tileName: 'Laingraben Zubringer',
                plotName: '',
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
                idxvalid: () => true
            },
            {
                tileName: 'Kleine Salzach',
                plotName: 'Kleine Salzach',
                distance: 0.305,
                vertical: 12,
                charsign: 1,
                txtscale: 0.022,
                idxvalid: () => true
            },
            {
                tileName: 'Oberalm',
                plotName: 'Oberalm',
                distance: 0.02,
                vertical: 8,
                charsign: 1,
                txtscale: 0.022,
                idxvalid: () => true
            },
        ]
    }

    static MAP_DEF_______VIGAUN: IMapDef = {
        bbox3857: [
            1459800, 6049450,
            1463800, 6052450
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