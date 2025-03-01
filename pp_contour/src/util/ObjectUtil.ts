

export class ObjectUtil {

    static NUMBER_OPTIONS_DEFAULT: Intl.NumberFormatOptions = {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    };

    /**
     * create a unique 6-digit id
     * @returns
     */
    static createId(): string {
        return Math.round(Math.random() * 100000000000).toString(16).substring(0, 16);
    }

    static mapValues(valI: number, minI: number, maxI: number, minO: number, maxO: number): number {
        return Math.max(minO, Math.min(maxO, minO + (valI - minI) * (maxO - minO) / (maxI - minI))); // Math.max(minO, Math.min(maxO, minO + (valI - minI) * (maxO - minO) / (maxI - minI)));
    }

}