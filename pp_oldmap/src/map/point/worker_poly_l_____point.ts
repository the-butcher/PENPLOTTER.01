import * as turf from '@turf/turf';
import { Feature, MultiPolygon, Point, Polygon, Position } from 'geojson';
import { FacetypeFont, GlyphSetter } from 'pp-font';
import { IProjectableProperties, PPGeometry, PPProjection, TFillProps, TProjectableFeature } from 'pp-geom';
import { SymbolUtil } from '../../util/SymbolUtil';
import { MapDefs } from '../MapDefs';
import { ILabelDefPointLabel } from './ILabelDefPointLabel';
import { IWorkerPolyInputPoint } from './IWorkerPolyInputPoint';
import { IWorkerPolyOutputPoint } from './IWorkerPolyOutputPoint';

self.onmessage = (e) => {

    handleMessage(e).then(workerOutput => {
        self.postMessage(workerOutput);
    });

}

const handleMessage = async (e: MessageEvent<IWorkerPolyInputPoint>): Promise<IWorkerPolyOutputPoint> => {

    const workerInput: IWorkerPolyInputPoint = e.data;

    // remove duplicates
    workerInput.tileData.sort((a, b) => (a.geometry.coordinates[0] - b.geometry.coordinates[0]) * 10000 + a.geometry.coordinates[1] - b.geometry.coordinates[1]);
    let refPosition: Position = [-1, -1];
    const _tileData: Feature<Point>[] = [];
    for (let i = 0; i < workerInput.tileData.length; i++) {
        if (turf.distance(refPosition, workerInput.tileData[i].geometry.coordinates, {
            units: 'meters'
        }) > 1) {
            _tileData.push(workerInput.tileData[i]);
            refPosition = workerInput.tileData[i].geometry.coordinates;
        }
    }
    workerInput.tileData = _tileData;

    let polyText: Feature<MultiPolygon, TFillProps>[] = [];
    let multiPolyline025 = PPGeometry.emptyMultiPolyline();
    let polyData = PPGeometry.emptyMultiPolygon();

    // @ts-expect-error text type
    const symbolFactory: (coordinate: Position) => Position[][] = SymbolUtil[workerInput.symbolFactory];

    for (let i = 0; i < workerInput.tileData.length; i++) {

        const point = workerInput.tileData[i];

        if (PPGeometry.booleanWithin(workerInput.bboxMap4326, point.geometry.coordinates)) {

            const symbolCoordinates = symbolFactory(point.geometry.coordinates);
            if (symbolCoordinates.length > 0) {
                multiPolyline025.coordinates.push(...symbolCoordinates);
            }

            const name: string = point.properties!.name;
            if (name) {

                console.log('name', name);

                let labelDef: ILabelDefPointLabel = {
                    tileName: name,
                    plotName: name,
                    distance: 20.00,
                    vertical: -20.00,
                    charsign: 1.20,
                    txtscale: MapDefs.DEFAULT_TEXT_SCALE__LOCATION,
                    fonttype: 'noto_serif___bold_regular',
                    fillprop: {
                        type: 'none'
                    }
                };
                for (let i = 0; i < workerInput.labelDefs.length; i++) {
                    if (workerInput.labelDefs[i].plotName === name) {
                        labelDef = workerInput.labelDefs[i];
                        break;
                    }
                }

                const font = await FacetypeFont.getInstance(labelDef.fonttype, labelDef.txtscale);

                // add offset as of label-def
                const labelPointProj = PPProjection.projectGeometry(point.geometry, turf.toMercator);
                labelPointProj.coordinates[0] += labelDef.distance;
                labelPointProj.coordinates[1] -= labelDef.vertical;
                labelPointProj.coordinates[1] += font.getMidY();

                const labelPoint4326 = PPProjection.projectGeometry(labelPointProj, turf.toWgs84);
                const labelPointFeature4326: TProjectableFeature<Point, IProjectableProperties> = {
                    type: 'Feature',
                    geometry: labelPoint4326,
                    properties: {
                        metersPerUnit: 1,
                        projType: '4326',
                        unitAbbr: 'm',
                        unitName: 'meters',
                        projectors: {
                            "4326": turf.toWgs84,
                            "proj": turf.toMercator
                        }
                    }
                };

                const glyphSetter = GlyphSetter.fromPosition(labelPointFeature4326, labelDef.charsign);
                const _polyText = font.getLabel(name, glyphSetter);
                polyText.push(turf.feature(_polyText, labelDef.fillprop));

            }

        }

    };

    const bufferDist = 12;

    // buffer around symbols
    let bufferPolygons: Polygon[] = [];
    if (multiPolyline025.coordinates.length > 0) {
        const linebuffer018 = turf.buffer(multiPolyline025, bufferDist, {
            units: 'meters'
        }) as Feature<Polygon | MultiPolygon>;
        bufferPolygons.push(...PPGeometry.destructurePolygons(linebuffer018.geometry));
    }

    const polyBuffer: MultiPolygon = {
        type: 'MultiPolygon',
        coordinates: []
    };
    polyText.forEach(p => {
        polyBuffer.coordinates.push(...p.geometry.coordinates)
    });

    // buffer around text polygons
    if (polyBuffer.coordinates.length > 0) {
        const polyTextBuffer = turf.buffer(polyBuffer, bufferDist, {
            units: 'meters'
        }) as Feature<Polygon | MultiPolygon>;
        bufferPolygons.push(...PPGeometry.destructurePolygons(polyTextBuffer.geometry));
    }

    const bufferPolyText = (feature: Feature<MultiPolygon, TFillProps>): Feature<MultiPolygon, TFillProps> => {
        // minor inwards buffer to account for pen width
        const polyTextBufferPolygonsB: Polygon[] = [];
        if (feature.geometry.coordinates.length > 0) {
            const polyTextBufferB = turf.buffer(feature.geometry, -1.15, {
                units: 'meters'
            }) as Feature<Polygon | MultiPolygon>;
            polyTextBufferPolygonsB.push(...PPGeometry.destructurePolygons(polyTextBufferB.geometry));
        }
        return turf.feature(PPGeometry.restructurePolygons(polyTextBufferPolygonsB), feature.properties);
    }
    polyText = polyText.map(p => bufferPolyText(p));

    if (bufferPolygons.length > 0) {
        const bufferUnion = PPGeometry.unionPolygons(bufferPolygons);
        bufferPolygons = PPGeometry.destructurePolygons(bufferUnion);
        polyData = PPGeometry.restructurePolygons(bufferPolygons);
    }

    multiPolyline025 = PPGeometry.bboxClipMultiPolyline(multiPolyline025, workerInput.bboxMap4326);
    turf.cleanCoords(multiPolyline025, {
        mutate: true
    });

    const bboxClipFeature = (feature: Feature<MultiPolygon, TFillProps>): Feature<MultiPolygon, TFillProps> => {
        return turf.feature(PPGeometry.bboxClipMultiPolygon(feature.geometry, workerInput.bboxMap4326), feature.properties);
    }
    polyText = polyText.map(p => bboxClipFeature(p));

    return {
        polyData,
        polyText,
        multiPolyline025
    };

}