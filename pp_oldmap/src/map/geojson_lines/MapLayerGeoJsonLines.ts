import * as turf from '@turf/turf';
import { BBox, GeoJsonProperties, LineString, MultiLineString } from "geojson";
import { IVectorTileFeature } from '../../protobuf/vectortile/IVectorTileFeature';
import { IVectorTileFeatureFilter } from '../../vectortile/IVectorTileFeatureFilter';
import { IVectorTileKey } from '../../vectortile/IVectorTileKey';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';
import { AMapLayer } from '../AMapLayer';
import { IWorkerPolyInput } from '../common/IWorkerPolyInput';
import { IWorkerPolyOutput } from '../common/IWorkerPolyoutput';
import { IWorkerLineInputLine } from './IWorkerLineInputLine';
import { IWorkerLineOutput } from '../common/IWorkerLineOutput';
import { hachures_duerrnstein } from './hachures_duerrnstein';


export class MapLayerGeoJsonLines extends AMapLayer<LineString, GeoJsonProperties> {

    private getDefaultPolylineContainer: (mapLayerLines: MapLayerGeoJsonLines) => MultiLineString;
    private offset: number;

    constructor(name: string, getDefaultPolylineContainer: (mapLayerLines: MapLayerGeoJsonLines) => MultiLineString) {
        super(name, {
            accepts: () => false,
        });
        this.getDefaultPolylineContainer = getDefaultPolylineContainer;
    }

    async accept(): Promise<void> {
        // nothing
    }

    async processPoly(): Promise<void> { // bboxMap4326: BBox



    }

    async processLine(bboxClp4326: BBox, bboxMap4326: BBox): Promise<void> {

        console.log(`${this.name}, processing line ...`);

        const linestrings = hachures_duerrnstein.features.map(f => f.geometry);
        const multiLineString = VectorTileGeometryUtil.restructureMultiPolyline(linestrings);
        this.getDefaultPolylineContainer(this).coordinates.push(...multiLineString.coordinates);

        this.bboxClipLayer(bboxMap4326);

    }


    async processPlot(): Promise<void> {



    }

}