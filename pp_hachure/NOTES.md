-- value limits when editing

OK build
OK Social Media tags

NO reset button in processing

OK controls to show hide helper texts
OK controls to show hide the raster itself

OK complete hachure config
OK add illumination azimuth to hachure config
-- add illumination min max or proportion to hachure config

OK provide the python script used in ArcGIS Pro

-- input field for wkt
-- make hachure max-length configurable and find a meaningful way to adapt for larger scales

-- Hachure
this.maxHeight = firstVertex.height + 100000 + (Math.random() - 0.5) _ 50000;
this.maxLength = 10000 + (Math.random() - 0.5) _ 50000; // meters

-- RasterDataComponent
reestablish max-raster size in terms of cellsize and hachure spacing
or have hachure limits depending on expected contour lenght

-- check WKT parseability for various CRS's

-- ImageLoaderComponent
create meaningful values depending on raster dim and cellsize
const [hachureConfig, setHachureConfig] = useState<IHachureConfigProps>({
minSpacing: 300,
maxSpacing: 500,
blurFactor: 0.10,
contourOff: 20,
contourDiv: 50,
hachureDeg: 2.5,
contourDsp: 50,
azimuthDeg: 280,
propsCheck: false,
handleHachureConfig
});

-- HachureConfigComponent
create meaningful ranges depending on raster dim and cellsize
const minSpacingMin = 1;
const maxSpacingMax = 500;
const contourOffRange: IRange = {
min: 0.1,
max: 10
};
const contourDivRange: IRange = {
min: 1,
max: 100
};
const hachureDegRange: IRange = {
min: 1,
max: 20
};
