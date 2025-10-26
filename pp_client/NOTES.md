TBD:

OK improve hachure to not have artifacts at ridges
OK dont allow very sharp angles
-- shorten by n vertices at the top

- some type of spatial index in GeometryUtil to accelerate connecting lines
  NO have crop marks on the light hachure layer
  NO have land labels on the same pen as hachure (maybe draw multiple times to achieve proper darkness with the light color)
  NO decide if contours are needed along the narrow hachures
- think about possibilities to further improve alignment after a pen change
  - maybe on the fly adjustment
  - maybe off screen or extra sheet pattern
- think about ways to maintain direction visibility
  - when connecting ignore lines that are too close (will likely make drawing even slower)
  - how can a cropped map for testing be created?
- forward only is not working with the hardcoded pen check "cnfBSvgProperties.penId === 'h018'"

OK merge paths that are close enough (aka pen diameter) to eliminate pen-up -> no-move -> pen-down movements
OK output scale / simplify tolerance

- visual display of scale
- ui-controls for scale(or output-dim respectively)
- ui-controls for simplification
- data-structures to have original data and the ability to change ui on the fly

OK acceleration-calculation / acceleration diagram

OK connect preview and chart so that mouseover on either element visually indicates the same assets in the other element

OK speed indication on preview
