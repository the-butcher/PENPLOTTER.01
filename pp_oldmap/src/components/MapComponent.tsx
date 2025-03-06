import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Button } from "@mui/material";
import * as turf from '@turf/turf';
import { Position } from "geojson";
import { createRef, useEffect, useState } from "react";
import { ISkipOptions } from '../map/ISkipOptions';
import { Map } from '../map/Map';
import { MapLayerBuildings } from "../map/MapLayerBuildings";
import { MapLayerFrame } from '../map/MapLayerFrame';
import { MapLayerLines } from '../map/MapLayerLines';
import { MapLayerMisc } from "../map/MapLayerMisc";
import { MapLayerPoints } from '../map/MapLayerPoints';
import { MapLayerRoads } from '../map/MapLayerRoads';
import { MapLayerTunnels } from '../map/MapLayerTunnels';
import { MapLayerWater } from '../map/MapLayerWater';
import { IVectorTileFeature } from '../protobuf/vectortile/IVectorTileFeature';
import { Uid } from '../util/Uid';
import { IVectorTileKey } from '../vectortile/IVectorTileKey';
import { IVectorTileUrl } from '../vectortile/IVectorTileUrl';
import { VectorTileKey } from "../vectortile/VectorTileKey";
import MapLayerComponent, { IMapLayerComponentProps } from "./MapLayerComponent";



