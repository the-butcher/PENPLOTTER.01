#ifndef Machine_h
#define Machine_h

#include <Arduino.h>
#include <Coords.h>
#include <FspTimer.h>
#include <Motor.h>
#include <Motors.h>
#include <Switches.h>

class Machine {
   private:
    static FspTimer pulseTimer;

   public:
    static uint64_t pulseCount;

    /**
     * setup and start a timer
     */
    static bool begin();

    static bool accept(coord_planar_t dstPlanar, float vi, float vo);  // accept a new destination coordinate and immediately start moving to, or drawing to the new coordinate

    /**
     * adjust the pulse timer to run at a the given frequency
     */
    static void updateFrequency(float frequency);

    static void pulse(timer_callback_args_t __attribute((unused)) * p_args);

    /**
     * set the A and B counters to reflect the given planar coordinate
     */
    static void reset(float x, float y);

    /**
     * pause for a moment to make further decisions
     */
    static void yield();

    static bool homedX;
    static bool homedY;
    static bool homedZ;

    static Motor* motorPrim;  // primary motor
    static Motor* motorSec1;  // secondary motor 1
    static Motor* motorSec2;  // secondary motor 2

    /**
     * microseconds needed to complete the current block
     */
    static uint64_t microsTotal;

    /**
     * microseconds when the machine entered the current block
     */
    static uint64_t microsEntry;

    /**
     * entry-frequency of the current block
     */
    static float frqI;

    /**
     * exit-frequency of the current block
     */
    static float frqO;

    /**
     * frequency-acceleration of the current block doubled
     */
    static float frqA2;

    /**
     * entry-frequency of the current block squared
     */
    static float frqII;

    /**
     * primary counter
     */
    static uint32_t cPrim;
    /**
     * primary delta
     */
    static uint32_t dPrim;
    /**
     * secondary delta 1
     */
    static uint32_t dSec1;
    /**
     * secondary delta 2
     */
    static uint32_t dSec2;
    /**
     * error 1
     */
    static int32_t eSec1;
    /**
     * error 2
     */
    static int32_t eSec2;
};

#endif