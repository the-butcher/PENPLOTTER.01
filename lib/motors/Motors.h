#ifndef Motors_h
#define Motors_h

#include <Arduino.h>
#include <Coords.h>
#include <Define.h>
#include <Motor.h>

class Motors {
   private:
   public:
    static Motor motorA;
    static Motor motorB;
    static Motor motorZ;
    static bool begin();
    static coord_corexy_t getCurCorexy();  // get current corexy coordinate
};

#endif