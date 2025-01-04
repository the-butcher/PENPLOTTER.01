- [ ] read grbl and fluidnc code for
  - [ ] how g-code is parsed
  - [ ] how movements are received
  - [ ] how movements are buffered/scheduled
  - [ ] how the planner works
  - [ ] how acceleration is planned and movements are joined
  - :heavy_check_mark: how bresenham algorithm can be implemented functionally (with references to i.e. Motor::pulse methods)

- [x] use the timing POC that has been implemented to drive the motors with varying speed (aka pulse frequency)
- [x] the limit switch will read 0 on the NC pin by default (grounded), will read 1 when activated (will also read 1 when a contact is broken)