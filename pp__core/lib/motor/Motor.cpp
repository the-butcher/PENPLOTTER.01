#include <Motor.h>

Motor::Motor(char id, uint8_t stepsMm, uint8_t micrMlt, uint8_t stepPin, uint8_t drctPin, uint8_t micrPin) {
    this->id = id;
    this->stepsMm = stepsMm;
    this->micrMlt = micrMlt;
    this->stepPin = stepPin;
    this->drctPin = drctPin;
    this->micrPin = micrPin;
    // this->drctFwd = {LOW, LOW, 1, micrMlt};  // one step is forward in normal stepping, and counts a full set of microsteps
    // this->drctBwd = {HIGH, LOW, -1, micrMlt};
    this->cntrCur = 0;
    this->micrCur = 0;
    this->setDirection({LOW, LOW, 1, micrMlt});
}

void Motor::setDirection(motor_direction__t drctCur) {
    // if (drctMot == MOTOR___DRCT_FWD) {
    //     this->drctCur = this->drctFwd;
    // } else {
    //     this->drctCur = this->drctBwd;
    // }
    this->drctCur = drctCur;
    digitalWrite(this->drctPin, this->drctCur.drctVal);
    digitalWrite(this->micrPin, this->drctCur.micrVal);
}

bool Motor::begin() {
    pinMode(this->stepPin, OUTPUT);
    pinMode(this->drctPin, OUTPUT);
    pinMode(this->micrPin, OUTPUT);
    return true;
}

void Motor::pulse() {
    digitalWrite(this->stepPin, HIGH);
    delayMicroseconds(1);
    digitalWrite(this->stepPin, LOW);
    this->micrCur += this->drctCur.micrInc;
    if (this->micrCur == this->micrMlt) {
        this->micrCur = 0;
        this->cntrCur += this->drctCur.cntrInc;
    }
    // TODO :: have a micrCur counter and on the direction a micrInc
    // TODO :: increment micrCur by micrInc and if it exceeds one micro interval (i.e. 4), increment the actual counter
}

void Motor::setCntrCur(int32_t cntrCur) {
    this->cntrCur = cntrCur;
}

int32_t Motor::getCntrCur() {
    return this->cntrCur;
}