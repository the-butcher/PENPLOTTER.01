import { ILayout } from "./ILayout";
import { MapLayerFrame } from "./MapLayerFrame";

export class Layout {

    static LAYOUT_LANDSCAPE: ILayout = {
        cropLROffY: MapLayerFrame.FRAME_BASE_UNIT * 6,
        mapNameOff: [
            -2010,
            -293
        ],
        creditsOff: [
            -2000,
            -500
        ],
        legendOffX: 800,
        legendOffY: [220, 360, 500],
        scalebarOff: [
            -700,
            250
        ],
        northArrOff: [
            25,
            500
        ]
    }

    static LAYOUT__PORTRAIT: ILayout = {
        cropLROffY: MapLayerFrame.FRAME_BASE_UNIT * 10,
        mapNameOff: [
            -980,
            -780
        ],
        creditsOff: [
            -970,
            -880
        ],
        legendOffX: 250,
        legendOffY: [180, 320, 460, 600, 740, 880],
        scalebarOff: [
            -900,
            210
        ],
        northArrOff: [
            1700,
            880
        ]
    }

}