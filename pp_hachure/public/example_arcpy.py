import arcpy
import os
import json

# duernstein
cnt_x = 1726700.640254
cnt_y = 6173400.459849

# aprx, map and spatial reference
aprx = arcpy.mp.ArcGISProject("CURRENT")
crs = aprx.activeMap.spatialReference

# output postfix
postfix = aprx.activeMap.name

# full output dimensions plus tolerance
dim_t = 1.25
dim_x = 4000 * dim_t
dim_y = 2828 * dim_t

# semi output dimensions
smi_x = dim_x / 2
smi_y = dim_y / 2
# output extent min
min_x = cnt_x - smi_x
min_y = cnt_y - smi_y
# output extent max
max_x = cnt_x + smi_x
max_y = cnt_y + smi_y

# set up paths
rastername__input = "base_dem"
rastername_sample = "[path_to_output]/png_height_scaled_" + postfix + ".png"
rastername_raster = "[path_to_output]/tif_height_raster_" + postfix + ".tif"
file__name_config = "[path_to_output]/png_height_scaled_" + postfix + ".pgc"

# get some info about the input raster
raster__input = arcpy.Raster(rastername__input)
cellsize = (raster__input.meanCellWidth + raster__input.meanCellHeight) / 2
# reduce raster size, if required
# cellsize = cellsize * 3

# set up base copy raster parameters
config_keyword = ""    
background_value = 0
nodata_value = 0
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
arcpy.management.CopyRaster(rastername__input, rastername_sample, config_keyword, background_value, nodata_value, onebit_to_eightbit, colormap_to_RGB, pixel_type, scale_pixel_value, RGB_to_Colormap, format, transform, process_as_multidimensional, build_multidimensional_transpose)
raster_sample = arcpy.Raster(rastername_sample)

# alter input values for reference raster output
scale_pixel_value = "NONE"
format = "TIFF"
pixel_type = "32_BIT_FLOAT"
arcpy.env.addOutputsToMap = False

# create reference raster
arcpy.management.CopyRaster(rastername__input, rastername_raster, config_keyword, background_value, nodata_value, onebit_to_eightbit, colormap_to_RGB, pixel_type, scale_pixel_value, RGB_to_Colormap, format, transform, process_as_multidimensional, build_multidimensional_transpose)
raster_raster = arcpy.Raster(rastername_raster)
cellsize = (raster_raster.meanCellWidth + raster_raster.meanCellHeight) / 2

# create raster config
raster_config = {
    "cellsize": cellsize,
    "wkt": crs.exportToString(),
    "valueRange": {
        "min": raster_raster.minimum,
        "max": raster_raster.maximum,
    },
    "originProj": [
        raster_sample.extent.XMin + cellsize / 2,
        raster_sample.extent.YMax - cellsize / 2
    ]
}

# write raster config
json___config = json.dumps(raster_config, indent=4)
with open(file__name_config, "w") as outfile:
    outfile.write(json___config)

# delete reference raster
arcpy.management.Delete(raster_raster)


