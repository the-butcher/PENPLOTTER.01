#ifndef Coords_h
#define Coords_h

#include <Arduino.h>
#include <Define.h>

const uint16_t BLOCK_BUFFER_SIZE = 512;

typedef struct {
    float x;       // x coord with respect to x home (mm)
    float y;       // y coord with respect to y home (mm)
    float z;       // z coord with respect to z home (mm)
} coord_planar_t;  // 12 bytes

typedef struct {
    float x;       // x coord with respect to x home (mm)
    float y;       // y coord with respect to y home (mm)
    float z;       // z coord with respect to z home (mm)
    float vi;      // entry speed (mm/s)
    float vo;      // exit speed (mm/s)
} block_planar_t;  // 20 bytes

typedef struct {
    int32_t a;     // left motor coord (microstep settings as of motor-A constants)
    int32_t b;     // right motor coord (microstep settings as of motor-B constants)
    int32_t z;     // pen motor coord (microstep settings as of motor-Z constants)
} coord_corexy_t;  // 12 bytes

class Coords {
   private:
    static block_planar_t blockBuffer[BLOCK_BUFFER_SIZE];

   public:
    static bool begin();
    static block_planar_t getNextBlock();
    static bool hasNextBlock();
    static bool addBlock(block_planar_t blockPlanar);
    /**
     * get the size of available buffer space
     */
    static uint16_t getBuffCoordSpace();

    static uint32_t nextBlockIndex;  // the index at which the next coordinate would be read
    static uint32_t blockIndex;      // the index at which the maximum buffered coordinate is (must never be large enough to overwrite coordinates not having been handled yet)

    /**
     * implemented according to https://corexy.com/theory.html
     * NOTE :: a positive A-value relates to a counterclockwise rotation of the A-motor, a positive B-value relates to a counterclockwise rotation of the B-motor
     */
    static coord_corexy_t planarToCorexy(coord_planar_t& coordPlanar);

    /**
     * implemented according to https://corexy.com/theory.html
     * NOTE :: a positive A-value relates to a counterclockwise rotation of the A-motor, a positive B-value relates to a counterclockwise rotation of the B-motor
     */
    static coord_planar_t corexyToPlanar(coord_corexy_t& coordCorexy);

    static coord_corexy_t toCorexyVector(coord_corexy_t& srcCorexy, coord_corexy_t& dstCorexy);

    static bool hasMaximumAVal(coord_corexy_t& coordCorexy);
    static bool hasMaximumBVal(coord_corexy_t& coordCorexy);
};

#endif