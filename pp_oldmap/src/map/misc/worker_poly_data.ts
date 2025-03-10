import { BBox, Polygon } from 'geojson';
import { VectorTileGeometryUtil } from '../../vectortile/VectorTileGeometryUtil';

self.onmessage = (e) => {

    const name: string = e.data.name;
    const tileData: Polygon[] = e.data.tileData;
    const bboxClp4326: BBox = e.data.bboxClp4326;
    const outin: [number, number] = e.data.outin;

    console.log(`${name}, buffer in-out [${outin[0]}, ${outin[1]}] ...`);
    const polygonsA: Polygon[] = VectorTileGeometryUtil.bufferOutAndIn(VectorTileGeometryUtil.restructureMultiPolygon(tileData), ...outin);
    let polyData = VectorTileGeometryUtil.restructureMultiPolygon(polygonsA);

    console.log(`${name}, clipping ...`);
    polyData = VectorTileGeometryUtil.bboxClipMultiPolygon(polyData, bboxClp4326);

    self.postMessage({
        polyData
    });

}