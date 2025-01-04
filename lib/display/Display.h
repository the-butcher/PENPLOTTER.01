#ifndef Display_h
#define Display_h

#include <Arduino.h>
#include <Machine.h>
#include <SparkFun_Alphanumeric_Display.h>
#include <Switches.h>
#include <Wire.h>

class Display {
   private:
    static HT16K33 baseDisplay;

   public:
    static void begin();
    static void printSwitches();
    static void printFrequency();
};

#endif