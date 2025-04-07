import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Button, Checkbox, FormControl, FormControlLabel, List, ListItem, ListItemText, Radio, RadioGroup, Stack } from "@mui/material";
import * as turf from "@turf/turf";
import { Position } from "geojson";
import { createRef, useEffect, useRef, useState } from "react";
import { MapLayerBuildings } from "../map/building/MapLayerBuildings";
import { ClipDefs } from "../map/clip/ClipDefs";
import { IClipDef } from "../map/clip/IClipDef";
import { MapLayerFrame } from "../map/frame/MapLayerFrame";
import { MapLayerLines } from "../map/line/MapLayerLines";
import { MapLayerLineLabel } from "../map/linelabel/MapLayerLineLabel";
import { Map } from "../map/Map";
import { MapDefs } from "../map/MapDefs";
import { MapLayerPoints } from "../map/point/MapLayerPoints";
import { MapLayerPolygon } from "../map/polygon/MapLayerPolygon";
import { MapLayerRoad2 } from "../map/road2/MapLayerRoad2";
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
import { MapLayerBridge2 } from "../map/road2/MapLayerBridge2";

export type TMapContainer = 'canvas' | 'svg';
export type TGeomentryType = 'polygon' | 'polyline';

export interface ILoadableTileKey extends IVectorTileKey {
  vectorTileUrl: IVectorTileUrl;
  status: TMapProcessing;
}

