import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Button } from "@mui/material";
import * as turf from '@turf/turf';
import { Position } from "geojson";
import { createRef, useEffect, useState } from "react";
import { Map } from '../map/Map';
import { MapLayerBuildings } from "../map/MapLayerBuildings";
import { MapLayerFrame } from '../map/MapLayerFrame';
import { MapLayerRoads } from '../map/MapLayerRoads';
import { MapLayerLines } from '../map/MapLayerLines';
import { MapLayerMisc } from "../map/MapLayerMisc";
import { MapLayerWater } from '../map/MapLayerWater';
import { IVectorTileFeature } from '../protobuf/vectortile/IVectorTileFeature';
import { Uid } from '../util/Uid';
import { IVectorTileUrl } from '../vectortile/IVectorTileUrl';
import { VectorTileKey } from "../vectortile/VectorTileKey";
import MapLayerComponent, { IMapLayerComponentProps } from "./MapLayerComponent";
import { MapLayerWood } from '../map/MapLayerWood';



function MapComponent() {

    const canvasRef = createRef<HTMLCanvasElement>();
    const svgRef = createRef<SVGSVGElement>();
    const [map, setMap] = useState<Map>();
    const [mapLayerProps, setMapLayerProps] = useState<IMapLayerComponentProps[]>([]);

    useEffect(() => {

        console.debug('✨ building map component');

        const _map = new Map({

            // bbox3857: [ // most all of vienna
            //     1822000, 6141000,
            //     1827000, 6149000 // 9000, 10000
            // ],
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
            // bbox3857: [ // augarten
            //     1822000, 6143000,
            //     1825000, 6145000
            // ],
            // bbox3857: [ // 20. bezirk
            //     1825000, 6145000,
            //     1828000, 6146000
            // ],
            // bbox3857: [ // leopoldsberg
            //     1820635, 6149670,
            //     1822635, 6151670
            // ],
            // bbox3857: [ // salzburg
            //     1450600, 6072150,
            //     1454600, 6075150
            // ],
            bbox3857: [ // salzburg klein
                1451700, 6072250,
                1452900, 6073200
            ],
            // bbox3857: [ // st. wolfgang
            //     1496500, 6062382,
            //     1497500, 6064382
            // ],
            // bbox3857: [ // bluntau
            //     1457000, 6034000,
            //     1460000, 6036000
            // ],
            // bbox3857: [ // vigaun
            //     1461000, 6050039,
            //     1462500, 6052039
            // ],
            // bbox3857: [ // hallein
            //     1456152, 6052787,
            //     1459152, 6054787
            // ],
            // bbox3857: [ // vigaun klein
            //     1461000, 6050000,
            //     1461200, 6050200
            // ],
            // bbox3857: [ // lobau
            //     1822000, 6143000,
            //     1825000, 6145000
            // ],

            layers: [
                // {
                //     createLayerInstance: () => new MapLayerWater(Map.LAYER__NAME______WATER, {
                //         accepts: (vectorTileFeature: IVectorTileFeature) => {
                //             return vectorTileFeature.layerName === 'GEWAESSER_F_GEWF';
                //         }
                //     })
                // },
                // {
                //     createLayerInstance: () => new MapLayerMisc(Map.LAYER__NAME__GREENAREA, {
                //         accepts: (vectorTileFeature: IVectorTileFeature) => {
                //             return vectorTileFeature.layerName === 'NUTZUNG_L16_20' && vectorTileFeature.hasValue('_symbol', Map.SYMBOL_INDEX_GREENAREA); // Grünflächen :: 1,
                //         }
                //     }, [2, -2], 500, 'rgba(0, 127, 0, 0.10)')
                // },
                {
                    createLayerInstance: () => new MapLayerBuildings(Map.LAYER__NAME__BUILDINGS, {
                        accepts: (vectorTileFeature: IVectorTileFeature) => {
                            return vectorTileFeature.layerName === 'GEBAEUDE_F_GEBAEUDE';
                        }
                    })
                },
                // {
                //     createLayerInstance: () => new MapLayerLines(Map.LAYER__NAME_____TRACKS, {
                //         accepts: (vectorTileFeature: IVectorTileFeature) => {
                //             return (vectorTileFeature.layerName === 'GIP_OUTSIDE_L_GIP' && vectorTileFeature.hasValue('_symbol', 9, 14)) || vectorTileFeature.layerName === 'NATURBESTAND_L_NATURBESTAND_L' && vectorTileFeature.hasValue('_symbol', Map.SYMBOL_INDEX____TRACKS);
                //         }
                //     }, l => l.multiPolyline010)
                // },
                // {
                //     createLayerInstance: () => new MapLayerRoads(Map.LAYER__NAME______ROADS, {
                //         accepts: (vectorTileFeature: IVectorTileFeature) => {
                //             // const isGip = // || vectorTileFeature.layerName === 'GIP_INSIDE_L_GIP';
                //             return vectorTileFeature.layerName === 'GIP_L_GIP_144' || vectorTileFeature.layerName === 'GIP_BAUWERK_L_BRÜCKE';
                //         }
                //     }, false)
                // },
                // {
                //     createLayerInstance: () => new MapLayerRoads(Map.LAYER__NAME_____TUNNEL, {
                //         accepts: (vectorTileFeature: IVectorTileFeature) => {
                //             return vectorTileFeature.layerName === 'GIP_BAUWERK_L_TUNNEL_BRUNNENCLA';
                //         }
                //     }, true)
                // },
                // {
                //     createLayerInstance: () => new MapLayerLines(Map.LAYER__NAME__ELEVATE_A, {
                //         accepts: (vectorTileFeature: IVectorTileFeature) => {
                //             return (vectorTileFeature.layerName === 'AUSTRIA_HL_20_100_1000_HL');
                //         }
                //     }, l => l.multiPolyline005)
                // },

                {
                    createLayerInstance: () => new MapLayerFrame(Map.LAYER__NAME______FRAME, {
                        accepts: () => {
                            return false;
                        }
                    })
                },


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
                //     createLayerInstance: () => new MapLayerLabels(Map.LAYER__NAME_____LABELS, {
                //         accepts: (vectorTileFeature: IVectorTileFeature) => {
                //             return vectorTileFeature.layerName === 'GEONAMEN_P_GEONAMEN';
                //         }
                //     })
                // },
                // {
                //     createLayerInstance: () => new MapLayerWood(Map.LAYER__NAME_______WOOD, {
                //         accepts: (vectorTileFeature: IVectorTileFeature) => {
                //             return vectorTileFeature.layerName === 'NUTZUNG_L16_20' && vectorTileFeature.hasValue('_symbol', Map.SYMBOL_INDEX______WOOD); // Wald :: 3
                //         }
                //     })
                // },
                // {
                //     createLayerInstance: () => new MapLayerMisc(Map.LAYER__NAME_______MISC, {
                //         accepts: (vectorTileFeature: IVectorTileFeature) => {
                //             return vectorTileFeature.layerName === 'NUTZUNG_L16_20' && vectorTileFeature.hasValue('_symbol', Map.SYMBOL_INDEX______MISC); // Sonstiges :: 5
                //         }
                //     }, [2, -2], 100, 'rgba(0, 0, 0, 0.10)')
                // },


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

        const clip = (layerName: string, layerNameB: string, distance: number, options?: {
            skip005?: boolean;
            skip010?: boolean;
            skip030?: boolean;
            skip050?: boolean;
        }) => {
            console.log(`${layerName}, clipping to ${layerNameB}, ${distance.toFixed(2)}m`);
            _map.findLayerByName(layerName)?.clipToLayerMultipolygon(_map.findLayerByName(layerNameB)!, distance, options);
        }

        // TODO :: better loading strategy (start with finest, switch to coarse in case of failure)
        _map.load(vectorTileUrlBmapv, Map.LOD_16).then(() => {
            _map.load(vectorTileUrlBmapv, Map.LOD_15).then(() => {

                // _map.load(vectorTileUrlBmaph, Map.LOD_16).then(() => {
                // _map.load(vectorTileUrlBmaph, 15).then(() => {
                _map.load(vectorTileUrlBmaph, 14).then(() => {

                    _map.process().then(() => {

                        clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME__BUILDINGS, 6);
                        clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME______WATER, 6);
                        clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME______ROADS, 6);

                        clip(Map.LAYER__NAME______WATER, Map.LAYER__NAME______ROADS, 6); // remove water where roads pass over
                        clip(Map.LAYER__NAME______WATER, Map.LAYER__NAME_____TRACKS, 6); // remove water where tracks pass over

                        // clip(Map.LAYER__NAME______WATER, Map.LAYER__NAME_______MISC, 5); // remove water for misc (may have bridge outlines, does not work on the VIGAUN extent)
                        // clip(Map.LAYER__NAME_______MISC, Map.LAYER__NAME______ROADS, 5);

                        clip(Map.LAYER__NAME______ROADS, Map.LAYER__NAME__BUILDINGS, 6, {
                            skip010: true,
                            skip050: true
                        }); // remove road boundaries where a building boundary is nearby

                        clip(Map.LAYER__NAME______WATER, Map.LAYER__NAME______FRAME, 0);
                        clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME______FRAME, 0);
                        clip(Map.LAYER__NAME__BUILDINGS, Map.LAYER__NAME______FRAME, 0);
                        clip(Map.LAYER__NAME______ROADS, Map.LAYER__NAME______FRAME, 0);
                        clip(Map.LAYER__NAME_____TRACKS, Map.LAYER__NAME______FRAME, 0);
                        clip(Map.LAYER__NAME_____TUNNEL, Map.LAYER__NAME______FRAME, 0);
                        clip(Map.LAYER__NAME__ELEVATE_A, Map.LAYER__NAME______FRAME, 0);

                        // _map.findLayerByName(Map.LAYER__NAME______WATER)?.clip(_map.findLayerByName(Map.LAYER__NAME_____LABELS)!);
                        // _map.findLayerByName(Map.LAYER__NAME__BUILDINGS)?.clip(_map.findLayerByName(Map.LAYER__NAME_____LABELS)!);
                        // _map.findLayerByName(Map.LAYER__NAME______ROADS)?.clip(_map.findLayerByName(Map.LAYER__NAME_____LABELS)!);
                        // _map.findLayerByName(Map.LAYER__NAME__GREENAREA)?.clip(_map.findLayerByName(Map.LAYER__NAME_____LABELS)!);
                        // _map.findLayerByName(Map.LAYER__NAME_____TRACKS)?.clip(_map.findLayerByName(Map.LAYER__NAME_____LABELS)!);

                        setMap(_map);

                    });

                });
                // });
                // });

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
