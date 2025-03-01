import { BBox, Position } from "geojson";
import { IVectorTileKey } from "../vectortile/IVectorTileKey";
import { IVectorTileUrl } from "../vectortile/IVectorTileUrl";
import { VectorTileKey } from "../vectortile/VectorTileKey";
import { VectorTileLoader } from "../vectortile/VectorTileLoader";
import { AMapLayer, ILayerProps } from "./AMapLayer";
import { VectorTileGeometryUtil } from "../vectortile/VectorTileGeometryUtil";
import * as turf from '@turf/turf';
import { Pen } from "./Pen";


export interface IMapProps {
    // min: Position;
    // max: Position;
    bbox3857: BBox;
    layers: ILayerProps[]
}

export class Map {

    static readonly LAYER__NAME______WATER = 'l_____water';
    static readonly LAYER__NAME_______MISC = 'l______misc';
    static readonly LAYER__NAME__GREENAREA = 'l_greenarea';
    static readonly LAYER__NAME__BUILDINGS = 'l_buildings';
    static readonly LAYER__NAME_______WOOD = 'l______wood';
    static readonly LAYER__NAME______FRAME = 'l_____frame';
    static readonly LAYER__NAME_____LABELS = 'l____labels';
    static readonly LAYER__NAME_____TRACKS = 'l____tracks';
    static readonly LAYER__NAME______ROADS = 'l_____roads';
    static readonly LAYER__NAME_____TUNNEL = 'l____tunnel';
    static readonly LAYER__NAME__ELEVATE_A = 'l_elevate_a';
    static readonly LAYER__NAME__ELEVATE_B = 'l_elevate_b';

    static readonly SYMBOL_INDEX_GREENAREA = 1; // on NUTZUNG_L16_20
    static readonly SYMBOL_INDEX______WOOD = 3; // on NUTZUNG_L16_20
    static readonly SYMBOL_INDEX______MISC = 5; // on NUTZUNG_L16_20
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

    static readonly BBOX_PADDING = 200;

    private readonly bboxMap3857: BBox;
    private readonly bboxClp3857: BBox;

    static readonly LOD_15 = 15;
    static readonly LOD_16 = 16;
    // private readonly minTileKey15: IVectorTileKey;
    // private readonly maxTileKey15: IVectorTileKey;

    readonly min3857Pos: Position;
    readonly tileDim15: Position;
    readonly layers: AMapLayer[];

    constructor(props: IMapProps) {

        this.bboxMap3857 = props.bbox3857;
        this.bboxClp3857 = [
            props.bbox3857[0] - Map.BBOX_PADDING,
            props.bbox3857[1] - Map.BBOX_PADDING,
            props.bbox3857[2] + Map.BBOX_PADDING,
            props.bbox3857[3] + Map.BBOX_PADDING
        ];
        const mapWidth = this.bboxClp3857[2] - this.bboxClp3857[0];
        const scale = 25000;
        console.log('map width', mapWidth, 'm', mapWidth * 100 / 25000, `cm @ 1:${scale.toLocaleString()}`);
        [0.05, 0.10, 0.30, 0.50].forEach(penDiameterMM => {
            console.log('pen width', penDiameterMM, 'mm', Pen.getPenWidthMeters(penDiameterMM, scale).toFixed(2).padStart(6, ' '), 'm', Pen.getPenWidthPixels(penDiameterMM, scale, 15).toFixed(2).padStart(6, ' '), `px @ 1:${scale.toLocaleString()} @ lod[15]`);
        });

        const minTileKey15 = VectorTileKey.toTileKey([
            this.bboxClp3857[0],
            this.bboxClp3857[3]
        ], Map.LOD_15);
        const maxTileKey15 = VectorTileKey.toTileKey([
            this.bboxClp3857[2],
            this.bboxClp3857[1]
        ], Map.LOD_15);
        this.min3857Pos = VectorTileGeometryUtil.toMercator(minTileKey15);
        this.tileDim15 = [
            maxTileKey15.col - minTileKey15.col + 1,
            maxTileKey15.row - minTileKey15.row + 1
        ];
        this.layers = [];
        props.layers.forEach(layerProps => {
            this.layers.push(layerProps.createLayerInstance());
        });
    }

    findLayerByName(name: string): AMapLayer | undefined {
        return this.layers.find(l => l.name === name);
    }

    async load(vectorTileUrl: IVectorTileUrl, lod: number): Promise<void> {

        const minTileKey = VectorTileKey.toTileKey([
            this.bboxClp3857[0],
            this.bboxClp3857[3]
        ], lod);
        const maxTileKey = VectorTileKey.toTileKey([
            this.bboxClp3857[2],
            this.bboxClp3857[1]
        ], lod);

        const tileLoader = new VectorTileLoader(vectorTileUrl);
        for (let col = minTileKey.col; col <= maxTileKey.col; col++) {
            for (let row = minTileKey.row; row <= maxTileKey.row; row++) {

                const vectorTileKey: IVectorTileKey = {
                    lod,
                    col,
                    row
                };
                try {

                    const vectorTile = await tileLoader.load({
                        lod,
                        col,
                        row
                    });
                    // console.log('got vectorTile', vectorTile);

                    this.layers.forEach(async layer => await layer.openTile(vectorTile.tileKey));

                    vectorTile.layers.forEach(vectorTileLayer => {
                        vectorTileLayer.features.forEach(vectorTileFeature => {
                            this.layers.forEach(async layer => {
                                if (layer.accepts(vectorTileFeature)) {
                                    await layer.accept(vectorTile.tileKey, vectorTileFeature);
                                }
                            });
                        });
                    });

                    this.layers.forEach(async layer => await layer.closeTile(vectorTile.tileKey));

                } catch (e) {
                    console.debug('failed to load tile', vectorTileKey, 'due to', e);
                }

            }
        }

    }

