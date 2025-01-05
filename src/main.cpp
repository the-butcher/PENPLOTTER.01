#include <Arduino.h>
#include <Btle.h>
#include <Coords.h>
#include <Display.h>
#include <Machine.h>
#include <Motor.h>
#include <Motors.h>
#include <Switch.h>
#include <Switches.h>
#include <Wire.h>

void setup() {
    Serial.begin(115200);
    delay(3000);
    Serial.println("PP: setup (1)");
    Coords::begin();  // setup list of coordinates
    Switches::begin();
    Motors::begin();
    Machine::begin();
    Display::begin();
    Btle::begin();
    Serial.println("PP: setup (2)");
    while (!Btle::connect()) {
        delay(1000);
    }
    Serial.println("PP: setup (3)");
    delay(5000);
    // Machine::accept({-10.0, 10.0, 0.0}, 25);
}

void loop() {
    // Display::printSwitches();
    // Display::printFrequency();
    if (Machine::motorPrim == nullptr && Coords::hasNextCoordinate()) {
        coord_planar_t nextCoordinate = Coords::getNextCoordinate();
        Serial.print("PP: ");
        Serial.print(String(nextCoordinate.x, 1));
        Serial.print(", ");
        Serial.print(String(nextCoordinate.y, 1));
        Serial.print(", ");
        Serial.print(String(nextCoordinate.z, 1));
        Serial.print(" @ ");
        Serial.println(String(Coords::nextCoordinateIndex - 1));
        Machine::accept(nextCoordinate, 40);
        Btle::setBuffSize();
    }
    Btle::getBuffVals();  // read values, if available
    delay(1);
}
