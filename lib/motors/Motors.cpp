#include <Motors.h>

Motor Motors::motorA('A', MOTOR___STEPS_MM, MOTOR_A_STEP_PIN, MOTOR_A_DRCT_PIN, LOW, HIGH, 0);  // MOTOR_A_CNTR_CUR
Motor Motors::motorB('B', MOTOR___STEPS_MM, MOTOR_B_STEP_PIN, MOTOR_B_DRCT_PIN, LOW, HIGH, 0);  // MOTOR_B_CNTR_CUR
Motor Motors::motorZ('Z', MOTOR_Z_STEPS_MM, MOTOR_Z_STEP_PIN, MOTOR_Z_DRCT_PIN, LOW, HIGH, 0);  // MOTOR_Z_CNTR_CUR

bool Motors::begin() {
    pinMode(MOTOR_ENABLE_PIN, OUTPUT);
    return Motors::motorA.begin() && Motors::motorB.begin() && Motors::motorZ.begin();
}

coord_corexy_t Motors::getCurCorexy() {
    return {Motors::motorA.cntrCur, Motors::motorB.cntrCur, Motors::motorZ.cntrCur};
}
