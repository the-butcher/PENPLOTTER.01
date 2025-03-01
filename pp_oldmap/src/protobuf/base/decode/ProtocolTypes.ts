import { IProtocolTypeDefined } from "./IProtocolTypeDefined";
import { ITypeBuilder } from "./ITypeBuilder";
import { ProtocolTypeDefined } from "./ProtocolTypeDefined";

/**
 * central collection of IProtocolType instances currently stored in scope<br>
 *
 * @author h.fleischer
 * @since 26.07.2019
 */
export class ProtocolTypes {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static ALL: any = {};

    static define<T, F extends ITypeBuilder<T, F>>(name: string, supplierOfFactory: () => F): IProtocolTypeDefined<T, F> {
        return new ProtocolTypeDefined<T, F>(name, supplierOfFactory);
    }

    static fromTypeUid<T, F extends ITypeBuilder<T, F>>(typeUid: string): IProtocolTypeDefined<T, F> {
        const protocolType = ProtocolTypes.ALL[typeUid];
        if (protocolType) {
            return protocolType;
        } else {
            const message = "failed to find protocol type (typeUid: " + typeUid + ")";
            console.log(message);
            throw new Error(message);
        }
    }

}