import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Button, List, Stack } from "@mui/material";
import * as turf from "@turf/turf";
import { Position } from "geojson";
import { createRef, useEffect, useRef, useState } from "react";
import { MapLayerBuildings } from "../map/building/MapLayerBuildings";
import { IClipDef } from "../map/clip/IClipDef";
import { IWorkerClipInput } from "../map/clip/IWorkerClipInput";
import { MapLayerFrame } from "../map/frame/MapLayerFrame";
import { MapLayerLines } from "../map/line/MapLayerLines";
import { MapLayerLineLabel } from "../map/linelabel/MapLayerLineLabel";
import { Map } from "../map/Map";
import { Maps } from "../map/Maps";
import { MapLayerPoints } from "../map/point/MapLayerPoints";
import { MapLayerPolygon } from "../map/polygon/MapLayerPolygon";
import { MapLayerRoads } from "../map/road/MapLayerRoads";
import { MapLayerTunnels } from "../map/tunnel/MapLayerTunnels";
import { MapLayerWater } from "../map/water/MapLayerWater";
import { IVectorTileFeature } from "../protobuf/vectortile/IVectorTileFeature";
import { Uid } from "../util/Uid";
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { IVectorTileUrl } from "../vectortile/IVectorTileUrl";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { VectorTileKey } from "../vectortile/VectorTileKey";
import { VectorTileLoader } from "../vectortile/VectorTileLoader";
import { IMapLayerProps } from "./IMapLayerProps";
import { TMapProcessing } from "./IMapProcessing";
import ListMapLayerComponent from "./ListMapLayerComponent";
import SvgMapLayerComponent from "./SvgMapLayerComponent";
import SvgRectangleComponent, { ISvgRectangleComponentProps } from "./SvgRectangleComponent";
import { IWorkerClipOutput } from "../map/clip/IWorkerClipOutput";


export interface ILoadableTileKey extends IVectorTileKey {
  vectorTileUrl: IVectorTileUrl;
  status: TMapProcessing;
}

