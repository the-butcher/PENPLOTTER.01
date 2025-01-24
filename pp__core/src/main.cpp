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

void nextBlockIfPresent() {
    if (Coords::hasNextBlock()) {                           // check if there is more blocks to be handled at the moment
        block_planar_t nextBlock = Coords::getNextBlock();  // TODO :: revisit bluetooth implementation to verify that indices for picking a block never get corrupted by appending blocks
        Machine::accept({nextBlock.x, nextBlock.y, nextBlock.z}, nextBlock.vi, nextBlock.vo);
        Btle::setBuffSize();
    }
}

void setup() {
    Serial.begin(115200);
    delay(3000);
    Serial.println("PP: setup (1)");
    Coords::begin();  // setup list of coordinates
    Switches::begin();
    Motors::begin();
    Machine::begin();
    Display::begin();

    nextBlockIfPresent();  // lift the pen

    Btle::begin();
    Serial.println("PP: setup (2)");
    while (!Btle::connect()) {
        delay(1000);
    }
    Serial.println("PP: setup (3)");
}

void loop() {
    if (Machine::motorPrim == nullptr) {  // machine needs a new block to be handled
        nextBlockIfPresent();
    }
    Btle::getBuffVals();
}
