PROCESS:

- ## in pp_oldmap svg
  - rename water and river_tx pens to w018
  - 1. draw p013 with 0.25 brown pen -> keep for later usage
  - 2. draw w018 with 0.18 pen (blue ink) -> clean 0.18 pen for black use afterwards
  - 3. draw p025 with 0.25 pen -> clean
  - 4. draw p018 with 0.18 pen -> clean
  - 5. draw p035 with 0.35 pen -> clean
  - 6. draw p050 with 0.50 pen -> clean

TBD:

- merge paths that are close enough (aka pen diameter) to eliminate pen-up -> no-move -> pen-down movements
- output scale / simplify tolerance

  - visual display of scale
  - ui-controls for scale(or output-dim respectively)
  - ui-controls for simplification
  - data-structures to have original data and the ability to change ui on the fly

- acceleration-calculation / acceleration diagram

  - connect preview and chart so that mouseover on either element visually indicates the same assets in the other element

- speed indication on preview
