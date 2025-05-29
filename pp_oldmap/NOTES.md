OK pen widths / pen previews need to be fixed
OK buildings may need further inset
OK building -> 0.18
-- frame texts thinner 0.25 => 0.18
OK spacing of dashes
-- dedicated crop pen (so every other pen gets calibrated with the same process)

OK slope hatching
NO have 2 rgb caches, slope and aspect and come up with pixel format convention for each
OK use stretch in ArcGIS Pro and use the valuesprovided by that
OK copy respective raters to png_16 so they can be read in java
OK read png_16 rasters with java and write png_r8_g8 rasters for usage in javascript
OK invent hachure generation algorithm on top of the png_r8_g8 rasters

OK have some kind of error feedback when a step fails
OK error in the hainburg extent (changed cleanAndSimplify code)
OK create possibility for label (+line-label) injection
OK river-labels missing in vienna (added label-class 2)
OK Seilbahn

OK symbol filter for line labels
OK re-implement fill polygons (maybe just use some union geometry and remove code)
OK allow switching of display to pure map svg display
OK add some logic (bridges?) to know if a road is passing over i.e. a highway

OK sharper edges around buildings
OK first insets with a thinner pen
OK wider buffer steps (2 meters and the 0.5 pen roughen the paper)
OK check different speeds to edge sharpness

OK labels
OK find out how much information about labels is available in the tiles

OK water lines narrower

OK no trees unless better symbology is found

OK streets
OK street double lines with 0.1, highway double lines 0.3
OK street single lines with 0.3
OK improve self-clip distance and try to join corners, so the pen does not lift at intersections

OK pen change without repeated homing (hopefully better precision across different thicknesses)
OK introduce some contract in the svg that the client app would understand and consider in sorting and connecting lines
OK at "pen boundaries" no further commands would be send to machine (which may be homing at that point (?)) and the user would be prompted to change pen and confirm

OK drawing "stages" (?)
-- allow i.e. labels to be applied to a drawing state that does not require full rebuild
-- review all layers for
-- code duplication
OK possibility to separate into drawing stages
NO maybe some type of config schema for layers, so some properties can be changed at runtime
NO maybe some type of storage format, so expensive calculations can be preserved

-- flowing water (not used currently)
https://www.data.gv.at/katalog/en/dataset/bev_digitaleslandschaftsmodellgewsserstichtag25102022/resource/a02af662-98dc-4d45-b986-3b234de1869d#resources
-- standing water
https://www.data.gv.at/katalog/dataset/ce50ffa6-5032-4771-90a2-1c48d6a0ac85
-- basemap vectortile
https://basemap.at/standard-5/
-- basemap höhenlinien
https://basemap.at/standard-3/

OK be able to convert a single typeface.js character to geojson geometry
OK like in the client project this could be done with temporary paths and getPointAtLength
OK be able to put multiple characters next to each other, find out if this should rather be done before or after conversion to geojson

OK be able to create shapes in tile-space (=output svg space), then convert back to webmercator, then to wgs84 to have shapes that can be applied as clip geometries onto the geometries acquired from vector tiles

https://github.com/mikolalysenko/vectorize-text?tab=readme-ov-file

-- OK :: be able to find tiles by coordinates
-- OK :: be able to union features from multiple tiles
-- OK :: find an appropriate free font :: https://github.com/notofonts/noto-fonts/blob/main/hinted/ttf/NotoSerif/NotoSerif-Regular.ttf

-- TODO :: identify layers to be drawn and how to draw them
OK would be nice if no esri tech was involved at runtime (maybe with the exception of preparation of some geojson)
OK public data only!
-- helper :: fliessgewässer for joining segments of the same river
-- helper :: stehende gewässer for better quality
OK assume the basemap vector tile cache to be public, which it is per "nutzungsbedingungen"
OK WATER :: find a way to get river polylines for the area of interest and use them to join river polygons, i.e. where they are separated by a bridge
