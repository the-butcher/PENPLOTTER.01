import { BBox, Position } from "geojson";
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { IVectorTileUrl } from "../vectortile/IVectorTileUrl";
import { VectorTileKey } from "../vectortile/VectorTileKey";
import { VectorTileLoader } from "../vectortile/VectorTileLoader";
import { AMapLayer, ILayerProps, MAP_LAYER_GEOMETRY_TYPES } from "./AMapLayer";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import * as turf from "@turf/turf";
import { Pen } from "./Pen";

export interface IMapProps {
    bbox3857: BBox;
    padding: number;
    layers: ILayerProps[];
}

export class Map {

    static readonly LAYER__NAME______WATER = "l_____water";
    static readonly LAYER__NAME_______WOOD = "l______wood";
    static readonly LAYER__NAME__GREENAREA = "l_greenarea";
    static readonly LAYER__NAME__BUILDINGS = "l_buildings";
    static readonly LAYER__NAME_____CHURCH = "l____church";
    static readonly LAYER__NAME_____SUMMIT = "l____summit";
    static readonly LAYER__NAME______FRAME = "l_____frame";
    static readonly LAYER__NAME_____LABELS = "l____labels";
    static readonly LAYER__NAME_____TRACKS = "l____tracks";
    static readonly LAYER__NAME__SHIP_LINE = "l_ship_line";
    static readonly LAYER__NAME_____BORDER = "l____border";
    static readonly LAYER__NAME___RIVER_TX = "l__river_tx";
    static readonly LAYER__NAME______ROADS = "l_____roads";
    static readonly LAYER__NAME_____TUNNEL = "l____tunnel";
    static readonly LAYER__NAME__ELEVATE_A = "l_elevate_a";
    static readonly LAYER__NAME__ELEVATE_B = "l_elevate_b";



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

    static readonly SCALE = 20000;

    private readonly bboxMap3857: BBox;
    private readonly bboxClp3857: BBox;

    static readonly LOD_14 = 14;
    static readonly LOD_15 = 15;
    static readonly LOD_16 = 16;

    readonly min3857Pos: Position;
    readonly tileDim14: Position;

    readonly layers: AMapLayer<MAP_LAYER_GEOMETRY_TYPES>[];

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
        [0.05, 0.1, 0.3, 0.5].forEach((penDiameterMM) => {
            console.log("pen width", penDiameterMM, "mm", Pen.getPenWidthMeters(penDiameterMM, Map.SCALE).toFixed(2).padStart(6, " "), "m", Pen.getPenWidthPixels(penDiameterMM, Map.SCALE, 15).toFixed(2).padStart(6, " "), `px @ 1:${Map.SCALE.toLocaleString()} @ lod[15]`);
        });

