import { WireTypeLengthDelimited, WireType } from "../WireType";
import { SubSourceMessage } from "../base/source/SubSourceMessage";
import { TagUtil } from "../TagUtil";
import { ISubSource } from "../base/source/ISubSource";
import { IProtocolType } from "../base/decode/IProtocolType";
import { CodedInputStream } from "../base/source/CodedInputStream";
import { CODE______CLOSE, COMMAND_TYPE, IVectorTileCoordinate } from "./geometry/IVectorTileCoordinate";

/**
 * protocol type specific to the coordinate / path commands as defined by the mapbox vectortile -> geometry specification<br>
 * this type is a reduced implementation that does not store geometries but rather evaluates coordinate / vertex counts only
 *
 * @author h.fleischer
 * @since 26.07.2019
 */
export class ProtocolTypeCoordinates implements IProtocolType<IVectorTileCoordinate[], WireTypeLengthDelimited> {

    decode(source: ISubSource): IVectorTileCoordinate[] {

        // let totalCount: number = 0;
        let subSource: SubSourceMessage | undefined;

        let xrel: number;
        let yrel: number;
        let x = 0;
        let y = 0;

        const coordinates: IVectorTileCoordinate[] = [];
        try {

            // const canvas: HTMLCanvasElement = document.getElementById('tilecanvas')! as HTMLCanvasElement;
            // // canvas.width = 512;
            // // canvas.height = 512;
            // const contxt = canvas.getContext('2d')!;
            // contxt.strokeStyle = 'black';
            // contxt.lineWidth = 0.1;
            // contxt.beginPath();
            // contxt.moveTo(0, 0);
            // contxt.lineTo(2048, 2048);

            subSource = new SubSourceMessage(source);

            while (!subSource.hasReachedLimit()) {

                //console.log("reading command", this);

                const tag: number = subSource.readRawVarint32();
                const coordCount: number = TagUtil.toKey(tag);
                const pathCommand: COMMAND_TYPE = TagUtil.toCode(tag) as COMMAND_TYPE;

                //console.log("tag", tag);
                //console.log("coordCount", coordCount);
                //console.log("pathCommand", pathCommand);



                if (pathCommand == CODE______CLOSE) {
                    coordinates.push({
                        type: pathCommand,
                        x,
                        y
                    });
                    continue;
                }

                // if (pathCommand == CODE____MOVE_TO) {
                //     //start a new PATH
                //     // x = 0;
                //     // y = 0;
                // }

                // let maxX = Number.MIN_VALUE;
                // let maxY = Number.MIN_VALUE;
                for (let coordIndex: number = 0; coordIndex < coordCount; coordIndex++) {

                    xrel = CodedInputStream.decodeZigZag(source.readRawVarint32()); //read x (if value needed --> zigzag decode)
                    yrel = CodedInputStream.decodeZigZag(source.readRawVarint32()); //read y (if value needed --> zigzag decode)
                    // totalCount++;

                    x = x + xrel;
                    y = y + yrel;

                    coordinates.push({
                        type: pathCommand,
                        x,
                        y
                    });
                    // console.log(x / 1024, y / 1024);
                    //store a coordinate from xy

                    // maxX = Math.max(maxX, x);
                    // maxY = Math.max(maxY, y);

                    // if (pathCommand == CODE____MOVE_TO) {
                    //     contxt.moveTo(x / 8, y / 8);
                    // } else if (pathCommand == CODE____LINE_TO) {
                    //     contxt.lineTo(x / 8, y / 8);
                    // }

                }

                // console.log('maxX', maxX / 8, 'maxY', maxY / 8);


            }

            // contxt.stroke();

        } finally {
            if (subSource) {
                subSource.popLimit();
            }
        }
        return coordinates;

    }

    getWireType(): WireTypeLengthDelimited {
        return WireType.get(WireType.INDEX_LENGTH_DELIMITED);
    }

}