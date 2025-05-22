import * as turf from '@turf/turf';
import { Feature, GeoJsonProperties, LineString, MultiPolygon, Polygon } from "geojson";
import { VectorTileGeometryUtil } from "../../vectortile/VectorTileGeometryUtil";
import { ILabelDef } from "../ILabelDef";
import { IWorkerPolyInputLineLabel } from "./IWorkerPolyInputLineLabel";
import { IWorkerPolyOutputLineLabel } from './IWorkerPolyOutputLineLabel';

// @ts-expect-error no index file
import * as JSONfn from 'json-fn';
import { MapDefs } from '../MapDefs';
import { ILabelDefLineLabel } from './ILabelDefLineLabel';

import { FacetypeFont, GlyphSetter } from 'pp-font';
import { IProjectableProperties, PPGeometry, TProjectableFeature } from 'pp-geom';

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

    let polyText = PPGeometry.emptyMultiPolygon();

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
        const connectedLinesB = VectorTileGeometryUtil.connectMultiPolyline(connectedLinesA, 5);
        const connectedLinesC = PPGeometry.destructurePolylines(connectedLinesB);

        // console.log(namedLines, connectedLinesC);

        if (connectedLinesC.length > 0) {

            for (let a = 0; a < connectedLinesC.length; a++) {

                // let polyName = VectorTileGeometryUtil.emptyMultiPolygon();

                let labelDef: ILabelDef = {
                    tileName: lineName,
                    plotName: lineName,
                    distance: 0.50,
                    vertical: 12,
                    charsign: 0,
                    txtscale: MapDefs.DEFAULT_TEXT_SCALE_LINELABEL,
                    fonttype: 'Noto Serif',
                    idxvalid: () => true
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
                polyText.coordinates.push(..._polyText.coordinates);

            };

        }

    }

    const polyTextBufferPolygonsA: Polygon[] = [];
    if (polyText.coordinates.length > 0) {
        const polyTextBufferA = turf.buffer(polyText, 8, {
            units: 'meters'
        }) as Feature<Polygon | MultiPolygon>;
        polyTextBufferPolygonsA.push(...PPGeometry.destructurePolygons(polyTextBufferA.geometry));
    }
    let polyData = PPGeometry.restructurePolygons(polyTextBufferPolygonsA);

    // minor inwards buffer to account for pen width
    const polyTextBufferPolygonsB: Polygon[] = [];
    if (polyText.coordinates.length > 0) {
        const polyTextBufferB = turf.buffer(polyText, -0.5, {
            units: 'meters'
        }) as Feature<Polygon | MultiPolygon>;
        polyTextBufferPolygonsB.push(...PPGeometry.destructurePolygons(polyTextBufferB.geometry));
    }
    polyText = PPGeometry.restructurePolygons(polyTextBufferPolygonsB);

    console.log(`${workerInput.name}, clipping ...`);
    polyData = PPGeometry.bboxClipMultiPolygon(polyData, workerInput.bboxClp4326);
    polyText = PPGeometry.bboxClipMultiPolygon(polyText, workerInput.bboxMap4326);

    return {
        polyData,
        polyText
    };

}