        const minTileKey14 = this.getMinTileKey(Map.LOD_14);
        const maxTileKey14 = this.getMaxTileKey(Map.LOD_14);
        this.min3857Pos = VectorTileGeometryUtil.toMercator(minTileKey14);
        this.tileDim14 = [
            maxTileKey14.col - minTileKey14.col + 1,
            maxTileKey14.row - minTileKey14.row + 1,
        ];
        this.layers = [];
        props.layers.forEach((layerProps) => {
            this.layers.push(layerProps.createLayerInstance());
        });

    }

    findLayerByName(name: string): AMapLayer<MAP_LAYER_GEOMETRY_TYPES> | undefined {
        return this.layers.find((l) => l.name === name);
    }

    getMinTileKey(lod: number) {
        return VectorTileKey.toTileKey([this.bboxClp3857[0], this.bboxClp3857[3]], lod);
    }

    getMaxTileKey(lod: number) {
        return VectorTileKey.toTileKey([this.bboxClp3857[2], this.bboxClp3857[1]], lod);
    }

    // async load(vectorTileUrl: IVectorTileUrl, lod: number): Promise<void> {

    //     const minTileKey = this.getMinTileKey(lod);
    //     const maxTileKey = this.getMaxTileKey(lod);

    //     const tileLoader = new VectorTileLoader(vectorTileUrl);
    //     for (let col = minTileKey.col; col <= maxTileKey.col; col++) {
    //         for (let row = minTileKey.row; row <= maxTileKey.row; row++) {

    //             const vectorTileKey: IVectorTileKey = {
    //                 lod,
    //                 col,
    //                 row,
    //             };

    //             try {

    //                 const vectorTile = await tileLoader.load(vectorTileKey);
    //                 // console.log('got vectorTile', vectorTile);

    //                 vectorTile.layers.forEach((vectorTileLayer) => {
    //                     vectorTileLayer.features.forEach((vectorTileFeature) => {
    //                         this.layers.forEach(async (layer) => {
    //                             if (layer.accepts(vectorTileKey, vectorTileFeature)) {
    //                                 await layer.accept(vectorTile.tileKey, vectorTileFeature);
    //                             }
    //                         });
    //                     });
    //                 });

    //             } catch (e) {
    //                 console.debug("failed to load tile", vectorTileKey, "due to", e);
    //             }
    //         }
    //     }
    // }

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

    // async processData(): Promise<void> {
    //     const bboxClp4326 = this.getBBoxClp4326();
    //     const bboxMap4326 = this.getBBoxMap4326();
    //     for (let i = 0; i < this.layers.length; i++) {
    //         await this.layers[i].processData(bboxClp4326, bboxMap4326);
    //     }
    // }

    async processLine(): Promise<void> {
        const bboxClp4326 = this.getBBoxClp4326();
        const bboxMap4326 = this.getBBoxMap4326();
        for (let i = 0; i < this.layers.length; i++) {
            await this.layers[i].processLine(bboxClp4326, bboxMap4326);
        }
    }

    async postProcess(): Promise<void> {
        const bboxClp4326 = this.getBBoxClp4326();
        const bboxMap4326 = this.getBBoxMap4326();
        for (let i = 0; i < this.layers.length; i++) {
            await this.layers[i].postProcess(bboxClp4326, bboxMap4326);
        }
    }

    drawToCanvas(context: CanvasRenderingContext2D): void {

        const coordinate3857ToCoordinateCanvas = (coordinate3857: Position): Position => {
            const x = (coordinate3857[0] - this.min3857Pos[0]) / VectorTileKey.lods[Map.LOD_14].resolution;
            const y = (this.min3857Pos[1] - coordinate3857[1]) / VectorTileKey.lods[Map.LOD_14].resolution;
            return [x, y];
        };

        const coordinate4326ToCoordinateCanvas = (coordinate4326: Position): Position => {
            return coordinate3857ToCoordinateCanvas(turf.toMercator(coordinate4326));
        };

        context.setLineDash([]);
        context.strokeStyle = "rgba(0, 0, 1, 0.2)";
        context.lineWidth = 1;

        const drawRect = (bbox3857: BBox) => {

            const mapUL = coordinate3857ToCoordinateCanvas([
                bbox3857[0],
                bbox3857[3],
            ]);
            const mapUR = coordinate3857ToCoordinateCanvas([
                bbox3857[2],
                bbox3857[3],
            ]);
            const mapLR = coordinate3857ToCoordinateCanvas([
                bbox3857[2],
                bbox3857[1],
            ]);
            const mapLL = coordinate3857ToCoordinateCanvas([
                bbox3857[0],
                bbox3857[1],
            ]);

            context.beginPath();
            context.moveTo(mapUL[0], mapUL[1]);
            context.lineTo(mapUR[0], mapUR[1]);
            context.lineTo(mapLR[0], mapLR[1]);
            context.lineTo(mapLL[0], mapLL[1]);
            context.lineTo(mapUL[0], mapUL[1]);
            context.stroke();

        }

        this.layers.forEach((layer) => {
            layer.drawToCanvas(context, coordinate4326ToCoordinateCanvas);
        });

    }
}
