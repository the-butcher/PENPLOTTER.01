#include <Switch.h>

Switch::Switch(char id, uint8_t stopPin) {
    this->id = id;
    this->stopPin = stopPin;
}

bool Switch::begin() {
    pinMode(this->stopPin, INPUT_PULLUP);
    return true;
}

bool Switch::isPressed() {
    return digitalRead(stopPin) == HIGH;
}