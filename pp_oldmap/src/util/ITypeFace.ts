export interface ITypefaceFont {
    glyphs: { [K in string]: ITypefaceGlyph };
    familyName: string;
    ascender: number;
    descender: number;
    underlinePosition: number;
    underlineThickness: number;
    boundingBox: ITypefaceBBox;
    resolution: number;
    cssFontWeight: string;
    cssFontStyle: string;
    original_font_information: ITypefaceOriginal;
}

export interface ITypefaceBBox {
    yMin: number;
    xMin: number;
    yMax: number;
    xMax: number;
}

export interface ITypefaceGlyph {
    ha: number;
    x_min: number;
    x_max: number;
    o: string;
}

export interface ITypefaceOriginal {
    "format": number;
    "copyright": string;
    "fontFamily": string;
    "fontSubfamily": string;
    "uniqueID": string;
    "fullName": string;
    "version": string;
    "postScriptName": string;
    "trademark": string;
    "manufacturer": string;
    "designer": string;
    "description": string;
    "manufacturerURL": string;
    "designerURL": string;
    "licence": string;
    "licenceURL": string;
}