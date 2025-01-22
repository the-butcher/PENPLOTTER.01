#include <Motor.h>

Motor::Motor(char id, uint32_t stepsMm, uint8_t stepPin, uint8_t drctPin, PinStatus pinStatusFwd, PinStatus pinStatusBwd, int32_t cntrCur) {
    this->id = id;
    this->stepsMm = stepsMm;
    this->stepPin = stepPin;
    this->drctPin = drctPin;
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
}