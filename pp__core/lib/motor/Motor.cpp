#include <Motor.h>

Motor::Motor(char id, uint32_t stepsMm, uint8_t stepPin, uint8_t drctPin, uint8_t micrPin, PinStatus pinStatusFwd, PinStatus pinStatusBwd, int32_t cntrCur) {
    this->id = id;
    this->stepsMm = stepsMm;
    this->stepPin = stepPin;
    this->drctPin = drctPin;
    this->micrPin = micrPin;
    this->drctFwd = {pinStatusFwd, 1};
    this->drctBwd = {pinStatusBwd, -1};
    this->cntrCur = cntrCur;
    this->setDirection(MOTOR___DRCT_FWD);
}

void Motor::setDirection(motor_direction__e drctMot) {
    if (drctMot == MOTOR___DRCT_FWD) {
        this->drctCur = this->drctFwd;
    } else {
        this->drctCur = this->drctBwd;
    }
    digitalWrite(this->drctPin, this->drctCur.pinStatus);
}

bool Motor::begin() {
    pinMode(this->stepPin, OUTPUT);
    pinMode(this->drctPin, OUTPUT);
    return true;
}

void Motor::pulse() {
    digitalWrite(this->stepPin, HIGH);
    delayMicroseconds(1);
    digitalWrite(this->stepPin, LOW);
    this->cntrCur += this->drctCur.cntrInc;
    // TODO :: have a micrCur counter and on the direction a micrInc
    // TODO :: increment micrCur by micrInc and if it exceeds one micro interval (i.e. 4), increment the actual counter
}

void Motor::setCntrCur(int32_t cntrCur) {
    this->cntrCur = cntrCur;
}

int32_t Motor::getCntrCur() {
    return this->cntrCur;
}