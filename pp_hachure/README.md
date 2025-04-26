# DEM-Hachure

## This repository provides an algorithm to generate hachure lines over a portion of a DEM elevation raster

The code in this repository runs as a web-application in a browser.

### example output

![alt text](public/pp_hachure.png)

### illustration of how it works

https://github.com/user-attachments/assets/6c7db4a7-6e03-49f7-99aa-86bca37f9e61

### Simple description of the steps performed to build hachure lines:

- Load a DEM raster. Due to browser limitations the raster has to be in 16-bit unsigned-int png format
- Build contour lines in defined intervals on top the DEM raster using the [d3-contour](https://d3js.org/d3-contour) library.
- Prepare each contour for further processing, i.e. calculating aspect, slope and hollshade at specific points along individual contour lines.
- Starting with the lowest contour and iterating upwards in height.
  - Start new hachure lines where there is enough space along the contour. The lowermost contour will be empty initially and is populated with an initial set of hachure lines. The hachure lines will have zero length initially and only hold information about the aspect aka the upward direction
    at the specific position.
  - The upward vectors of each hachure line are checked for intersection with the next higher contour line. With the vectors limited to a configurable length, this effectively checks for slope. When an intersection is found, it means that the slope is steep enough to continue a hachure line.
  - When hachure lines get too close to each other, some lines will be marked as complete and don't get continued.
  - When hachure lines get too far apart, new lines are started to fill the gap.

As the algorithm works its way upward from contour to contour hachure lines are either discarded, continued, or new hachure lines are started.
The calculation is resilient at contour ends, as hachure lines will automatically discontinue, when no further intersecions are found.

### scaled-length

An important part of the hachure display are denser lines in specific areas, i.e. on the shadow side of hills.

To achieve this contours are split into segments of equal length initially. At each vertex resulting from the split operation, aspect and slope is calculated. Aspect and slope are then used to calculate a hillshade value as described in [how-hillshade-works](https://pro.arcgis.com/en/pro-app/latest/tool-reference/3d-analyst/how-hillshade-works.htm). Instead of hillshade, aspect only or slope only could also be used, but hillshade appeared to yield better results. The hillshade value is then mapped to a scaled-length value. For a dark hillshade value (lower value) a bigger scaled length is calculated and stored on the vertex. A bigger scaled length value means that the contour can accept more hachure lines around this vertex.

### DEM raster format

The app expects 16-bit unsigned-int png raster files. Due to the app running in the browser there are limits regarding file size and extent covered by the map.

Example raser:

![example raster](public/example.png)

### reference

The idea for "lines competing to work their way uphill" came from an article by Daniel Huffman. The concepts described there helped me very much to build this.
[Automated Hachuring in QGIS](https://somethingaboutmaps.wordpress.com/2024/07/07/automated-hachuring-in-qgis/)
