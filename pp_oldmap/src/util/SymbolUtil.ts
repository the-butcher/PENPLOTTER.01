import * as turf from '@turf/turf';
import { Position } from "geojson";

export class SymbolUtil {

    static createChurchSymbol = (coordinate4326: Position): Position[] => {

        const baseRadius = 12;
        const startRadius = - Math.PI / 2;
        const endRadius = startRadius + Math.PI * 2;

        const coordinate3857 = turf.toMercator(coordinate4326);

        const treeCoordinates3857: Position[] = [];
        treeCoordinates3857.push([
            coordinate3857[0] - baseRadius,
            coordinate3857[1] - Math.sin(startRadius) * baseRadius * 2.2
        ]);
        treeCoordinates3857.push([
            coordinate3857[0] + baseRadius,
            coordinate3857[1] - Math.sin(startRadius) * baseRadius * 2.2
        ]);
        treeCoordinates3857.push([
            coordinate3857[0],
            coordinate3857[1] - Math.sin(startRadius) * baseRadius * 2.2
        ]);
        treeCoordinates3857.push([
            coordinate3857[0],
            coordinate3857[1] - Math.sin(startRadius) * baseRadius * 3
        ]);
        for (let i = startRadius; i <= endRadius; i += Math.PI / 8) {
            treeCoordinates3857.push([
                coordinate3857[0] + Math.cos(i) * baseRadius,
                coordinate3857[1] - Math.sin(i) * baseRadius
            ]);
        }
        return treeCoordinates3857.map(treeCoordinate3857 => turf.toWgs84(treeCoordinate3857));

    }

    static createSummitSymbol = (coordinate4326: Position): Position[] => {

        const baseRadius = 12;
        const startRadius = - Math.PI / 2;
        const endRadius = startRadius + Math.PI * 2;

        const coordinate3857 = turf.toMercator(coordinate4326);

        const treeCoordinates3857: Position[] = [];
        for (let i = startRadius; i <= endRadius; i += Math.PI / 8) {
            treeCoordinates3857.push([
                coordinate3857[0] + Math.cos(i) * baseRadius,
                coordinate3857[1] - Math.sin(i) * baseRadius
            ]);
        }
        return treeCoordinates3857.map(treeCoordinate3857 => turf.toWgs84(treeCoordinate3857));

    }

    static createTownSymbol = (coordinate4326: Position): Position[] => {

        // const baseRadius = 8;
        // const startRadius = - Math.PI / 2;
        // const endRadius = startRadius + Math.PI * 2;

        // const coordinate3857 = turf.toMercator(coordinate4326);

        // const treeCoordinates3857: Position[] = [];
        // for (let i = startRadius; i <= endRadius; i += Math.PI / 8) {
        //     treeCoordinates3857.push([
        //         coordinate3857[0] + Math.cos(i) * baseRadius,
        //         coordinate3857[1] - Math.sin(i) * baseRadius
        //     ]);
        // }
        // return treeCoordinates3857.map(treeCoordinate3857 => turf.toWgs84(treeCoordinate3857));

        return [];

    }

}