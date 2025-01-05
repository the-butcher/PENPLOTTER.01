#ifndef Coords_h
#define Coords_h

#include <Arduino.h>
#include <Define.h>

const uint16_t COORD_BUFFER_SIZE = 512;

typedef struct {
    float x;  // x coord with respect to x home
    float y;  // y coord with respect to y home
    float z;  // z coord with respect to z home
} coord_planar_t;

typedef struct {
    int32_t a;  // left motor coord (microstep settings as of motor-A constants)
    int32_t b;  // right motor coord (microstep settings as of motor-B constants)
    int32_t z;  // pen motor coord (microstep settings as of motor-Z constants)
} coord_corexy_t;

class Coords {
   private:
    static coord_planar_t coordBuffer[COORD_BUFFER_SIZE];

   public:
    static bool begin();
    static coord_planar_t getNextCoordinate();
    static bool hasNextCoordinate();
    static bool addBuffCoordinate(coord_planar_t coordPlanar);
    /**
     * get the size of available buffer space
     */
    static uint16_t getBuffCoordSpace();

    static uint32_t nextCoordinateIndex;  // the index at which the next coordinate would be read
    static uint32_t buffCoordinateIndex;  // the index at which the maximum buffered coordinate is (must never be large enough to overwrite coordinates not having been handled yet)

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