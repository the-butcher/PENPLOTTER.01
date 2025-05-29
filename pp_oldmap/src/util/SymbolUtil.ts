import * as turf from '@turf/turf';
import { Position } from "geojson";

export class SymbolUtil {

    static createChurchSymbol = (coordinate4326: Position): Position[][] => {

        const baseRadius = 20;
        const startRadius = - Math.PI / 2;
        const endRadius = startRadius + Math.PI * 2;

        const coordinate3857 = turf.toMercator(coordinate4326);

        const churchCoordinates3857: Position[] = [];
        churchCoordinates3857.push([
            coordinate3857[0] - baseRadius,
            coordinate3857[1] - Math.sin(startRadius) * baseRadius * 2.2
        ]);
        churchCoordinates3857.push([
            coordinate3857[0] + baseRadius,
            coordinate3857[1] - Math.sin(startRadius) * baseRadius * 2.2
        ]);
        churchCoordinates3857.push([
            coordinate3857[0],
            coordinate3857[1] - Math.sin(startRadius) * baseRadius * 2.2
        ]);
        churchCoordinates3857.push([
            coordinate3857[0],
            coordinate3857[1] - Math.sin(startRadius) * baseRadius * 3
        ]);
        for (let i = startRadius; i <= endRadius; i += Math.PI / 8) {
            churchCoordinates3857.push([
                coordinate3857[0] + Math.cos(i) * baseRadius,
                coordinate3857[1] - Math.sin(i) * baseRadius
            ]);
        }
        return [churchCoordinates3857.map(treeCoordinate3857 => turf.toWgs84(treeCoordinate3857))];

    }

    static createSummitSymbol = (coordinate4326: Position): Position[][] => {

        const baseRadius = 12;
        const startRadius = - Math.PI / 2;
        const endRadius = startRadius + Math.PI * 2;

        const coordinate3857 = turf.toMercator(coordinate4326);

        const summitCoordinates3857: Position[] = [];
        for (let i = startRadius; i <= endRadius; i += Math.PI / 8) {
            summitCoordinates3857.push([
                coordinate3857[0] + Math.cos(i) * baseRadius,
                coordinate3857[1] - Math.sin(i) * baseRadius
            ]);
        }
        return [summitCoordinates3857.map(treeCoordinate3857 => turf.toWgs84(treeCoordinate3857))];

    }

    static createTownSymbol = (): Position[] => { // coordinate4326: Position

        return [];

    }

    static createTreeSymbol = (coordinate4326: Position): Position[][] => { // coordinate4326: Position

        const baseRadius = 10 + (Math.random() - 0.5) * 6;
        const angleA = Math.PI / 4;
        const angleB = angleA + Math.PI * 2;
        // const angleC = angleB + Math.PI / 3;


        const coordinate3857 = turf.toMercator(coordinate4326);

        const treeCoordinates3857: Position[] = [];
        let i = angleA;
        for (; i <= angleB; i += Math.PI / 8) {
            treeCoordinates3857.push([
                coordinate3857[0] + Math.cos(i) * baseRadius,
                coordinate3857[1] - Math.sin(i) * baseRadius
            ]);
        }
        // for (; i < angleC; i += Math.PI / 8) {
        //     treeCoordinates3857.push([
        //         coordinate3857[0] + Math.cos(i) * (baseRadius + 1),
        //         coordinate3857[1] - Math.sin(i) * (baseRadius + 1)
        //     ]);
        // }
        return [treeCoordinates3857.map(treeCoordinate3857 => turf.toWgs84(treeCoordinate3857))];

    }

    static createWineSymbol = (coordinate4326: Position): Position[][] => { // coordinate4326: Position

        return this.createRingSymbol(coordinate4326, 7);

    }

    static createCableCarSymbol = (coordinate4326: Position): Position[][] => { // coordinate4326: Position

        return this.createRingSymbol(coordinate4326, 6);

    }

    static createRingSymbol = (coordinate4326: Position, baseRadius: number): Position[][] => { // coordinate4326: Position

        const angleA = Math.PI / 4;
        const angleB = angleA + Math.PI * 2;

        const coordinate3857 = turf.toMercator(coordinate4326);

        const wineCoordinates3857: Position[] = [];
        for (let i = angleA; i <= angleB; i += Math.PI / 8) {
            wineCoordinates3857.push([
                coordinate3857[0] + Math.cos(i) * baseRadius,
                coordinate3857[1] - Math.sin(i) * baseRadius
            ]);
        }
        return [wineCoordinates3857.map(treeCoordinate3857 => turf.toWgs84(treeCoordinate3857))];

    }

