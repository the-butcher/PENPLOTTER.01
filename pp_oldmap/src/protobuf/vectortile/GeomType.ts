import { IGeomType } from "./IGeomType";
// import { IDataType } from "../../vectortile/data/IDataType";
// import { DataType } from "../../vectortile/data/DataType";

class GeomTypePoint implements IGeomType {
    getName(): string {
        return 'point';
    }
}

class GeomTypeLinestring implements IGeomType {
    getName(): string {
        return 'line';
    }
}

class GeomTypePolygon implements IGeomType {
    getName(): string {
        return 'polygon';
    }
}

class GeomTypeUnknown implements IGeomType {
    getName(): string {
        return 'unknown';
    }
}


/**
 * accessor util to IGeomType instances<br>
 *
 * @author h.fleischer
 * @since 26.07.2019
 */
export class GeomType {

    static INDEX______POINT: number = 1;
    static INDEX_LINESTRING: number = 2;
    static INDEX____POLYGON: number = 3;
    static INDEX____UNKNOWN: number = 4;

    static ALL: IGeomType[] = [
        new GeomTypePoint(), //1
        new GeomTypeLinestring(), //2
        new GeomTypePolygon(), //3
        new GeomTypeUnknown()
    ]

    /**
     * resolves a raw geometry type enum value to an instance of IGeomType<br>
     * @param index
     * @throws an error if the index is out of the valid value range (1-point, 2-polyline, 3-polygon)
     */
    static get(index: number): IGeomType {
        if (index >= 1 && index <= GeomType.ALL.length) {
            return this.ALL[index - 1];
        } else {
            const message: string = `failed to resolve geomtype (index: ${index})`;
            console.log(message);
            return this.ALL[this.INDEX____UNKNOWN];
        }
    }

}