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

    // Machine::reset(0.0, 0.0);
    // Machine::homedX = true;
    // Machine::homedY = true;
    // Machine::homedZ = true;
    // Motors::motorZ.cntrCur = 0;

    // Coords::addBlock({20, 20, -8, 10, 10});

    for (uint8_t index = 0; index < 5; index++) {
        Serial.print("PP: setup (3, ");
        Serial.print(5 - index);
        Serial.println(")");
        delay(1000);
    }
    // delay(5000);  // this time can be used to power up the 12V input on the board
}

void loop() {
    // Display::printSwitches();
    // Display::printFrequency();
    if (Machine::motorPrim == nullptr && Coords::hasNextBlock()) {
        block_planar_t nextBlock = Coords::getNextBlock();
        // Serial.print("PP: ");
        // Serial.print(String(nextCoordinate.x, 1));
        // Serial.print(", ");
        // Serial.print(String(nextCoordinate.y, 1));
        // Serial.print(", ");
        // Serial.print(String(nextCoordinate.z, 1));
        // Serial.print(" @ ");
        // Serial.println(String(Coords::nextBlockIndex - 1));
        Machine::accept({nextBlock.x, nextBlock.y, nextBlock.z}, nextBlock.vi, nextBlock.vo);
        Btle::setBuffSize();
    }
    Btle::getBuffVals();  // read values, if available
}