function MapComponent() {

  const canvasRef = createRef<HTMLCanvasElement>();
  const svgRef = createRef<SVGSVGElement>();
  const drawToCanvasToRef = useRef<number>(-1);

  const [map, setMap] = useState<Map>();

  const mapLayerPropsRef = useRef<IMapLayerProps[]>([]);
  const [mapLayerProps, setMapLayerProps] = useState<IMapLayerProps[]>(mapLayerPropsRef.current);

  const [mapRectangleProps, setMapRectangleProps] = useState<ISvgRectangleComponentProps[]>([]);
  const [loadableTileKeys, setLoadableTileKeys] = useState<ILoadableTileKey[]>([]);
  const [clipDefs] = useState<IClipDef[]>(ClipDefs.CLIP_DEFS);
  const [mapContainer, setMapContainer] = useState<TMapContainer>('canvas');
  const [geometryTypes, setGeometryTypes] = useState<Set<TGeomentryType>>(new Set([
    'polygon',
    'polyline'
  ]));

  useEffect(() => {

    console.debug("✨ building map component");

    const _mapDef = MapDefs.MAP_DEF_____WOLFGANG;

    const _map = new Map({

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
              return vectorTileFeature.layerName === 'GEWAESSER_L_GEWL /label';
            }
          }, _mapDef.labelDefs, '', 6, 7) // 2,
        },
        {
          createLayerInstance: () => new MapLayerPolygon(Map.LAYER__NAME__GREENAREA, {
            accepts: (_vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
              return vectorTileFeature.layerName === 'NUTZUNG_L16_20' && vectorTileFeature.hasValue('_symbol', Map.SYMBOL_INDEX_GREENAREA, Map.SYMBOL_INDEX___LEISURE);
            }
          }, [2, -2], 500)
        },
        {
          createLayerInstance: () => new MapLayerPolygon(Map.LAYER__NAME_VEGETATION, {
            accepts: (_vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
              // 3 Wald
              // 6 Gewässerrand
              // 7 Friedhof
              // 8 Freizeit
              // 9 Weingarten
              if (vectorTileFeature.layerName === 'NUTZUNG_L16_20' && vectorTileFeature.hasValue('_symbol', 3, 6, 7, 9)) {
                return true;
              } else {
                return false;
              }
            }
          }, [2, -2], 500, {
            '3': {
              gridType: 'hexagon',
              gridSize: 25,
              randSize: 0.00020,
              symbolFactory: 'createTreeSymbol',
              outerDim: 75
            },
            '6': {
              gridType: 'triangle',
              gridSize: 30,
              randSize: 0.0002,
              symbolFactory: 'createMarshSymbol',
              outerDim: 0
            },
            '7': {
              gridType: 'triangle',
              gridSize: 25,
              randSize: 0,
              symbolFactory: 'createGraveSymbol',
              outerDim: 0
            },
            '9': {
              gridType: 'rectangle',
              gridSize: 25,
              randSize: 0.000075,
              symbolFactory: 'createWineSymbol',
              outerDim: 50
            }
          })
        },
        {
          createLayerInstance: () => new MapLayerBuildings(Map.LAYER__NAME__BUILDINGS, {
            accepts: (vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
              return vectorTileKey.lod >= 15 && vectorTileFeature.layerName === 'GEBAEUDE_F_GEBAEUDE';
            }
          })
        },
        {
          createLayerInstance: () => new MapLayerLines(Map.LAYER__NAME____RAILWAY, {
            accepts: (_vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
              // 9 Hauptnetz
              // 10, 11 Ergänzungsnetz
              return (vectorTileFeature.layerName === 'GIP_OUTSIDE_L_GIP' && vectorTileFeature.hasValue('_symbol', 9, 10, 11, 14)); // 9, 12, 13, 14
            }
          }, l => l.multiPolyline025)
        },
        {
          createLayerInstance: () => new MapLayerLines(Map.LAYER__NAME_______TRAM, {
            accepts: (_vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
              // 12 Zahnradbahn / Schmalspurbahn
              // 13 Seilbahn
              // 16 Strassenbahn
              // Naturbestand :: Wien
              return (vectorTileFeature.layerName === 'GIP_OUTSIDE_L_GIP' && vectorTileFeature.hasValue('_symbol', 12, 13, 16)) || (vectorTileFeature.layerName === 'NATURBESTAND_L_NATURBESTAND_L' && vectorTileFeature.hasValue('_symbol', Map.SYMBOL_INDEX____TRACKS))
            }
          }, l => l.multiPolyline018)
        },
        {
          createLayerInstance: () => new MapLayerLines(Map.LAYER__NAME__SHIP_LINE, {
            accepts: (_vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
              // console.log(vectorTileFeature.getValue('_symbol'));
              // 15 Fähre
              return (vectorTileFeature.layerName === 'GIP_OUTSIDE_L_GIP' && vectorTileFeature.hasValue('_symbol', 15));
            }
          }, l => l.multiPolyline025, [12, 4])
        },
        {
          createLayerInstance: () => new MapLayerRoad2(Map.LAYER__NAME______ROADS, {
            accepts: (vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
              const isGipOrBridge = vectorTileFeature.layerName === 'GIP_L_GIP_144' || vectorTileFeature.layerName === 'GIP_BAUWERK_L_BRÜCKE';
              const isCommonRoad = vectorTileFeature.hasValue('_symbol', 0, 1, 2, 3, 4, 5, 6, 7, 8);
              return vectorTileKey.lod === 15 && isGipOrBridge && isCommonRoad;
            }
          })
        },
        {
          createLayerInstance: () => new MapLayerBridge2(Map.LAYER__NAME_____BRIDGE, {
            accepts: (vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
              const isGipOrBridge = vectorTileFeature.layerName === 'GIP_BAUWERK_L_BRÜCKE';
              const isCommonRoad = vectorTileFeature.hasValue('_symbol', 0, 1, 2, 3, 4, 5, 6, 7, 8);
              return vectorTileKey.lod === 15 && isGipOrBridge && isCommonRoad;
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
          createLayerInstance: () => new MapLayerPoints(Map.LAYER__NAME_____SUMMIT, {
            accepts: (_vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
              return vectorTileFeature.layerName === 'GIPFEL_L09-20'
            }
          }, 'createSummitSymbol', _mapDef.labelDefs)
        },
        {
          createLayerInstance: () => new MapLayerPoints(Map.LAYER__NAME_____CHURCH, {
            accepts: (vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
              return vectorTileKey.lod === 14 && vectorTileFeature.layerName === 'GEONAMEN_P_KIRCHE_KAPELLE'
            }
          }, 'createChurchSymbol', _mapDef.labelDefs)
        },
        {
          createLayerInstance: () => new MapLayerLines(Map.LAYER__NAME_____BORDER, {
            accepts: (vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
              if (vectorTileKey.lod === 14 && vectorTileFeature.layerName === 'BEV_STAAT_L_STAATSGRENZE') {
                console.log('vectorTileFeature', vectorTileKey, vectorTileFeature);
                return true;
              } else {
                return false;
              }
            }
          }, l => l.multiPolyline050, [0, 0], -10)
        },
        {
          createLayerInstance: () => new MapLayerPoints(Map.LAYER__NAME___LOCATION, {
            accepts: (_vectorTileKey: IVectorTileKey, vectorTileFeature: IVectorTileFeature) => {
              return vectorTileFeature.layerName === 'SIEDLUNG_P_SIEDLUNG' || vectorTileFeature.layerName === 'SIEDLUNG_P_BEZHPTSTADT' || vectorTileFeature.layerName === 'LANDESHAUPTSTADT_P'; //  SIEDLUNG_P_BEZHPTSTADT
            }
          }, 'createTownSymbol', _mapDef.labelDefs)
        },
        {
          createLayerInstance: () => new MapLayerLines(Map.LAYER__NAME____HACHURE, {
            accepts: () => {
              return false;
            }
          }, l => l.multiPolyline018, [0, 0], 0, _mapDef.hachures)
        },
        {
          createLayerInstance: () => new MapLayerLines(Map.LAYER__NAME____CONTOUR, {
            accepts: () => {
              return false;
            }
          }, l => l.multiPolyline025, [0, 0], 0, _mapDef.contours)
        },
        {
          createLayerInstance: () => new MapLayerLineLabel(Map.LAYER__NAME_CONTOUR_TX, {
            accepts: () => {
              return false;
            }
          }, _mapDef.labelDefs, _mapDef.contours)
        },
        {
          createLayerInstance: () => new MapLayerLineLabel(Map.LAYER__NAME__BORDER_TX, {
            accepts: () => {
              return false;
            }
          }, _mapDef.labelDefs, _mapDef.bordertx)
        },
        {
          createLayerInstance: () => new MapLayerPolygon(Map.LAYER__NAME___CLIPPOLY, {
            accepts: () => {
              return false;
            }
          }, [2, -2], 500, {}, _mapDef.clippoly)
        },
        {
          createLayerInstance: () => new MapLayerFrame(Map.LAYER__NAME______FRAME, {
            accepts: () => {
              return false;
            }
          })
        },


      ],
    });

    setMap(_map);

  }, []);

  const handleGeometryTypeChange = (geometryType: TGeomentryType, checked: boolean) => {
    const _geometryTypes = new Set(geometryTypes);
    if (checked) {
      _geometryTypes.add(geometryType);
    } else {
      _geometryTypes.delete(geometryType);
    }
    setGeometryTypes(_geometryTypes);

  }

  const handleContainerChange = (_mapContainer: TMapContainer) => {

    console.log(`📞 handling container change (_mapContainer)`, _mapContainer);
    setMapContainer(_mapContainer);

  }

  const handleGeoJsonExport = (id: string) => {

    const layer = map!.findLayerByName(id);

    // const polygons = VectorTileGeometryUtil.destructureMultiPolygon(layer!.polyData);
    const polylines050 = VectorTileGeometryUtil.destructureMultiPolyline(layer!.multiPolyline035);
    const features = polylines050.map(p => turf.feature(p));
    const featureCollection = turf.featureCollection(features);

    const a = document.createElement("a");
    const e = new MouseEvent("click");
    a.download = `${layer!.name}_${Uid.random16()}.json`;
    a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(featureCollection));
    a.dispatchEvent(e);

  }

  const handleVisibilityChange = (id: string, visible: boolean) => {

    console.log(`📞 handling visibility change (id, visible)`, id, visible);

    const _mapLayerProps = cloneMapLayerProps();
    for (let i = 0; i < _mapLayerProps.length; i++) {
      if (_mapLayerProps[i].id === id) {
        _mapLayerProps[i].visible = visible;
      }
    }
    mapLayerPropsRef.current = _mapLayerProps;
    setMapLayerProps(mapLayerPropsRef.current);

  }

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

      const _mapLayerProps: IMapLayerProps[] = [];
      map.layers.forEach((l) => {
        _mapLayerProps.push({
          id: l.name,
          visible: true,
          polylines018: l.multiPolyline018,
          polylines025: l.multiPolyline025,
          polylines035: l.multiPolyline035,
          polylines050: l.multiPolyline050,
          coordinate4326ToCoordinateCanvas,
          status: {
            tile: 'pending',
            poly: 'pending',
            line: 'pending',
            clip: 'pending',
            plot: 'pending'
          },
          handleVisibilityChange,
          handleGeoJsonExport
        });
      });
      mapLayerPropsRef.current = _mapLayerProps;
      setMapLayerProps(mapLayerPropsRef.current);

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

      if (map.findLayerByName(Map.LAYER__NAME____CONTOUR) || map.findLayerByName(Map.LAYER__NAME_CONTOUR_TX)) {
        collectTiles(Map.LOD_16, vectorTileUrlBmaph);
        collectTiles(Map.LOD_15, vectorTileUrlBmaph);
        collectTiles(Map.LOD_14, vectorTileUrlBmaph);
      }


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

    console.debug("⚙ updating map (mapContainer)", mapContainer);

    const _mapLayerProps = cloneMapLayerProps();
    mapLayerPropsRef.current = _mapLayerProps;
    setMapLayerProps(mapLayerPropsRef.current);

  }, [mapContainer]);

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
        },
        handleVisibilityChange,
        handleGeoJsonExport
      }
    });

    // will update svg display
    mapLayerPropsRef.current = _mapLayerProps;
    setMapLayerProps(mapLayerPropsRef.current);
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

        if (mapContainer === 'canvas') {
          map?.drawToCanvas(context, mapLayerProps, geometryTypes);
        }

      }, 100);

      // check if there is more tile loading to be fonw
      const hasPendingTileLayer = mapLayerProps.some(p => p.status.tile !== 'success');
      if (!hasPendingTileLayer) {

        // check if any processing is going on
        const hasProcessingLayer = mapLayerProps.some(p => (p.status.poly === 'working' || p.status.line === 'working' || p.status.clip === 'working' || p.status.plot === 'working'));
        // const hasProcessingClip = clipDefs.some(p => (p.status === 'working'));
        if (!hasProcessingLayer) { //  && !hasProcessingClip

          const processablePolyLayer = mapLayerProps.find(p => p.status.poly === 'pending');
          if (processablePolyLayer) {

            // delayed trigger of processing gives a chance to update map a bit further down
            window.setTimeout(() => {
              processPolyLayer(processablePolyLayer);
            }, 100);

          } else {

            const processableLineLayer = mapLayerProps.find(p => p.status.line === 'pending');
            if (processableLineLayer) {

              // delayed trigger of processing gives a chance to update map a bit further down
              window.setTimeout(() => {
                processLineLayer(processableLineLayer);
              }, 100);

            } else {

              const processableClip = clipDefs.find(c => {
                return c.status === 'pending' && map!.findLayerByName(c.layerNameDest) && map!.findLayerByName(c.layerNameClip);
              });
              if (processableClip) {

                processableClip.status = 'working';
                window.setTimeout(() => {
                  processClip(processableClip);
                }, 100);

              } else {

                const processablePlotLayer = mapLayerProps.find(p => p.status.plot === 'pending');
                if (processablePlotLayer) {

                  window.setTimeout(() => {
                    processPlotLayer(processablePlotLayer);
                  }, 100);

                } else {

                  console.log('done creating map');

                }

              }

            }

          }

        }

      }

    }

  }, [mapLayerProps, geometryTypes]);

  const processClip = (processableClip: IClipDef) => {

    const _mapLayerProps = cloneMapLayerProps();
    for (let i = 0; i < _mapLayerProps.length; i++) {
      if (_mapLayerProps[i].id === processableClip.layerNameDest) {
        _mapLayerProps[i].status.clip = 'working';
      }
      if (_mapLayerProps[i].id === processableClip.layerNameClip) {
        _mapLayerProps[i].status.clip = 'success';
      }
    }
    mapLayerPropsRef.current = _mapLayerProps;
    setMapLayerProps(mapLayerPropsRef.current);

    const layerDest = map!.findLayerByName(processableClip.layerNameDest);
    const layerClip = map!.findLayerByName(processableClip.layerNameClip);
    if (layerDest && layerClip) {

      console.log(`${processableClip.layerNameDest}, clipping to ${processableClip.layerNameClip}, ${processableClip.distance.toFixed(2)}m`);

      layerDest.clipToLayerMultipolygon(layerClip, processableClip.distance, processableClip.options).then(() => {

        processableClip.status = 'success';

        const _mapLayerProps = cloneMapLayerProps();
        for (let i = 0; i < _mapLayerProps.length; i++) {
          _mapLayerProps[i].status.clip = 'pending';
        }
        mapLayerPropsRef.current = _mapLayerProps;
        setMapLayerProps(mapLayerPropsRef.current);

      }).catch((e) => {

        console.warn(e);

      });

    }

  }

  const processPlotLayer = (processablePlotLayer: IMapLayerProps) => {

    const _mapLayerProps = cloneMapLayerProps();
    for (let i = 0; i < _mapLayerProps.length; i++) {
      if (_mapLayerProps[i].id === processablePlotLayer.id) {
        _mapLayerProps[i].status.plot = 'working';
      }
    }
    mapLayerPropsRef.current = _mapLayerProps;
    setMapLayerProps(mapLayerPropsRef.current);

    const mapLayer = map?.findLayerByName(processablePlotLayer.id);
    if (mapLayer) {

      mapLayer.processPlot(map!.getBBoxClp4326(), map!.getBBoxMap4326()).then(() => {

        const _mapLayerProps = cloneMapLayerProps();
        for (let i = 0; i < _mapLayerProps.length; i++) {
          if (_mapLayerProps[i].id === processablePlotLayer.id) {
            _mapLayerProps[i].status.plot = 'success';
          }
        }
        mapLayerPropsRef.current = _mapLayerProps;
        setMapLayerProps(mapLayerPropsRef.current);

      }).catch((e) => {

        console.warn(e);

        const _mapLayerProps = cloneMapLayerProps();
        for (let i = 0; i < _mapLayerProps.length; i++) {
          if (_mapLayerProps[i].id === processablePlotLayer.id) {
            _mapLayerProps[i].status.plot = 'failure';
          }
        }
        mapLayerPropsRef.current = _mapLayerProps;
        setMapLayerProps(mapLayerPropsRef.current);

      });

    } else {
      console.warn(`failed to find layer for plot processing`, processablePlotLayer.id);
    }

  }

  const processPolyLayer = (processablePolyLayer: IMapLayerProps) => {

    const _mapLayerProps = cloneMapLayerProps();
    for (let i = 0; i < _mapLayerProps.length; i++) {
      if (_mapLayerProps[i].id === processablePolyLayer.id) {
        _mapLayerProps[i].status.poly = 'working';
      }
    }
    mapLayerPropsRef.current = _mapLayerProps;
    setMapLayerProps(mapLayerPropsRef.current);

    const mapLayer = map?.findLayerByName(processablePolyLayer.id);
    if (mapLayer) {

      mapLayer.processPoly(map!.getBBoxClp4326(), map!.getBBoxMap4326()).then(() => {

        const _mapLayerProps = cloneMapLayerProps();
        for (let i = 0; i < _mapLayerProps.length; i++) {
          if (_mapLayerProps[i].id === processablePolyLayer.id) {
            _mapLayerProps[i].status.poly = 'success';
          }
        }
        mapLayerPropsRef.current = _mapLayerProps;
        setMapLayerProps(mapLayerPropsRef.current);

      }).catch((e) => {

        console.warn(e);

        const _mapLayerProps = cloneMapLayerProps();
        for (let i = 0; i < _mapLayerProps.length; i++) {
          if (_mapLayerProps[i].id === processablePolyLayer.id) {
            _mapLayerProps[i].status.poly = 'failure';
          }
        }
        mapLayerPropsRef.current = _mapLayerProps;
        setMapLayerProps(mapLayerPropsRef.current);

      });

    } else {
      console.warn(`failed to find layer for poly processing`, processablePolyLayer.id);
    }

  }

  const processLineLayer = (processableLineLayer: IMapLayerProps) => {

    const _mapLayerProps = cloneMapLayerProps();
    for (let i = 0; i < _mapLayerProps.length; i++) {
      if (_mapLayerProps[i].id === processableLineLayer.id) {
        _mapLayerProps[i].status.line = 'working';
      }
    }
    mapLayerPropsRef.current = _mapLayerProps;
    setMapLayerProps(mapLayerPropsRef.current);

    const mapLayer = map?.findLayerByName(processableLineLayer.id);
    if (mapLayer) {

      mapLayer.processLine(map!.getBBoxClp4326(), map!.getBBoxMap4326()).then(() => {

        const _mapLayerProps = cloneMapLayerProps();
        for (let i = 0; i < _mapLayerProps.length; i++) {
          if (_mapLayerProps[i].id === processableLineLayer.id) {
            _mapLayerProps[i].status.line = 'success';
          }
        }
        mapLayerPropsRef.current = _mapLayerProps;
        setMapLayerProps(mapLayerPropsRef.current);

      }).catch((e) => {

        console.warn(e);

        const _mapLayerProps = cloneMapLayerProps();
        for (let i = 0; i < _mapLayerProps.length; i++) {
          if (_mapLayerProps[i].id === processableLineLayer.id) {
            _mapLayerProps[i].status.line = 'failure';
          }
        }
        mapLayerPropsRef.current = _mapLayerProps;
        setMapLayerProps(mapLayerPropsRef.current);

      });

    } else {
      console.warn(`failed to find layer for line processing`, processableLineLayer.id);
    }

  }

  const cloneMapLayerProps = (): IMapLayerProps[] => {
    const _mapLayerProps = mapLayerPropsRef.current.map(p => {
      return {
        ...p,
        polylines018: p.polylines018,
        polylines025: p.polylines025,
        polylines035: p.polylines035,
        polylines050: p.polylines050,
        handleVisibilityChange,
        handleGeoJsonExport
      }
    });
    if (mapContainer === 'canvas') {
      _mapLayerProps.forEach(p => {
        p.polylines018 = VectorTileGeometryUtil.emptyMultiPolyline();
        p.polylines025 = VectorTileGeometryUtil.emptyMultiPolyline();
        p.polylines035 = VectorTileGeometryUtil.emptyMultiPolyline();
        p.polylines050 = VectorTileGeometryUtil.emptyMultiPolyline();
      });
    } else {
      _mapLayerProps.forEach(p => {
        const layer = map!.findLayerByName(p.id)!;
        p.polylines018 = layer.multiPolyline018;
        p.polylines025 = layer.multiPolyline025;
        p.polylines035 = layer.multiPolyline035;
        p.polylines050 = layer.multiPolyline050;
      });
    }
    return _mapLayerProps;
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

    const setSuccess = () => {
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
    }

    loadableTileKey.status = 'working';
    const tileLoader = new VectorTileLoader(loadableTileKey.vectorTileUrl);
    tileLoader.load(loadableTileKey).then(vectorTile => {

      console.debug(vectorTile);

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

      setSuccess();

    }).catch(() => {

      setSuccess(); // set success, even in case of failure, tile loading must go on

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
        <List dense={true} sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {mapLayerProps.map((l) => (
            <ListMapLayerComponent key={l.id} {...l} />
          ))}

        </List>
        <div
          style={{
            flexGrow: 2
          }}
        />
        <FormControl
          sx={{
            padding: '12px'
          }}
        >
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="canvas"
            name="radio-buttons-group"
            onChange={(e) => handleContainerChange(e.target.value as TMapContainer)}
          >
            <FormControlLabel value="canvas" control={<Radio size={'small'} />} label="canvas" checked={mapContainer === 'canvas'} />
            {
              mapContainer === 'canvas' ? <List dense={true} sx={{ width: '100%', bgcolor: 'background.paper' }}>
                <ListItem>
                  <Checkbox checked={geometryTypes.has('polygon')} size="small" onChange={(e) => handleGeometryTypeChange('polygon', e.target.checked)} />
                  <ListItemText
                    sx={{
                      flexGrow: 20
                    }}
                    primary={'polygon'} />
                </ListItem>
                <ListItem>
                  <Checkbox checked={geometryTypes.has('polyline')} size="small" onChange={(e) => handleGeometryTypeChange('polyline', e.target.checked)} />
                  <ListItemText
                    sx={{
                      flexGrow: 20
                    }}
                    primary={'polyline'} />
                </ListItem>
              </List> : null
            }


            <FormControlLabel value="svg" control={<Radio size={'small'} />} label="svg" checked={mapContainer === 'svg'} />
          </RadioGroup>
        </FormControl>
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
            {mapContainer === 'canvas' ? mapRectangleProps.map((l) => <SvgRectangleComponent key={l.id} {...l} />) : null}
            {mapLayerProps.map((l) => <SvgMapLayerComponent key={l.id} {...l} />)}
          </svg>
        ) : null}

      </div>

    </Stack >

  );
}

export default MapComponent;
