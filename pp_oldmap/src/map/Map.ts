import * as turf from "@turf/turf";
import { BBox, GeoJsonProperties, Geometry, Position } from "geojson";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import { VectorTileKey } from "../vectortile/VectorTileKey";
import { AMapLayer, ILayerProps } from "./AMapLayer";
import { Pen } from "./Pen";
import { IMapLayerProps } from "../components/IMapLayerProps";
import { TGeomentryType } from "../components/MapComponent";

export interface IMapProps {
    bbox3857: BBox;
    padding: number;
    layers: ILayerProps[];
}

export class Map {

    static readonly LAYER__NAME______WATER = "l______water";
    static readonly LAYER__NAME___RIVER_TX = "l___river_tx";
    static readonly LAYER__NAME_VEGETATION = "l_vegetation";
    static readonly LAYER__NAME__GREENAREA = "l__greenarea";
    static readonly LAYER__NAME___CLIPPOLY = "l___clippoly";
    static readonly LAYER__NAME__BUILDINGS = "l__buildings";
    static readonly LAYER__NAME_____CHURCH = "l_____church";
    static readonly LAYER__NAME_____SUMMIT = "l_____summit";
    static readonly LAYER__NAME___LOCATION = "l___location";
    static readonly LAYER__NAME______FRAME = "l______frame";
    static readonly LAYER__NAME_______CROP = "l_______crop";
    static readonly LAYER__NAME____RAILWAY = "l____railway";
    static readonly LAYER__NAME_______TRAM = "l_______tram";
    static readonly LAYER__NAME__SHIP_LINE = "l__ship_line";
    static readonly LAYER__NAME_____BORDER = "l_____border";
    static readonly LAYER__NAME__BORDER_TX = "l__border_tx";
    static readonly LAYER__NAME______ROADS = "l______roads";
    static readonly LAYER__NAME_____BRIDGE = "l_____bridge";
    static readonly LAYER__NAME_____TUNNEL = "l_____tunnel";
    static readonly LAYER__NAME____CONTOUR = "l____contour";
    static readonly LAYER__NAME_CONTOUR_TX = "l_contour_tx";
    static readonly LAYER__NAME____HACHURE = "l___hachures";

    static readonly SYMBOL_INDEX_GREENAREA = 1; // on NUTZUNG_L16_20
    static readonly SYMBOL_INDEX______WOOD = 3; // on NUTZUNG_L16_20
    static readonly SYMBOL_INDEX______MISC = 5; // on NUTZUNG_L16_20
    static readonly SYMBOL_INDEX___LEISURE = 8; // on NUTZUNG_L16_20
    static readonly SYMBOL_INDEX____TRACKS = 5; // on NATURBESTAND_L_NATURBESTAND_L

    static readonly SYMBOL_INDEX___HIGHWAY = 0; // on GIP_L_GIP_144 and GIP_BAUWERK_L_BRÜCKE
    static readonly SYMBOL_INDEX______RAMP = 1; // on GIP_L_GIP_144 and GIP_BAUWERK_L_BRÜCKE
    static readonly SYMBOL_INDEX__SPEEDWAY = 2; // on GIP_L_GIP_144 and GIP_BAUWERK_L_BRÜCKE
    static readonly SYMBOL_INDEX_____MAJOR = 3; // on GIP_L_GIP_144 and GIP_BAUWERK_L_BRÜCKE
    static readonly SYMBOL_INDEX_COMMUNITY = 4; // on GIP_L_GIP_144 and GIP_BAUWERK_L_BRÜCKE
    static readonly SYMBOL_INDEX_____OTHER = 5; // on GIP_L_GIP_144 and GIP_BAUWERK_L_BRÜCKE
    static readonly SYMBOL_INDEX_____MINOR = 6; // on GIP_L_GIP_144 and GIP_BAUWERK_L_BRÜCKE
    static readonly SYMBOL_INDEX__PEDEST_A = 7; // on GIP_L_GIP_144 and GIP_BAUWERK_L_BRÜCKE
    static readonly SYMBOL_INDEX__PEDEST_B = 8; // on GIP_L_GIP_144 and GIP_BAUWERK_L_BRÜCKE

    static readonly SCALE = 25000;

    private readonly bboxMap3857: BBox;
    private readonly bboxClp3857: BBox;

    static readonly LOD_14 = 14;
    static readonly LOD_15 = 15;
    static readonly LOD_16 = 16;

    static readonly LOD_VS = 14;

    readonly min3857Pos: Position;
    readonly tileDimVs: Position;

    readonly layers: AMapLayer<Geometry, GeoJsonProperties>[];

