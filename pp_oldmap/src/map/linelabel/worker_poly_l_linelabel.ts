import * as turf from '@turf/turf';
import { Feature, GeoJsonProperties, LineString, MultiPolygon, Polygon } from "geojson";
import { ILabelDef } from "../ILabelDef";
import { IWorkerPolyInputLineLabel } from "./IWorkerPolyInputLineLabel";
import { IWorkerPolyOutputLineLabel } from './IWorkerPolyOutputLineLabel';

// @ts-expect-error no index file
import * as JSONfn from 'json-fn';
import { MapDefs } from '../MapDefs';
import { ILabelDefLineLabel } from './ILabelDefLineLabel';

import { FacetypeFont, GlyphSetter } from 'pp-font';
import { IProjectableProperties, PPGeometry, TFillProps, TProjectableFeature } from 'pp-geom';

self.onmessage = (e) => {

    handleMessage(e).then(workerOutput => {
        self.postMessage(workerOutput);
    });

}

const handleMessage = async (e: MessageEvent<IWorkerPolyInputLineLabel>): Promise<IWorkerPolyOutputLineLabel> => {

    const workerInput: IWorkerPolyInputLineLabel = e.data;

    const tileData: Feature<LineString, GeoJsonProperties>[] = [];
    workerInput.tileData.forEach(t => {
        const clipped = turf.bboxClip(t.geometry, workerInput.bboxMap4326);
        if (clipped.geometry.type === 'MultiLineString') {
            const clippedPolylines = PPGeometry.destructurePolylines(clipped.geometry);
            clippedPolylines.forEach(clippedPolyline => {
                tileData.push(turf.feature(clippedPolyline, t.properties));
            })
        } else if (clipped.geometry.type === 'LineString') {
            tileData.push(turf.feature(clipped.geometry, t.properties));
        }
    });

    const lineNames = new Set(tileData.map(f => f.properties!.name));
    console.log('lineNames', lineNames);

    let polyText: Feature<MultiPolygon, TFillProps>[] = [];

    const labelDefs: ILabelDef[] = workerInput.labelDefs.map(d => {
        const labelDefOmit: Omit<ILabelDefLineLabel, 'idxvalid'> = {
            ...d
        };
        return {
            ...labelDefOmit,
            idxvalid: JSONfn.parse(d.idxvalid)
        }
    });

    const lineNameArray = Array.from(lineNames);
    for (let i = 0; i < lineNameArray.length; i++) {

        const lineName = lineNameArray[i];

        const namedLines = tileData.filter(f => f.properties!.name === lineName).map(f => f.geometry);
        const connectedLinesA = PPGeometry.restructurePolylines(namedLines);
        const connectedLinesB = PPGeometry.connectMultiPolyline(connectedLinesA, 5);
        const connectedLinesC = PPGeometry.destructurePolylines(connectedLinesB);

        // console.log(namedLines, connectedLinesC);

        if (connectedLinesC.length > 0) {

            for (let a = 0; a < connectedLinesC.length; a++) {

                // let polyName = VectorTileGeometryUtil.emptyMultiPolygon();

                let labelDef: ILabelDef = {
                    tileName: lineName,
                    plotName: lineName,
                    distance: 0.50,
                    vertical: 16,
                    charsign: 1.2,
                    txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                    fonttype: 'noto_serif________regular',
                    idxvalid: () => true,
                    fillprop: {
                        type: 'none'
                    }
                };
                // console.log('lineName', lineName, labelDefs)
                for (let i = 0; i < labelDefs.length; i++) {
                    if (labelDefs[i].plotName === lineName) {
                        labelDef = labelDefs[i];
                        break;
                    }
                }

                if (!labelDef.idxvalid(a)) {
                    continue;
                }

                let labelLine4326 = connectedLinesC[a]; // turf.bboxClip(connectedLinesB[a], bboxMap4326).geometry as LineString;
                turf.cleanCoords(labelLine4326, {
                    mutate: true
                });
                const labelLineLength = turf.length(turf.feature(labelLine4326), {
                    units: 'meters'
                });
                if (labelLineLength === 0) {
                    continue; // next
                };

                turf.rewind(labelLine4326, {
                    mutate: true
                });
                labelLine4326 = turf.lineSliceAlong(labelLine4326, labelLineLength * labelDef.distance, labelLineLength, {
                    units: 'meters'
                }).geometry;

                const font = await FacetypeFont.getInstance(labelDef.fonttype, labelDef.txtscale);

                labelLine4326 = turf.lineOffset(labelLine4326, labelDef.vertical - font.getMidY(), {
                    units: 'meters'
                }).geometry;
                const labelLineFeature4326: TProjectableFeature<LineString, IProjectableProperties> = {
                    type: 'Feature',
                    geometry: labelLine4326,
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

                const glyphSetter = GlyphSetter.alongLabelLine(labelLineFeature4326, labelDef.charsign);
                const _polyText = font.getLabel(lineName, glyphSetter);
                polyText.push(turf.feature(_polyText, labelDef.fillprop));

            };

        }

    }

    const polyBuffer: MultiPolygon = {
        type: 'MultiPolygon',
        coordinates: []
    };
    polyText.forEach(p => {
        polyBuffer.coordinates.push(...p.geometry.coordinates)
    });

    const polyTextBufferPolygonsA: Polygon[] = [];
    if (polyBuffer.coordinates.length > 0) {
        const polyTextBufferA = turf.buffer(polyBuffer, 8, {
            units: 'meters'
        }) as Feature<Polygon | MultiPolygon>;
        polyTextBufferPolygonsA.push(...PPGeometry.destructurePolygons(polyTextBufferA.geometry));
    }
    let polyData = PPGeometry.restructurePolygons(polyTextBufferPolygonsA);

    const bufferPolyText = (feature: Feature<MultiPolygon, TFillProps>): Feature<MultiPolygon, TFillProps> => {
        // minor inwards buffer to account for pen width
        const polyTextBufferPolygonsB: Polygon[] = [];
        if (feature.geometry.coordinates.length > 0) {
            const polyTextBufferB = turf.buffer(feature.geometry, -0.30, {
                units: 'meters'
            }) as Feature<Polygon | MultiPolygon>;
            polyTextBufferPolygonsB.push(...PPGeometry.destructurePolygons(polyTextBufferB.geometry));
        }
        return turf.feature(PPGeometry.restructurePolygons(polyTextBufferPolygonsB), feature.properties);
    }
    polyText = polyText.map(p => bufferPolyText(p));

    console.log(`${workerInput.name}, clipping ...`);
    polyData = PPGeometry.bboxClipMultiPolygon(polyData, workerInput.bboxClp4326);

    const bboxClipFeature = (feature: Feature<MultiPolygon, TFillProps>): Feature<MultiPolygon, TFillProps> => {
        return turf.feature(PPGeometry.bboxClipMultiPolygon(feature.geometry, workerInput.bboxMap4326), feature.properties);
    }
    polyText = polyText.map(p => bboxClipFeature(p));

    return {
        polyData,
        polyText
    };

}