function MapComponent() {

    const canvasRef = createRef<HTMLCanvasElement>();
    const svgRef = createRef<SVGSVGElement>();
    const [map, setMap] = useState<Map>();
    const [mapLayerProps, setMapLayerProps] = useState<IMapLayerComponentProps[]>([]);

    useEffect(() => {

        console.debug('✨ building map component');

        const _map = new Map({

            // bbox3857: [ // alte donau
            //     1828000, 6144000,
            //     1830000, 6146000
            // ],
            // bbox3857: [ // donaukanal / wien
            //     1823000, 6141000,
            //     1825000, 6143000
            // ],
            // bbox3857: [ // schulschiff (klein)
            //     1824000, 6147000,
            //     1825000, 6149000
            // ],
            // bbox3857: [ // erster bezirk
            //     1820500, 6140200,
            //     1824500, 6143200
            // ],
            // bbox3857: [ // 20. bezirk
            //     1825000, 6145000,
            //     1828000, 6146000
            // ],
            // bbox3857: [ // leopoldsberg
            //     1820635, 6149670,
            //     1822635, 6151670
            // ],
            bbox3857: [ // salzburg
                1450600, 6072150,
                1454600, 6075150
            ],
            // bbox3857: [ // salzburg klein 2
            //     1451600, 6073150,
            //     1452600, 6074150
            // ],
            // bbox3857: [ // salzburg klein 1
            //     1451700, 6072250,
            //     1452900, 6073200
            // ],
            // bbox3857: [ // salzburg kleiner
            //     1451900, 6072700,
            //     1452700, 6073200
            // ],
            // bbox3857: [ // st. wolfgang
            //     1495000, 6062382,
            //     1498000, 6064382
            // ],
            // bbox3857: [ // bluntau
            //     1457000, 6034000,
            //     1460000, 6036000
            // ],
            // bbox3857: [ // vigaun
            //     1459800, 6049450,
            //     1463800, 6052450
            // ],
            // bbox3857: [ // hallein
            //     1455600, 6052700,
            //     1459600, 6055700
            // ],
            // bbox3857: [ // lobau -> issues with small geometries ("holzhäuser" do not show, but are also in a strange resolution in original basemap)
            //     1834537, 6141225,
            //     1836537, 6143225
            // ],


            layers: [
                {
                    createLayerInstance: () => new MapLayerWater(Map.LAYER__NAME______WATER, {
                        accepts: (vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
                            return vectorTileKey.lod === 15 && vectorTileFeature.layerName === 'GEWAESSER_F_GEWF';
                        }
                    })
                },
                {
                    createLayerInstance: () => new MapLayerMisc(Map.LAYER__NAME__GREENAREA, {
                        accepts: (_vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
                            return vectorTileFeature.layerName === 'NUTZUNG_L16_20' && vectorTileFeature.hasValue('_symbol', Map.SYMBOL_INDEX_GREENAREA, Map.SYMBOL_INDEX___LEISURE);
                        }
                    }, [2, -2], 500, 'rgba(0, 127, 0, 0.10)')
                },
                {
                    createLayerInstance: () => new MapLayerMisc(Map.LAYER__NAME_______WOOD, {
                        accepts: (_vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
                            return vectorTileFeature.layerName === 'NUTZUNG_L16_20' && vectorTileFeature.hasValue('_symbol', Map.SYMBOL_INDEX______WOOD);
                        }
                    }, [2, -2], 500, 'rgba(0, 64, 0, 0.10)')
                },
                {
                    createLayerInstance: () => new MapLayerBuildings(Map.LAYER__NAME__BUILDINGS, {
                        accepts: (vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
                            return vectorTileKey.lod >= 15 && vectorTileFeature.layerName === 'GEBAEUDE_F_GEBAEUDE';
                        }
                    })
                },
                {
                    createLayerInstance: () => new MapLayerLines(Map.LAYER__NAME_____TRACKS, {
                        accepts: (_vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
                            return (vectorTileFeature.layerName === 'GIP_OUTSIDE_L_GIP' && vectorTileFeature.hasValue('_symbol', 9, 14)) || vectorTileFeature.layerName === 'NATURBESTAND_L_NATURBESTAND_L' && vectorTileFeature.hasValue('_symbol', Map.SYMBOL_INDEX____TRACKS);
                        }
                    }, l => l.multiPolyline010)
                },
                {
                    createLayerInstance: () => new MapLayerRoads(Map.LAYER__NAME______ROADS, {
                        accepts: (vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
                            // const isGip = // || vectorTileFeature.layerName === 'GIP_INSIDE_L_GIP';
                            return vectorTileKey.lod === 15 && (vectorTileFeature.layerName === 'GIP_L_GIP_144' || vectorTileFeature.layerName === 'GIP_BAUWERK_L_BRÜCKE');
                        }
                    })
                },
                {
                    createLayerInstance: () => new MapLayerTunnels(Map.LAYER__NAME_____TUNNEL, {
                        accepts: (vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
                            return vectorTileKey.lod === 15 && vectorTileFeature.layerName === 'GIP_BAUWERK_L_TUNNEL_BRUNNENCLA';
                        }
                    })
                },
                {
                    createLayerInstance: () => new MapLayerLines(Map.LAYER__NAME__ELEVATE_A, {
                        accepts: (vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
                            if (vectorTileKey.lod === 14 && vectorTileFeature.layerName === 'AUSTRIA_HL_20_100_1000_HL') {
                                // console.log(vectorTileFeature.getValue('_name'));
                                return true
                            }
                            return false;
                        }
                    }, l => l.multiPolyline005)
                },
                {
                    createLayerInstance: () => new MapLayerPoints(Map.LAYER__NAME_____CHURCH, { // GIPFEL_L09-20
                        accepts: (vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
                            return  vectorTileKey.lod === 14 && vectorTileFeature.layerName === 'GEONAMEN_P_KIRCHE_KAPELLE'
                        }
                    }, MapLayerPoints.createChurchSymbol)
                },
                {
                    createLayerInstance: () => new MapLayerPoints(Map.LAYER__NAME_____SUMMIT, {
                        accepts: (vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
                            return  vectorTileKey.lod === 14 && vectorTileFeature.layerName === 'GIPFEL_L09-20'
                        }
                    }, MapLayerPoints.createSummitSymbol)
                },
                {
                    createLayerInstance: () => new MapLayerFrame(Map.LAYER__NAME______FRAME, {
                        accepts: () => {
                            return false;
                        }
                    })
                },



                // {
                //     createLayerInstance: () => new MapLayerLabels(Map.LAYER__NAME_____LABELS, {
                //         accepts: (vectorTileFeature: IVectorTileFeature) => {
                //             if (vectorTileFeature.layerName === 'GEWAESSER_L_GEWL /label') {
                //                 return vectorTileFeature.getValue('_label_class')?.getValue() === 7
                //             } else {
                //                 return false;
                //             }
                //         }
                //     })
                // },
                // {
                //     createLayerInstance: () => new MapLayerLabels(Map.LAYER__NAME_____LABELS, {
                //         accepts: (vectorTileFeature: IVectorTileFeature) => {
                //             return vectorTileFeature.layerName === 'SIEDLUNG_P_SIEDLUNG'; //
                //         }
                //     })
                // },
                // {
                //     createLayerInstance: () => new MapLayerLines(Map.LAYER__NAME__ELEVATE_B, {
                //         accepts: (vectorTileFeature: IVectorTileFeature) => { // AUSTRIA_HL50_100_1000_smooth500m_HL
                //             if (vectorTileFeature.layerName === 'AUSTRIA_HL_20_100_1000_HL/label') {
                //                 return !!vectorTileFeature.getValue('_name')?.getValue();
                //             }
                //             return false;
                //         }
                //     }, l => l.multiPolyline05)
                // },

                // {
                //     createLayerInstance: () => new MapLayerWood(Map.LAYER__NAME_______WOOD, {
                //         accepts: (vectorTileFeature: IVectorTileFeature) => {
                //             return vectorTileFeature.layerName === 'NUTZUNG_L16_20' && vectorTileFeature.hasValue('_symbol', Map.SYMBOL_INDEX______WOOD); // Wald :: 3
                //         }
                //     })
                // }



            ]
        });

        // https://nbfleischer.int.vertigis.com/bmapv
        // https://mapsneu.wien.gv.at/basemapv/bmapv/3857
        const vectorTileUrlBmapv: IVectorTileUrl = {
            toUrl: tileKey => `https://nbfleischer.int.vertigis.com/bmapv/tile/${tileKey.lod}/${tileKey.row}/${tileKey.col}.pbf` // https://mapsneu.wien.gv.at/basemapv/bmapvhl/3857/tile
        };
        const vectorTileUrlBmaph: IVectorTileUrl = {
            toUrl: tileKey => `https://nbfleischer.int.vertigis.com/bmaph/tile/${tileKey.lod}/${tileKey.row}/${tileKey.col}.pbf` // https://mapsneu.wien.gv.at/basemapv/bmapvhl/3857/tile
        };

        const clip = (layerName: string, layerNameB: string, distance: number, options?: ISkipOptions) => {
            console.log(`${layerName}, clipping to ${layerNameB}, ${distance.toFixed(2)}m`);
            _map.findLayerByName(layerName)?.clipToLayerMultipolygon(_map.findLayerByName(layerNameB)!, distance, options);
        }

        // TODO :: better loading strategy (start with finest, switch to coarse in case of failure)
        _map.load(vectorTileUrlBmapv, Map.LOD_16).then(() => {
            _map.load(vectorTileUrlBmapv, Map.LOD_15).then(() => {
                _map.load(vectorTileUrlBmapv, 14).then(() => {

                    _map.load(vectorTileUrlBmaph, 14).then(() => {

                        _map.process().then(() => {

                            clip(Map.LAYER__NAME_______WOOD, Map.LAYER__NAME__GREENAREA, 6); // remove duplicates between greenarea and wood

                            clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME__BUILDINGS, 6);
                            clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME______WATER, 6);
                            clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME______ROADS, 6);
                            clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME_____CHURCH, 6);
                            clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME_____SUMMIT, 6);

                            clip(Map.LAYER__NAME______WATER, Map.LAYER__NAME______ROADS, 6); // remove water where roads pass over
                            clip(Map.LAYER__NAME______WATER, Map.LAYER__NAME_____TRACKS, 6); // remove water where tracks pass over

                            clip(Map.LAYER__NAME______ROADS, Map.LAYER__NAME__BUILDINGS, 2, {
                                skip005: true,
                                skip030: true
                            }); // remove road boundaries where a building boundary is nearby
                            clip(Map.LAYER__NAME______ROADS, Map.LAYER__NAME__BUILDINGS, 6, {
                                skip010: true,
                                skip050: true
                            }); // remove road boundaries where a building boundary is nearby
                            clip(Map.LAYER__NAME______ROADS, Map.LAYER__NAME_____CHURCH, 6);
                            clip(Map.LAYER__NAME______ROADS, Map.LAYER__NAME_____SUMMIT, 6);

                            clip(Map.LAYER__NAME______WATER, Map.LAYER__NAME______FRAME, 0);
                            clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME______FRAME, 0);
                            clip(Map.LAYER__NAME__BUILDINGS, Map.LAYER__NAME______FRAME, 0);
                            clip(Map.LAYER__NAME______ROADS, Map.LAYER__NAME______FRAME, 0);
                            clip(Map.LAYER__NAME_____TRACKS, Map.LAYER__NAME______FRAME, 0);
                            clip(Map.LAYER__NAME_____TUNNEL, Map.LAYER__NAME______FRAME, 0);
                            clip(Map.LAYER__NAME__ELEVATE_A, Map.LAYER__NAME______FRAME, 0);

                            clip(Map.LAYER__NAME__BUILDINGS, Map.LAYER__NAME_____CHURCH, 8, {
                                skipMlt: false
                            });
                            clip(Map.LAYER__NAME__BUILDINGS, Map.LAYER__NAME_____SUMMIT, 8, {
                                skipMlt: false
                            });
                            clip(Map.LAYER__NAME__BUILDINGS, Map.LAYER__NAME______FRAME, 0, {
                                skipMlt: false
                            });

                            _map.postProcess().then(() => {
                                setMap(_map);
                            });

                        });

                    });

                });
            });
        });

    }, []);


    useEffect(() => {

        console.log('⚙ updating map (map)', map);

        const canvas = canvasRef.current;

        if (canvas && map) {

            const coordinate3857ToCoordinateCanvas = (coordinate3857: Position): Position => {
                const x = (coordinate3857[0] - map.min3857Pos[0]) / VectorTileKey.lods[Map.LOD_15].resolution + 100;
                const y = (map.min3857Pos[1] - coordinate3857[1]) / VectorTileKey.lods[Map.LOD_15].resolution + 100;
                return [
                    x,
                    y
                ];
            };
            const coordinate4326ToCoordinateCanvas = (coordinate4326: Position): Position => {
                return coordinate3857ToCoordinateCanvas(turf.toMercator(coordinate4326));
            };

            const context = canvas.getContext('2d')!;
            context.fillStyle = 'white';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.strokeStyle = 'black';
            context.fillStyle = 'rgba(0,0,0,0.10)';
            context.lineWidth = 1;
            context.lineJoin = 'round';
            context.lineCap = 'round';

            map.drawToCanvas(context);

            const _mapLayerProps: IMapLayerComponentProps[] = [];
            map.layers.forEach(l => {
                _mapLayerProps.push({
                    id: l.name,
                    polylines005: l.multiPolyline005,
                    polylines010: l.multiPolyline010,
                    polylines030: l.multiPolyline030,
                    polylines050: l.multiPolyline050,
                    coordinate4326ToCoordinateCanvas
                });
            });
            setMapLayerProps(_mapLayerProps);

        }

    }, [map]);

    const exportSVG = () => {

        // https://stackoverflow.com/questions/60241398/how-to-download-and-svg-element-as-an-svg-file
        const svg = svgRef.current;

        if (svg) {

            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svg.style.width = `${svgRef.current.width}`;
            svg.style.height = `${svgRef.current.height}`;
            svg.style.maxWidth = `${svgRef.current.width}`;
            svg.style.maxHeight = `${svgRef.current.height}`;
            svg.style.transform = '';

            const outerSVG = svg!.outerHTML;

            svg.style.width = `${svgRef.current.width}`;
            svg.style.height = `${svgRef.current.height}`;
            svg.style.maxWidth = `${svgRef.current.width}`;
            svg.style.maxHeight = `${svgRef.current.height}`;

            const base64doc = btoa(unescape(encodeURIComponent(outerSVG)));
            const a = document.createElement('a');
            const e = new MouseEvent('click');
            a.download = `map_${Uid.random16()}.svg`;
            a.href = 'data:image/svg+xml;base64,' + base64doc;
            a.dispatchEvent(e);

        }

    };

    return (
        <div
            style={{
                width: '100%',
                height: '100%',

            }}
        >
            {
                map ? <canvas
                    ref={canvasRef}
                    style={{
                        backgroundColor: '#eeeeee',
                        width: `${map.tileDim15[0] * 1 * VectorTileKey.DIM}px`,
                        height: `${map.tileDim15[1] * 1 * VectorTileKey.DIM}px`,
                    }}
                    width={map.tileDim15[0] * VectorTileKey.DIM + 200}
                    height={map.tileDim15[1] * VectorTileKey.DIM + 200}
                /> : null
            }
            {
                map ? <svg
                    viewBox={`0, 0, ${map.tileDim15[0] * VectorTileKey.DIM + 200}, ${map.tileDim15[1] * VectorTileKey.DIM + 200}`}
                    ref={svgRef}
                    style={{
                        backgroundColor: '#eeeeee',
                        width: `${map.tileDim15[0] * 1 * VectorTileKey.DIM}px`,
                        height: `${map.tileDim15[1] * 1 * VectorTileKey.DIM}px`,
                    }}
                >
                    {
                        mapLayerProps.map(l => <MapLayerComponent key={l.id} {...l} />)
                    }

                </svg> : null
            }
            <Button
                sx={{
                    width: '200px',
                    marginLeft: '100px'
                }}
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<UploadFileIcon />}
                onClick={exportSVG}
            >download</Button>
        </div >
    );
}

export default MapComponent
