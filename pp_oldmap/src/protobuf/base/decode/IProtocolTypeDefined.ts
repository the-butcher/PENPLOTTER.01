import { IProtocolType } from "./IProtocolType";
import { WireTypeLengthDelimited } from "../../WireType";
import { ITypeBuilder } from "./ITypeBuilder";

/**
 * definition of a specific "complex" type in the protobuf-protocol having keys / properties
 *
 * @author h.fleischer
 * @since 22.07.2019
 */
export interface IProtocolTypeDefined<T, F extends ITypeBuilder<T, F>> extends IProtocolType<T, WireTypeLengthDelimited> {

    /**
     * get the name of this defined type
     */
    getName(): string;

    /**
     * add a new instance of {@link IProtocolKeyDefined}, which is a readonly key due to the missing instance function<br>
     *
     * @param key
     * @param keyConsumer a factory consumer returning the factory itself
     * @return
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defineKey(name: string, key: number, typeUid: string, consumer: (builder: F, value: any) => F): void;

    /**
     * create a new instance of {@link ITypeBuilder} suitable for this protocol type<br>
     *
     * @return
     */
    newTypeBuilder(): F;

}