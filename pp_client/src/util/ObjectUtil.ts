

export class ObjectUtil {

    static NUMBER_OPTIONS_DEFAULT: Intl.NumberFormatOptions = {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    };

    /**
     * create a unique 12-digit id
     * @returns
     */
    static createId(): string {
        return Math.round(Math.random() * 10000000000).toString(16).substring(0, 12);
    }

}