function MapComponent() {

  const canvasRef = createRef<HTMLCanvasElement>();
  const svgRef = createRef<SVGSVGElement>();
  const drawToCanvasToRef = useRef<number>(-1);

  const [map, setMap] = useState<Map>();
  const [mapLayerProps, setMapLayerProps] = useState<IMapLayerProps[]>([]);
  const [mapRectangleProps, setMapRectangleProps] = useState<ISvgRectangleComponentProps[]>([]);
  const [loadableTileKeys, setLoadableTileKeys] = useState<ILoadableTileKey[]>([]);
  const [clipDefs] = useState<IClipDef[]>([ // , setClipDefs
    {
      layerNameDest: Map.LAYER__NAME_______WOOD,
      layerNameClip: Map.LAYER__NAME__GREENAREA,
      distance: 6,
      status: 'pending'
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
      layerNameClip: Map.LAYER__NAME______ROADS,
      distance: 6,
      status: 'pending'
    },
    {
      layerNameDest: Map.LAYER__NAME__GREENAREA,
      layerNameClip: Map.LAYER__NAME_____CHURCH,
      distance: 6,
      status: 'pending'
    },
    {
      layerNameDest: Map.LAYER__NAME__GREENAREA,
      layerNameClip: Map.LAYER__NAME_____SUMMIT,
      distance: 6,
      status: 'pending'
    },
    {
      layerNameDest: Map.LAYER__NAME_______WOOD,
      layerNameClip: Map.LAYER__NAME__BUILDINGS,
      distance: 6,
      status: 'pending'
    },
    {
      layerNameDest: Map.LAYER__NAME_______WOOD,
      layerNameClip: Map.LAYER__NAME______WATER,
      distance: 6,
      status: 'pending'
    },
    {
      layerNameDest: Map.LAYER__NAME_______WOOD,
      layerNameClip: Map.LAYER__NAME______ROADS,
      distance: 6,
      status: 'pending'
    },
    {
      layerNameDest: Map.LAYER__NAME_______WOOD,
      layerNameClip: Map.LAYER__NAME_____CHURCH,
      distance: 6,
      status: 'pending'
    },
    {
      layerNameDest: Map.LAYER__NAME_______WOOD,
      layerNameClip: Map.LAYER__NAME_____SUMMIT,
      distance: 6,
      status: 'pending'
    },
    {
      layerNameDest: Map.LAYER__NAME______WATER,
      layerNameClip: Map.LAYER__NAME______ROADS,
      distance: 6,
      status: 'pending'
    },
    {
      layerNameDest: Map.LAYER__NAME______WATER,
      layerNameClip: Map.LAYER__NAME_____TRACKS,
      distance: 6,
      status: 'pending'
    },
    {
      layerNameDest: Map.LAYER__NAME______ROADS,
      layerNameClip: Map.LAYER__NAME__BUILDINGS,
      distance: 3,
      status: 'pending',
      options: {
        skip005: true,
        skip030: true, // single line roads
      }
    }, // remove road boundaries where a building boundary is nearby
    {
      layerNameDest: Map.LAYER__NAME______ROADS,
      layerNameClip: Map.LAYER__NAME__BUILDINGS,
      distance: 8,
      status: 'pending',
      options: {
        skip010: true,
        skip050: true,
      }
    },
    {
      layerNameDest: Map.LAYER__NAME______ROADS,
      layerNameClip: Map.LAYER__NAME_____CHURCH,
      distance: 0,
      status: 'pending'
    },
    {
      layerNameDest: Map.LAYER__NAME______ROADS,
      layerNameClip: Map.LAYER__NAME_____SUMMIT,
      distance: 0,
      status: 'pending'
    },
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
      layerNameDest: Map.LAYER__NAME______ROADS,
      layerNameClip: Map.LAYER__NAME______FRAME,
      distance: 0,
      status: 'pending'
    },
    {
      layerNameDest: Map.LAYER__NAME_____TRACKS,
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

  ]);

  useEffect(() => {

    console.debug("✨ building map component");

    const _mapDef = Maps.MAP_DEF______HALLEIN;

    const _map = new Map({
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
      // bbox3857: [ // salzburg klein 2
      //     1451600, 6073150,
      //     1452600, 6074150
      // ],
      // bbox3857: [ // lobau -> issues with small geometries ("holzhäuser" do not show, but are also in a strange resolution in original basemap)
      //     1834537, 6141225,
      //     1836537, 6143225
      // ],
      bbox3857: _mapDef.bbox3857,
      padding: _mapDef.padding,

      layers: [
        {
          createLayerInstance: () =>
            new MapLayerWater(Map.LAYER__NAME______WATER, {
              accepts: (vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
                return (vectorTileKey.lod === 15 && vectorTileFeature.layerName === "GEWAESSER_F_GEWF");
              },
            }),
        },
        {
          createLayerInstance: () => new MapLayerLineLabel(Map.LAYER__NAME___RIVER_TX, {
            accepts: (_vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
              if (vectorTileFeature.layerName === 'GEWAESSER_L_GEWL /label') {
                return true;
              }
              return false;
            }
          }, _mapDef.labelDefs)
        },
        {
          createLayerInstance: () => new MapLayerPolygon(Map.LAYER__NAME__GREENAREA, {
            accepts: (_vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
              return vectorTileFeature.layerName === 'NUTZUNG_L16_20' && vectorTileFeature.hasValue('_symbol', Map.SYMBOL_INDEX_GREENAREA, Map.SYMBOL_INDEX___LEISURE);
            }
          }, [2, -2], 500)
        },
        {
          createLayerInstance: () => new MapLayerPolygon(Map.LAYER__NAME_______WOOD, {
            accepts: (_vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
              return vectorTileFeature.layerName === 'NUTZUNG_L16_20' && vectorTileFeature.hasValue('_symbol', Map.SYMBOL_INDEX______WOOD);
            }
          }, [2, -2], 500)
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
              return (vectorTileFeature.layerName === 'GIP_OUTSIDE_L_GIP' && vectorTileFeature.hasValue('_symbol', 9, 12, 14)) || vectorTileFeature.layerName === 'NATURBESTAND_L_NATURBESTAND_L' && vectorTileFeature.hasValue('_symbol', Map.SYMBOL_INDEX____TRACKS);
              // console.log(vectorTileFeature.getValue('_symbol'));
              // return (vectorTileFeature.layerName === 'GIP_OUTSIDE_L_GIP' && vectorTileFeature.hasValue('_symbol', 12) );
            }
          }, l => l.multiPolyline010)
        },
        {
          createLayerInstance: () => new MapLayerLines(Map.LAYER__NAME__SHIP_LINE, {
            accepts: (_vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
              // console.log(vectorTileFeature.getValue('_symbol'));
              return (vectorTileFeature.layerName === 'GIP_OUTSIDE_L_GIP' && vectorTileFeature.hasValue('_symbol', 15));
            }
          }, l => l.multiPolyline010, [12, 4])
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
                return true
              }
              return false;
            }
          }, l => l.multiPolyline005)
        },
        {
          createLayerInstance: () => new MapLayerLineLabel(Map.LAYER__NAME__ELEVATE_B, {
            accepts: (vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
              if (vectorTileKey.lod === 14 && vectorTileFeature.layerName === 'AUSTRIA_HL_20_100_1000_HL/label') { //  &&
                return true;
              }
              return false;
            }
          }, [])
        },
        {
          createLayerInstance: () => new MapLayerPoints(Map.LAYER__NAME_____SUMMIT, {
            accepts: (_vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
              return vectorTileFeature.layerName === 'GIPFEL_L09-20'
            }
          }, 'createSummitSymbol')
        },
        {
          createLayerInstance: () => new MapLayerPoints(Map.LAYER__NAME_____CHURCH, {
            accepts: (vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
              return vectorTileKey.lod === 14 && vectorTileFeature.layerName === 'GEONAMEN_P_KIRCHE_KAPELLE'
            }
          }, 'createChurchSymbol')
        },
        {
          createLayerInstance: () => new MapLayerLines(Map.LAYER__NAME_____BORDER, {
            accepts: (_vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
              return (vectorTileFeature.layerName === 'BEV_STAAT_L_STAATSGRENZE');
            }
          }, l => l.multiPolyline050)
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
        //             return vectorTileFeature.layerName === 'SIEDLUNG_P_SIEDLUNG'; //
        //         }
        //     })
        // },

      ],
    });

    setMap(_map);

    //         //     clip(Map.LAYER__NAME_______WOOD, Map.LAYER__NAME__GREENAREA, 6); // remove duplicates between greenarea and wood

    //         //     clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME__BUILDINGS, 6);
    //         //     clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME______WATER, 6);
    //         //     clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME______ROADS, 6);
    //         //     clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME_____CHURCH, 6);
    //         //     clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME_____SUMMIT, 6);

    //         //     clip(Map.LAYER__NAME_______WOOD, Map.LAYER__NAME__BUILDINGS, 6);
    //         //     clip(Map.LAYER__NAME_______WOOD, Map.LAYER__NAME______WATER, 6);
    //         //     clip(Map.LAYER__NAME_______WOOD, Map.LAYER__NAME______ROADS, 6);
    //         //     clip(Map.LAYER__NAME_______WOOD, Map.LAYER__NAME_____CHURCH, 6);
    //         //     clip(Map.LAYER__NAME_______WOOD, Map.LAYER__NAME_____SUMMIT, 6);

    //         //     clip(Map.LAYER__NAME______WATER, Map.LAYER__NAME______ROADS, 6); // remove water where roads pass over or nearby
    //         //     clip(Map.LAYER__NAME______WATER, Map.LAYER__NAME_____TRACKS, 6); // remove water where tracks pass over or nearby

    //         //     clip(
    //         //       Map.LAYER__NAME______ROADS,
    //         //       Map.LAYER__NAME__BUILDINGS,
    //         //       3,
    //         //       {
    //         //         skip005: true,
    //         //         skip030: true, // single line roads
    //         //       }
    //         //     ); // remove road boundaries where a building boundary is nearby
    //         //     clip(
    //         //       Map.LAYER__NAME______ROADS,
    //         //       Map.LAYER__NAME__BUILDINGS,
    //         //       8,
    //         //       {
    //         //         skip010: true,
    //         //         skip050: true,
    //         //       }
    //         //     ); // remove road boundaries where a building boundary is nearby, different threshold
    //         //     clip(Map.LAYER__NAME______ROADS, Map.LAYER__NAME_____CHURCH, 0); // prebuffered
    //         //     clip(Map.LAYER__NAME______ROADS, Map.LAYER__NAME_____SUMMIT, 0); // prebuffered

    //         //     clip(Map.LAYER__NAME______WATER, Map.LAYER__NAME______FRAME, 0);
    //         //     clip(Map.LAYER__NAME__GREENAREA, Map.LAYER__NAME______FRAME, 0);
    //         //     clip(Map.LAYER__NAME_______WOOD, Map.LAYER__NAME______FRAME, 0);
    //         //     clip(Map.LAYER__NAME__BUILDINGS, Map.LAYER__NAME______FRAME, 0);
    //         //     clip(Map.LAYER__NAME______ROADS, Map.LAYER__NAME______FRAME, 0);
    //         //     clip(Map.LAYER__NAME_____TRACKS, Map.LAYER__NAME______FRAME, 0);
    //         //     clip(Map.LAYER__NAME_____TUNNEL, Map.LAYER__NAME______FRAME, 0);
    //         //     clip(Map.LAYER__NAME__ELEVATE_A, Map.LAYER__NAME______FRAME, 0);

    //         //     clip(Map.LAYER__NAME__BUILDINGS, Map.LAYER__NAME_____CHURCH, 0, {
    //         //       skipMlt: false,
    //         //     });
    //         //     clip(Map.LAYER__NAME__BUILDINGS, Map.LAYER__NAME_____SUMMIT, 0, { // prebuffered
    //         //       skipMlt: false,
    //         //     });
    //         //     clip(Map.LAYER__NAME__BUILDINGS, Map.LAYER__NAME______FRAME, 0, { // prebuffered
    //         //       skipMlt: false,
    //         //     });
    //         //     clip(Map.LAYER__NAME______WATER, Map.LAYER__NAME___RIVER_TX, 0, { // prebuffered
    //         //       skipMlt: false,
    //         //     });
    //         //     clip(Map.LAYER__NAME__ELEVATE_A, Map.LAYER__NAME__ELEVATE_B, 0); // prebuffered


  }, []);

  /**
   * react-hook for updates to the map
   */
  useEffect(() => {

    console.debug("⚙ updating map (map)", map);

    const canvas = canvasRef.current;
    const svg = svgRef.current;
    if (map && canvas && svg) {

      const coordinate3857ToCoordinateCanvas = (coordinate3857: Position): Position => {
        const x = (coordinate3857[0] - map.min3857Pos[0]) / VectorTileKey.lods[Map.LOD_14].resolution;
        const y = (map.min3857Pos[1] - coordinate3857[1]) / VectorTileKey.lods[Map.LOD_14].resolution;
        return [x, y];
      };

      const coordinate4326ToCoordinateCanvas = (coordinate4326: Position): Position => {
        return coordinate3857ToCoordinateCanvas(turf.toMercator(coordinate4326));
      };

      const context = canvas.getContext("2d")!;

      context.fillStyle = '#eeeeee';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // context.strokeStyle = "black";
      // context.fillStyle = "rgba(0, 0, 0, 0.10)";
      context.lineWidth = 1;
      context.lineJoin = "round";
      context.lineCap = "round";

      // map.drawToCanvas(context);

      const _mapLayerProps: IMapLayerProps[] = [];
      map.layers.forEach((l) => {
        _mapLayerProps.push({
          id: l.name,
          polylines005: l.multiPolyline005,
          polylines010: l.multiPolyline010,
          polylines030: l.multiPolyline030,
          polylines050: l.multiPolyline050,
          coordinate4326ToCoordinateCanvas,
          status: {
            tile: 'pending',
            poly: 'pending',
            line: 'pending',
            clip: 'pending',
            plot: 'pending'
          }
        });
      });
      setMapLayerProps(_mapLayerProps);

      const _mapRectangleProps: ISvgRectangleComponentProps[] = [];
      _mapRectangleProps.push({
        id: 'bboxclp',
        bbox: map.getBBoxClp4326(),
        stroke: 'rgba(255, 0, 0, 0.5)',
        strokeDasharray: 6,
        penWidth: 0.1,
        coordinate4326ToCoordinateCanvas
      });
      _mapRectangleProps.push({
        id: 'bboxmap',
        bbox: map.getBBoxMap4326(),
        stroke: 'rgba(0, 170, 0, 0.5)',
        strokeDasharray: 6,
        penWidth: 0.1,
        coordinate4326ToCoordinateCanvas
      });

      const _loadableTileKeys: ILoadableTileKey[] = [];
      const collectTiles = (lod: number, vectorTileUrl: IVectorTileUrl) => {

        const minTileKey = map.getMinTileKey(lod);
        const maxTileKey = map.getMaxTileKey(lod);

        for (let row = minTileKey.row; row <= maxTileKey.row; row++) {
          for (let col = minTileKey.col; col <= maxTileKey.col; col++) {
            const drawKeyMin = {
              lod,
              col,
              row,
            };
            _loadableTileKeys.push({
              ...drawKeyMin,
              vectorTileUrl,
              status: 'pending'
            });
          }
        }
      }

      const vectorTileUrlBmapv: IVectorTileUrl = {
        toUrl: (tileKey) => `https://nbfleischer.int.vertigis.com/bmapv/tile/${tileKey.lod}/${tileKey.row}/${tileKey.col}.pbf`
      };
      const vectorTileUrlBmaph: IVectorTileUrl = {
        toUrl: (tileKey) => `https://nbfleischer.int.vertigis.com/bmaph/tile/${tileKey.lod}/${tileKey.row}/${tileKey.col}.pbf`
      };

      collectTiles(Map.LOD_16, vectorTileUrlBmapv);
      collectTiles(Map.LOD_15, vectorTileUrlBmapv);
      collectTiles(Map.LOD_14, vectorTileUrlBmapv);
      collectTiles(Map.LOD_14, vectorTileUrlBmaph);

      // build rectangle props for each loadable tile
      _loadableTileKeys.forEach(_loadableTileKey => {

        const drawKeyMin = _loadableTileKey;
        const drawKeyMax = {
          lod: _loadableTileKey.lod,
          col: _loadableTileKey.col + 1,
          row: _loadableTileKey.row + 1,
        };

        const ul3857Pos = turf.toWgs84(VectorTileGeometryUtil.toMercator(drawKeyMin));
        const lr3857Pos = turf.toWgs84(VectorTileGeometryUtil.toMercator(drawKeyMax));

        _mapRectangleProps.push({
          id: _loadableTileKey.vectorTileUrl.toUrl(_loadableTileKey), //  `t_${drawKeyMin.lod}_${drawKeyMin.col}_${drawKeyMin.row}`,
          bbox: [
            ul3857Pos[0],
            lr3857Pos[1],
            lr3857Pos[0],
            ul3857Pos[1]
          ],
          stroke: 'rgba(0, 0, 0, 0.5)',
          penWidth: 0.02,
          coordinate4326ToCoordinateCanvas
        });

      });

      setMapRectangleProps(_mapRectangleProps);
      setLoadableTileKeys(_loadableTileKeys);

    }

  }, [map]);

  useEffect(() => {

    console.debug("⚙ updating map (loadableTileKeys)", loadableTileKeys);

    // check if there are any pending tiles
    const loadableTileKey = loadableTileKeys.find(k => k.status === 'pending');
    if (loadableTileKey) {

      loadableTileKey.status = 'working'
      window.setTimeout(() => {
        loadTile(loadableTileKey);
      }, 10);

    }

    // update tile status of mapLayerProps
    const _mapLayerProps: IMapLayerProps[] = mapLayerProps.map(p => {
      return {
        ...p,
        status: {
          ...p.status,
          tile: loadableTileKey ? 'working' : 'success'
        }
      }
    });

    // will update svg display
    setMapLayerProps(_mapLayerProps);
    updateMapRectangleProps();

  }, [loadableTileKeys]);

  useEffect(() => {

    console.debug("⚙ updating map (mapLayerProps)", mapLayerProps);

    if (mapLayerProps.length > 0) {

      window.clearTimeout(drawToCanvasToRef.current);
      drawToCanvasToRef.current = window.setTimeout(() => {

        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d")!;

        context.fillStyle = '#eeeeee';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.lineWidth = 1;
        context.lineJoin = "round";
        context.lineCap = "round";

        map?.drawToCanvas(context);

      }, 500);

      // check if there is more tile loading to be fonw
      const hasPendingTileLayer = mapLayerProps.some(p => p.status.tile !== 'success');
      if (!hasPendingTileLayer) {

        // check if any processing is going on
        const hasProcessingLayer = mapLayerProps.some(p => (p.status.poly === 'working' || p.status.line === 'working' || p.status.clip === 'working' || p.status.plot === 'working'));
        // const hasProcessingClip = clipDefs.some(p => (p.status === 'working'));
        if (!hasProcessingLayer) { //  && !hasProcessingClip

          const processablePolyLayer = mapLayerProps.find(p => p.status.poly === 'pending');
          if (processablePolyLayer) {

            const _mapLayerProps: IMapLayerProps[] = [...mapLayerProps];
            for (let i = 0; i < _mapLayerProps.length; i++) {
              if (_mapLayerProps[i].id === processablePolyLayer.id) {
                _mapLayerProps[i].status.poly = 'working';
              }
            }
            setMapLayerProps(_mapLayerProps);

            // delayed trigger of processing gives a chance to update map a bit further down
            window.setTimeout(() => {
              processPolyLayer(processablePolyLayer);
            }, 10);

          } else {

            const processableLineLayer = mapLayerProps.find(p => p.status.line === 'pending');
            if (processableLineLayer) {

              const _mapLayerProps: IMapLayerProps[] = [...mapLayerProps];
              for (let i = 0; i < _mapLayerProps.length; i++) {
                if (_mapLayerProps[i].id === processableLineLayer.id) {
                  _mapLayerProps[i].status.line = 'working';
                }
              }
              setMapLayerProps(_mapLayerProps);

              // delayed trigger of processing gives a chance to update map a bit further down
              window.setTimeout(() => {
                processLineLayer(processableLineLayer);
              }, 10);

            } else {

              const processableClip = clipDefs.find(c => c.status === 'pending');
              if (processableClip) {

                const _mapLayerProps: IMapLayerProps[] = [...mapLayerProps];
                for (let i = 0; i < _mapLayerProps.length; i++) {
                  if (_mapLayerProps[i].id === processableClip.layerNameDest || _mapLayerProps[i].id === processableClip.layerNameClip) {
                    _mapLayerProps[i].status.clip = 'working';
                  }
                }
                setMapLayerProps(_mapLayerProps);

                processableClip.status = 'working';
                processClip(processableClip);

              } else {

                const _mapLayerProps: IMapLayerProps[] = [...mapLayerProps];
                for (let i = 0; i < _mapLayerProps.length; i++) {
                  _mapLayerProps[i].status.clip = 'success';
                }

                const processablePlotLayer = mapLayerProps.find(p => p.status.plot === 'pending');
                if (processablePlotLayer) {

                  for (let i = 0; i < _mapLayerProps.length; i++) {
                    if (_mapLayerProps[i].id === processablePlotLayer.id) {
                      _mapLayerProps[i].status.plot = 'working';
                    }
                  }
                  setMapLayerProps(_mapLayerProps);

                  // TODO :: process plot

                }

              }

            }

          }

        }

      }

    }

  }, [mapLayerProps]);

  const processClip = (processableClip: IClipDef) => {

    const layerDest = map!.findLayerByName(processableClip.layerNameDest);
    const layerClip = map!.findLayerByName(processableClip.layerNameClip);
    if (layerDest && layerClip) {

      console.log(`${processableClip.layerNameDest}, clipping to ${processableClip.layerNameClip}, ${processableClip.distance.toFixed(2)}m`);

      const workerInput: IWorkerClipInput = {
        multiPolyline005Dest: layerDest.multiPolyline005,
        multiPolyline010Dest: layerDest.multiPolyline010,
        multiPolyline030Dest: layerDest.multiPolyline030,
        multiPolyline050Dest: layerDest.multiPolyline050,
        polyDataDest: layerDest.polyData,
        polyDataClip: layerClip.polyData,
        distance: processableClip.distance,
        options: processableClip.options
      };

      const promise = new Promise<void>((resolve) => { // , reject
        const workerInstance = new Worker(new URL('../map/clip/worker_clip________misc.ts', import.meta.url), { type: 'module' });
        workerInstance.onmessage = (e) => {
          const workerOutput: IWorkerClipOutput = e.data;
          layerDest.multiPolyline005 = workerOutput.multiPolyline005Dest;
          layerDest.multiPolyline010 = workerOutput.multiPolyline010Dest;
          layerDest.multiPolyline030 = workerOutput.multiPolyline030Dest;
          layerDest.multiPolyline050 = workerOutput.multiPolyline050Dest;
          layerDest.polyData = workerOutput.polyDataDest;
          resolve();
        };
        workerInstance.postMessage(workerInput);
      });

      promise.then(() => {

        processableClip.status = 'success';

        const _mapLayerProps: IMapLayerProps[] = [...mapLayerProps];
        for (let i = 0; i < _mapLayerProps.length; i++) {
          _mapLayerProps[i].status.clip = 'pending';
        }
        setMapLayerProps(_mapLayerProps);

      });

    }

  }

  const processPolyLayer = (processablePolyLayer: IMapLayerProps) => {

    const mapLayer = map?.findLayerByName(processablePolyLayer.id);
    if (mapLayer) {

      mapLayer.processPoly(map!.getBBoxClp4326(), map!.getBBoxMap4326()).then(() => {

        const _mapLayerProps: IMapLayerProps[] = [...mapLayerProps];
        for (let i = 0; i < _mapLayerProps.length; i++) {
          if (_mapLayerProps[i].id === processablePolyLayer.id) {
            _mapLayerProps[i].status.poly = 'success';
          }
        }
        setMapLayerProps(_mapLayerProps);

      });

    } else {
      console.warn(`failed to find layer for poly processing`, processablePolyLayer.id);
    }

  }

  const processLineLayer = (processableLineLayer: IMapLayerProps) => {

    const mapLayer = map?.findLayerByName(processableLineLayer.id);
    if (mapLayer) {

      mapLayer.processLine(map!.getBBoxClp4326(), map!.getBBoxMap4326()).then(() => {

        const _mapLayerProps: IMapLayerProps[] = [...mapLayerProps];
        for (let i = 0; i < _mapLayerProps.length; i++) {
          if (_mapLayerProps[i].id === processableLineLayer.id) {
            _mapLayerProps[i].status.line = 'success';
          }
        }
        setMapLayerProps(_mapLayerProps);

      });

    } else {
      console.warn(`failed to find layer for line processing`, processableLineLayer.id);
    }

  }

  const updateMapRectangleProps = () => {

    const _mapRectangleProps: ISvgRectangleComponentProps[] = [...mapRectangleProps];
    for (let i = 0; i < loadableTileKeys.length; i++) {
      const loadableUrl = loadableTileKeys[i].vectorTileUrl.toUrl(loadableTileKeys[i]);
      const mapRectangle = mapRectangleProps.find(r => r.id === loadableUrl);
      if (mapRectangle) {
        mapRectangle.penWidth = loadableTileKeys[i].status === 'working' ? 0.2 : 0.02;
      }
    }
    setMapRectangleProps(_mapRectangleProps);

  }

  const loadTile = async (loadableTileKey: ILoadableTileKey) => {

    loadableTileKey.status = 'working';
    const tileLoader = new VectorTileLoader(loadableTileKey.vectorTileUrl);
    tileLoader.load(loadableTileKey).then(vectorTile => {

      // apply tile data to layers
      vectorTile.layers.forEach((vectorTileLayer) => {
        vectorTileLayer.features.forEach((vectorTileFeature) => {
          map!.layers.forEach(async (layer) => {
            if (layer.accepts(loadableTileKey, vectorTileFeature)) {
              await layer.accept(vectorTile.tileKey, vectorTileFeature);
            }
          });
        });
      });

      // set the appropriate loadable tile status to success
      const _loadableTileKeys: ILoadableTileKey[] = [...loadableTileKeys];
      const loadableUrlA = loadableTileKey.vectorTileUrl.toUrl(loadableTileKey);
      for (let i = 0; i < loadableTileKeys.length; i++) {
        const loadableUrlB = loadableTileKeys[i].vectorTileUrl.toUrl(loadableTileKeys[i]);
        if (loadableUrlA === loadableUrlB) {
          _loadableTileKeys[i].status = 'success'
        }
      }
      setLoadableTileKeys(_loadableTileKeys);

    });

  }

  const exportSVG = () => {

    // https://stackoverflow.com/questions/60241398/how-to-download-and-svg-element-as-an-svg-file
    const svg = svgRef.current;

    if (svg) {
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svg.style.width = `${svgRef.current.width}`;
      svg.style.height = `${svgRef.current.height}`;
      svg.style.maxWidth = `${svgRef.current.width}`;
      svg.style.maxHeight = `${svgRef.current.height}`;
      svg.style.transform = "";

      const outerSVG = svg!.outerHTML;

      svg.style.width = `${svgRef.current.width}`;
      svg.style.height = `${svgRef.current.height}`;
      svg.style.maxWidth = `${svgRef.current.width}`;
      svg.style.maxHeight = `${svgRef.current.height}`;

      const base64doc = btoa(unescape(encodeURIComponent(outerSVG)));
      const a = document.createElement("a");
      const e = new MouseEvent("click");
      a.download = `map_${Uid.random16()}.svg`;
      a.href = "data:image/svg+xml;base64," + base64doc;
      a.dispatchEvent(e);
    }

  };

  const upscale = 1;

  return (
    <Stack spacing={2} direction={'row'}>

      <Stack direction={'column'}>
        <List dense={true} sx={{ width: '100%', maxWidth: 300, bgcolor: 'background.paper' }}>
          {mapLayerProps.map((l) => (
            <ListMapLayerComponent key={l.id} {...l} />
          ))}

        </List>
        <div
          style={{
            flexGrow: 2
          }}
        />
        <Button
          sx={{
            padding: '12px'
          }}
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<UploadFileIcon />}
          onClick={exportSVG}
        >
          download
        </Button>
      </Stack>

      <div
        style={{
          display: 'grid'
        }}
      >

        {map ? (
          <canvas
            ref={canvasRef}
            style={{
              backgroundColor: "#eeeeee",
              minWidth: `${map.tileDim14[0] * upscale * VectorTileKey.DIM}px`,
              minHeight: `${map.tileDim14[1] * upscale * VectorTileKey.DIM}px`,
              gridColumn: 1,
              gridRow: 1
            }}
            width={map.tileDim14[0] * VectorTileKey.DIM}
            height={map.tileDim14[1] * VectorTileKey.DIM}
          />
        ) : null}

        {map ? (
          <svg
            viewBox={`0, 0, ${map.tileDim14[0] * VectorTileKey.DIM}, ${map.tileDim14[1] * VectorTileKey.DIM}`}
            ref={svgRef}
            style={{
              position: 'relative',
              minWidth: `${map.tileDim14[0] * upscale * VectorTileKey.DIM}px`,
              minHeight: `${map.tileDim14[1] * upscale * VectorTileKey.DIM}px`,
              gridColumn: 1,
              gridRow: 1
            }}
          >
            {mapRectangleProps.map((l) => (
              <SvgRectangleComponent key={l.id} {...l} />
            ))}
            {mapLayerProps.map((l) => (
              <SvgMapLayerComponent key={l.id} {...l} />
            ))}
          </svg>
        ) : null}

      </div>




    </Stack>

  );
}

export default MapComponent;
