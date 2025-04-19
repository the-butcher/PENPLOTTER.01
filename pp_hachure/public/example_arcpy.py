import arcpy
import os
import json

# center of output extent
cnt_x = 1519500.640254
cnt_y = 6034100.459849

# full output dimensions plus tolerance
dim_x = 4000 * 1.25
dim_y = 2828 * 1.25
# semi output dimensions
smi_x = dim_x / 2
smi_y = dim_y / 2
# output extent min
min_x = cnt_x - smi_x
min_y = cnt_y - smi_y
# output extent max
max_x = cnt_x + smi_x
max_y = cnt_y + smi_y
# spatial reference
crs = arcpy.SpatialReference("WGS_1984_Web_Mercator_Auxiliary_Sphere")

rastername__input = "dem_raster_as_in_map.tif"
rastername_sample = "[path_to_output]/raster_output.png"
rastername_raster = "[path_to_output]/raster___temp.tif"
file__name_config = "[path_to_output]/raster_config.pgc"

raster__input = arcpy.Raster(rastername__input)
cellsize = (raster__input.meanCellWidth + raster__input.meanCellHeight) / 2

# set up base copy raster inputs
config_keyword = ""
background_value = 0
nodata_value = "0"
onebit_to_eightbit = "NONE"
colormap_to_RGB = "NONE"
pixel_type = "16_BIT_UNSIGNED"
scale_pixel_value = "ScalePixelValue"
RGB_to_Colormap = "NONE"
format = "PNG"
transform = "NONE"
process_as_multidimensional = "CURRENT_SLICE"
build_multidimensional_transpose = "NO_TRANSPOSE"

# set up arcpy environments
arcpy.env.cellSize = cellsize
arcpy.env.outputCoordinateSystem = crs
arcpy.env.resamplingMethod = "CUBIC"
arcpy.env.pyramid = "PYRAMIDS"
arcpy.env.rasterStatistics = "STATISTICS"
arcpy.env.extent = arcpy.Extent(min_x, min_y, max_x, max_y, 0, 0, 0, 0, crs)
arcpy.env.addOutputsToMap = True

# create the 16-bit raster that will be the base for later work
arcpy.management.CopyRaster(
    rastername__input,
    rastername_sample,
    config_keyword,
    background_value,
    nodata_value,
    onebit_to_eightbit,
    colormap_to_RGB,
    pixel_type,
    scale_pixel_value,
    RGB_to_Colormap,
    format,
    transform,
    process_as_multidimensional,
    build_multidimensional_transpose,
)
raster_sample = arcpy.Raster(rastername_sample)

# adjust copy raster inputs for temp raster, which is needed to evaluate min/max values
scale_pixel_value = "NONE"
format = "TIFF"
pixel_type = "32_BIT_FLOAT"
arcpy.env.addOutputsToMap = False

# create temp raster
arcpy.management.CopyRaster(
    rastername__input,
    rastername_raster,
    config_keyword,
    background_value,
    nodata_value,
    onebit_to_eightbit,
    colormap_to_RGB,
    pixel_type,
    scale_pixel_value,
    RGB_to_Colormap,
    format,
    transform,
    process_as_multidimensional,
    build_multidimensional_transpose,
)
raster_raster = arcpy.Raster(rastername_raster)

# dictionary holding the raster config properties
raster_config = {
    "cellsize": cellsize,
    "valueRange": {
        "min": raster_raster.minimum,
        "max": raster_raster.maximum,
    },
    "origin3857": [
        raster_sample.extent.XMin + cellsize / 2,
        raster_sample.extent.YMax - cellsize / 2,
    ],
}

# dump raster config to file
json___config = json.dumps(raster_config, indent=4)
with open(file__name_config, "w") as outfile:
    outfile.write(json___config)

# cleanup temp raster
arcpy.management.Delete(raster_raster)