    async process(): Promise<void> {

        const minClp4326 = turf.toWgs84([this.bboxClp3857[0], this.bboxClp3857[1]]);
        const maxClp4326 = turf.toWgs84([this.bboxClp3857[2], this.bboxClp3857[3]]);
        const bboxClp4326: BBox = [minClp4326[0], minClp4326[1], maxClp4326[0], maxClp4326[1]];

        const minMap4326 = turf.toWgs84([this.bboxMap3857[0], this.bboxMap3857[1]]);
        const maxMap4326 = turf.toWgs84([this.bboxMap3857[2], this.bboxMap3857[3]]);
        const bboxMap4326: BBox = [minMap4326[0], minMap4326[1], maxMap4326[0], maxMap4326[1]];

        for (let i = 0; i < this.layers.length; i++) {
            await this.layers[i].process(bboxClp4326, bboxMap4326);
        }
    }

    drawToCanvas(context: CanvasRenderingContext2D): void {

        const coordinate3857ToCoordinateCanvas = (coordinate3857: Position): Position => {
            const x = (coordinate3857[0] - this.min3857Pos[0]) / VectorTileKey.lods[Map.LOD_15].resolution + 100;
            const y = (this.min3857Pos[1] - coordinate3857[1]) / VectorTileKey.lods[Map.LOD_15].resolution + 100;
            return [
                x,
                y
            ];
        }

        const coordinate4326ToCoordinateCanvas = (coordinate4326: Position): Position => {
            return coordinate3857ToCoordinateCanvas(turf.toMercator(coordinate4326));
        }

        // const mapUL = coordinate3857ToCoordinateCanvas([
        //     this.bboxMap3857[0],
        //     this.bboxMap3857[3]
        // ]);
        // const mapUR = coordinate3857ToCoordinateCanvas([
        //     this.bboxMap3857[2],
        //     this.bboxMap3857[3]
        // ]);
        // const mapLR = coordinate3857ToCoordinateCanvas([
        //     this.bboxMap3857[2],
        //     this.bboxMap3857[1]
        // ]);
        // const mapLL = coordinate3857ToCoordinateCanvas([
        //     this.bboxMap3857[0],
        //     this.bboxMap3857[1]
        // ]);
        // context.strokeStyle = 'green';
        // context.setLineDash([8, 4]);
        // context.lineWidth = 3;
        // context.beginPath();
        // context.moveTo(mapUL[0], mapUL[1]);
        // context.lineTo(mapUR[0], mapUR[1]);
        // context.lineTo(mapLR[0], mapLR[1]);
        // context.lineTo(mapLL[0], mapLL[1]);
        // context.lineTo(mapUL[0], mapUL[1]);
        // context.stroke();

        const minTileKey = VectorTileKey.toTileKey([
            this.bboxClp3857[0],
            this.bboxClp3857[3]
        ], Map.LOD_15);
        const maxTileKey = VectorTileKey.toTileKey([
            this.bboxClp3857[2],
            this.bboxClp3857[1]
        ], Map.LOD_15);

        context.setLineDash([]);
        context.strokeStyle = 'rgba(0, 0, 1, 0.2)';
        context.lineWidth = 1;
        for (let col = minTileKey.col; col <= maxTileKey.col; col++) {
            for (let row = minTileKey.row; row <= maxTileKey.row; row++) {

                const tileKeyMin15 = {
                    lod: Map.LOD_15,
                    col,
                    row
                };
                const tileKeyMax15 = {
                    lod: Map.LOD_15,
                    col: col + 1,
                    row: row + 1
                };
                const ul3857Pos = VectorTileGeometryUtil.toMercator(tileKeyMin15);
                const lr3857Pos = VectorTileGeometryUtil.toMercator(tileKeyMax15);
                const offset = 0;
                const mapUL = coordinate3857ToCoordinateCanvas([
                    ul3857Pos[0] + offset,
                    ul3857Pos[1] - offset
                ]);
                const mapUR = coordinate3857ToCoordinateCanvas([
                    lr3857Pos[0] - offset,
                    ul3857Pos[1] - offset
                ]);
                const mapLR = coordinate3857ToCoordinateCanvas([
                    lr3857Pos[0] - offset,
                    lr3857Pos[1] + offset
                ]);
                const mapLL = coordinate3857ToCoordinateCanvas([
                    ul3857Pos[0] + offset,
                    lr3857Pos[1] + offset
                ]);
                // const mapLR = coordinate3857ToCoordinateCanvas([
                //     this.bboxMap3857[2],
                //     this.bboxMap3857[1]
                // ]);
                // const mapLL = coordinate3857ToCoordinateCanvas([
                //     this.bboxMap3857[0],
                //     this.bboxMap3857[1]
                // ]);

                context.beginPath();
                context.moveTo(mapUL[0], mapUL[1]);
                context.lineTo(mapUR[0], mapUR[1]);
                context.lineTo(mapLR[0], mapLR[1]);
                context.lineTo(mapLL[0], mapLL[1]);
                context.lineTo(mapUL[0], mapUL[1]);
                context.stroke();

            }
        }

        context.strokeStyle = 'green';
        this.layers.forEach(layer => {
            layer.drawToCanvas(context, coordinate4326ToCoordinateCanvas);
        });
    }

}