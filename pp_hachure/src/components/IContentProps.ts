export type TContentBackground = 'light' | 'dark';

/**
 * properties for the ContentComponent
 *
 * @author h.fleischer
 * @since 19.04.2025
 */
export interface IContentProps {
    svgData: string;
    strokeWidth: number;
    background: TContentBackground;
    complete: boolean;
    closed: boolean;
}