    constructor(props: IMapProps) {

        this.bboxMap3857 = props.bbox3857;
        this.bboxClp3857 = [
            props.bbox3857[0] - props.padding,
            props.bbox3857[1] - props.padding,
            props.bbox3857[2] + props.padding,
            props.bbox3857[3] + props.padding,
        ];
        const mapWidth = this.bboxMap3857[2] - this.bboxMap3857[0];


        console.log("map width", mapWidth, "m", (mapWidth * 100) / Map.SCALE, `cm @ 1:${Map.SCALE.toLocaleString()}`);
        const lod = Map.LOD_VS;
        [0.18, 0.25, 0.35, 0.5].forEach((penDiameterMM) => {
            console.log("pen width", penDiameterMM, "mm", Pen.getPenWidthMeters(penDiameterMM, Map.SCALE).toFixed(2).padStart(6, " "), "m", Pen.getPenWidthPixels(penDiameterMM, Map.SCALE, lod).toFixed(2).padStart(6, " "), `px @ 1:${Map.SCALE.toLocaleString()} @ lod[${lod}]`);
        });

        const minTileKeyVs = this.getMinTileKey(Map.LOD_VS);
        const maxTileKeyVs = this.getMaxTileKey(Map.LOD_VS);
        this.min3857Pos = VectorTileGeometryUtil.toMercator(minTileKeyVs);
        this.tileDimVs = [
            maxTileKeyVs.col - minTileKeyVs.col + 1,
            maxTileKeyVs.row - minTileKeyVs.row + 2,
        ];
        this.layers = [];
        props.layers.forEach((layerProps) => {
            this.layers.push(layerProps.createLayerInstance());
        });

    }

    findLayerByName(name: string): AMapLayer<Geometry, GeoJsonProperties> | undefined {
        return this.layers.find((l) => l.name === name);
    }

    getMinTileKey(lod: number) {
        return VectorTileKey.toTileKey([this.bboxClp3857[0], this.bboxClp3857[3]], lod);
    }

    getMaxTileKey(lod: number) {
        return VectorTileKey.toTileKey([this.bboxClp3857[2], this.bboxClp3857[1]], lod);
    }

    getBBoxClp4326(): BBox {
        const minClp4326 = turf.toWgs84([this.bboxClp3857[0], this.bboxClp3857[1]]);
        const maxClp4326 = turf.toWgs84([this.bboxClp3857[2], this.bboxClp3857[3]]);
        return [minClp4326[0], minClp4326[1], maxClp4326[0], maxClp4326[1]];
    }

    getBBoxMap4326(): BBox {
        const minMap4326 = turf.toWgs84([this.bboxMap3857[0], this.bboxMap3857[1]]);
        const maxMap4326 = turf.toWgs84([this.bboxMap3857[2], this.bboxMap3857[3]]);
        return [minMap4326[0], minMap4326[1], maxMap4326[0], maxMap4326[1]];
    }

    // async processLineMap(): Promise<void> {
    //     const bboxClp4326 = this.getBBoxClp4326();
    //     const bboxMap4326 = this.getBBoxMap4326();
    //     for (let i = 0; i < this.layers.length; i++) {
    //         await this.layers[i].processLine(bboxClp4326, bboxMap4326);
    //     }
    // }

    // async postProcessMap(): Promise<void> {
    //     const bboxClp4326 = this.getBBoxClp4326();
    //     const bboxMap4326 = this.getBBoxMap4326();
    //     for (let i = 0; i < this.layers.length; i++) {
    //         await this.layers[i].postProcess(bboxClp4326, bboxMap4326);
    //     }
    // }

    drawToCanvas(context: CanvasRenderingContext2D, mapLayerProps: IMapLayerProps[], geometryTypes: Set<TGeomentryType>): void {

        const coordinate3857ToCoordinateCanvas = (coordinate3857: Position): Position => {
            const x = (coordinate3857[0] - this.min3857Pos[0]) / VectorTileKey.lods[Map.LOD_VS].resolution;
            const y = (this.min3857Pos[1] - coordinate3857[1]) / VectorTileKey.lods[Map.LOD_VS].resolution;
            return [x, y];
        };

        const coordinate4326ToCoordinateCanvas = (coordinate4326: Position): Position => {
            return coordinate3857ToCoordinateCanvas(turf.toMercator(coordinate4326));
        };

        context.setLineDash([]);
        context.strokeStyle = "rgba(0, 0, 1, 0.2)";
        context.lineWidth = 1;

        this.layers.forEach((layer) => {

            const visible = mapLayerProps.some(p => p.id === layer.name && p.visible);
            if (visible) {
                layer.drawToCanvas(context, coordinate4326ToCoordinateCanvas, geometryTypes);
            }

        });

    }
}
