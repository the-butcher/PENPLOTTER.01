#include <Arduino.h>
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
    Serial.println("setup (1)");
    Coords::begin();  // setup list of coordinates
    Switches::begin();
    Motors::begin();
    Machine::begin();
    Display::begin();
    Serial.println("setup (2)");
    delay(5000);
    Serial.println("setup (3)");
    // Machine::accept({-10.0, 10.0, 0.0}, 25);
}

void loop() {
    // Display::printSwitches();
    // Display::printFrequency();
    if (Machine::motorPrim == nullptr && Coords::hasNextCoordinate()) {
        coord_planar_t nextCoordinate = Coords::nextCoordinate();
        // Serial.print("sending next coordinate: ");
        // Serial.print(String(nextCoordinate.x, 1));
        // Serial.print(", ");
        // Serial.print(String(nextCoordinate.y, 1));
        // Serial.print(", ");
        // Serial.println(String(nextCoordinate.z, 1));
        // Serial.print(" @");
        // Serial.println(String(Coords::coordBufferIndex));
        Machine::accept(nextCoordinate, 40);
    }
    // delay(1);
}
