#ifndef Switches_h
#define Switches_h

#include <Arduino.h>
#include <Define.h>
#include <Switch.h>

class Switches {
   private:
   public:
    static Switch switchX;
    static Switch switchY;
    static Switch switchZ;
    static bool begin();
    static bool isAnySwitchPressed();
};

#endif