    static createGraveSymbol = (coordinate4326: Position): Position[][] => { // coordinate4326: Position

        const baseDimension = 12;

        const coordinate3857 = turf.toMercator(coordinate4326);

        const graveCoordinates3857: Position[] = [];
        // horizontal line
        graveCoordinates3857.push([
            coordinate3857[0] - baseDimension,
            coordinate3857[1]
        ]);
        graveCoordinates3857.push([
            coordinate3857[0] + baseDimension,
            coordinate3857[1]
        ]);
        // back to center line
        graveCoordinates3857.push([
            coordinate3857[0],
            coordinate3857[1]
        ]);
        // vertical line
        graveCoordinates3857.push([
            coordinate3857[0],
            coordinate3857[1] + baseDimension * 1
        ]);
        graveCoordinates3857.push([
            coordinate3857[0],
            coordinate3857[1] - baseDimension * 2
        ]);
        return [graveCoordinates3857.map(treeCoordinate3857 => turf.toWgs84(treeCoordinate3857))];

    }

    static createMarshSymbol = (coordinate4326: Position): Position[][] => { // coordinate4326: Position

        const baseDimension = 6;

        const coordinate3857 = turf.toMercator(coordinate4326);
        const coordinateOrig = [
            coordinate3857[0],
            coordinate3857[1] - baseDimension * 3
        ];

        const marshCoordinates3857A: Position[] = [];
        const marshCoordinates3857B: Position[] = [];

        const awayAndBack = (coordinate: Position) => {

            marshCoordinates3857A.push(coordinate);

            const vec: Position = [
                coordinate[0] - coordinateOrig[0],
                coordinate[1] - coordinateOrig[1]
            ];

            const len = Math.sqrt(vec[0] ** 2 + vec[1] ** 2);
            vec[0] /= len;
            vec[1] /= len;

            marshCoordinates3857A.push([
                coordinate[0] + (baseDimension * 6 - len) * vec[0],
                coordinate[1] + (baseDimension * 6 - len) * vec[1],
            ]);
            marshCoordinates3857A.push(coordinate);

        }

        // horizontal line
        const randomVar = 0.7;

        const createUpper = Math.random() > 0.1;
        const createUnder = !createUpper || Math.random() > 0.5;

        marshCoordinates3857A.push([
            coordinate3857[0] - baseDimension * (5 + (Math.random() - 0.5) * randomVar * 2),
            coordinate3857[1]
        ]);
        if (createUpper) {
            awayAndBack([
                coordinate3857[0] - baseDimension * (2.1 + (Math.random() - 0.5) * randomVar),
                coordinate3857[1]
            ]);
            awayAndBack([
                coordinate3857[0] - baseDimension * (0.7 + (Math.random() - 0.5) * randomVar),
                coordinate3857[1]
            ]);
            awayAndBack([
                coordinate3857[0] + baseDimension * (0.7 + (Math.random() - 0.5) * randomVar),
                coordinate3857[1]
            ]);
            awayAndBack([
                coordinate3857[0] + baseDimension * (2.1 + (Math.random() - 0.5) * randomVar),
                coordinate3857[1]
            ]);
        }
        marshCoordinates3857A.push([
            coordinate3857[0] + baseDimension * (5 + (Math.random() - 0.5) * randomVar * 2),
            coordinate3857[1]
        ]);

        if (createUnder) {

            marshCoordinates3857B.push([
                coordinate3857[0] - baseDimension * (3 + (Math.random() - 0.5) * randomVar * 2),
                coordinate3857[1] - baseDimension
            ]);
            marshCoordinates3857B.push([
                coordinate3857[0] + baseDimension * (3 + (Math.random() - 0.5) * randomVar * 2),
                coordinate3857[1] - baseDimension
            ]);

        }

        const result: Position[][] = [];
        result.push(marshCoordinates3857A.map(treeCoordinate3857 => turf.toWgs84(treeCoordinate3857)));
        if (marshCoordinates3857B.length > 0) {
            result.push(marshCoordinates3857B.map(treeCoordinate3857 => turf.toWgs84(treeCoordinate3857)));

        }

        return result;

    }

}