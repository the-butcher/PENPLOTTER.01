https://craterregistry.com/lunar-nomenclature-database
https://ode.rsl.wustl.edu/moon/pagehelp/Content/Missions_Instruments/LRO/LOLA/SLDEM.htm

One more iteration on the hachure app ... I added and straightened a few things, i.e.:

- Allow spatial references other than web-mercator.
- Add better handling of varying scales and cellsizes.
- Add option to generate plain lines rather than arrows.

https://www.the-butchers.at/DEM-Hachure/

OK build and upload
OK verify that nearThreshold is working
?? initial wait for proj4 to load
OK misbehaviour with very large cellsizes. hachures collapse to be horizontal :: precision problem when checking for intersection
OK link to Daniel Huffman https://somethingaboutmaps.wordpress.com/2024/07/07/automated-hachuring-in-qgis/
OK test with some spatial references like UTM zones, Austria Lambert, ...
NO add spatial reference to the preview
OK provide an updated ArcGIS Pro python script
OK provide updated examples
OK PNG export
OK helper text settings get lost when proceeding with step
OK could add attributes to hachures (min-height, max-height)
OK review helper texts

-- let workers do the heavy lifting
-- better defaults when the raster is large
-- maybe do some resampling on the raster for performance reasons

NO any spatial references with yards or other units? => only specific yards, like yard-indian

OK contour rings are not fully closed
OK contourOff must be a not floating fraction of contourDsp, or no contours are added to output
OK add units to min/max spacing
OK offer hachure settings export and import
OK when the contourDspInterval is changed, contourOff needs to be auto-adapted too
OK contourDsp appears to be chosen too high

OK value limits when editing
OK build
OK Social Media tags
NO reset button in processing
OK controls to show hide helper texts
OK controls to show hide the raster itself
OK complete hachure config
OK add illumination azimuth to hachure config
NO add illumination min max or proportion to hachure config
OK provide the python script used in ArcGIS Pro
OK input field for wkt
NO contour border cutoff does not work with degrees
NO hachure ray length is completely off with degrees
OK make hachure max-length configurable and find a meaningful way to adapt for unit and larger scales
