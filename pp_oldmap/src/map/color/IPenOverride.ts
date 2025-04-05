
export type ORIG_PEN = 'p018' | 'p025' | 'p035' | 'p050';

/**
 * w018 - solid blue - water
 * v025 - thinned brown - vegetation
 * h018 - solid brown - hachures
 * h025 - solid brown - contours
 *
 */
export type DEST_PEN = 'w018' | 'w035' | 'v025' | 'h018' | 'h025';

export interface IPenOverride {
    name: string;
    orig: ORIG_PEN;
    dest: DEST_PEN;
}

export const PEN_COLORS: { [k in ORIG_PEN | DEST_PEN]: string } = {
    p018: 'rgba(0, 0, 0, 1)',
    p025: 'rgba(0, 0, 0, 1)',
    p035: 'rgba(0, 0, 0, 1)',
    p050: 'rgba(0, 0, 0, 1)',
    w018: 'rgba(0, 0, 100, 1)',
    w035: 'rgba(0, 0, 100, 1)',
    v025: 'rgba(150, 75, 0, 0.2)',
    h018: 'rgba(150, 75, 0, 1)',
    h025: 'rgba(150, 75, 0, 1)',
};