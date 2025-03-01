#ifndef Btle_h
#define Btle_h

#include <Arduino.h>
#include <ArduinoBLE.h>
#include <Coords.h>
#include <Define.h>

#include "WiFiS3.h"

class Btle {
   private:
    static BLEDevice bleCentral;
    static BLEService bleService;
    static BLEUnsignedIntCharacteristic bleBuffSizeCharacteristic;
    static BLECharacteristic bleBuffValsCharacteristic;
    static BLECharacteristic blePositionCharacteristic;

   public:
    static bool begin();
    static bool connect();
    static void setBuffSize();
    static bool getBuffVals();
    static void setPosition();
};

#endif