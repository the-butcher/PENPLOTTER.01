#include <Display.h>

HT16K33 Display::baseDisplay;

void Display::begin() {
    Wire1.begin();
    Display::baseDisplay.begin(112U, 255U, 255U, 255U, Wire1);
}

void Display::printSwitches() {
    // char switchesBuf[] = {' ', Switches::switchX.isPressed() ? 'X' : ' ', Switches::switchY.isPressed() ? 'Y' : ' ', Switches::switchZ.isPressed() ? 'Z' : ' '};
    char switchesBuf[] = {' ', Machine::homedX ? 'X' : ' ', Machine::homedY ? 'Y' : ' ', Machine::homedZ ? 'Z' : ' '};
    Display::baseDisplay.print(String(switchesBuf));
}

// void Display::printFrequency() {
//     char frequencyBuf[4];
//     sprintf(frequencyBuf, "%4d", (int)round(Machine::frequency));
//     Display::baseDisplay.print(String(frequencyBuf));
// }