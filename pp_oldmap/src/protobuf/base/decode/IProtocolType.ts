import { IWireType } from "../../IWireType";
import { IExtSource } from "../source/IExtSource";
import { ISubSource } from "../source/ISubSource";


/**
 * definition of a specific type in the protobuf-protocol
 *
 * @author h.fleischer
 * @since 22.07.2019
 */
export interface IProtocolType<T, W extends IWireType> {

    /**
     * ge the IWireType applicable to this instance
     */
    getWireType(): W;

    /**
     * read an instance of T from the given ISubSource
     *
     * @param input
     * @return
     */
    decode(source: ISubSource, ...extern: IExtSource[]): T | undefined;

}