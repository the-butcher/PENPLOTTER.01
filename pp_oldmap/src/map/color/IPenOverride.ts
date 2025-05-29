
export type ORIG_PEN = `p018` | `p025` | `p035` | `p050`;

/**
 * w018 - solid blue - water
 * v025 - thinned brown - vegetation
 * h018 - solid brown - hachures
 * h025 - solid brown - contours
 *
 */
export type DEST_PEN = `c018` | `w018` | `w035` | `v025` | `h018` | `h025`;

export interface IPenOverride {
    name: string;
    orig: ORIG_PEN;
    dest: DEST_PEN;
}

const alpha = 1;
export const PEN_COLORS: { [k in ORIG_PEN | DEST_PEN]: string } = {
    c018: `rgba(150, 75, 0, ${alpha})`,
    p018: `rgba(0, 0, 0, ${alpha})`,
    p025: `rgba(0, 0, 0, ${alpha})`,
    p035: `rgba(0, 0, 0, ${alpha})`,
    p050: `rgba(0, 0, 0, ${alpha})`,
    w018: `rgba(0, 0, 100, ${alpha})`,
    w035: `rgba(0, 0, 100, ${alpha})`,
    v025: `rgba(150, 75, 0, 0.2)`,
    h018: `rgba(150, 75, 0, ${alpha})`,
    h025: `rgba(150, 75, 0, ${alpha})`,
};