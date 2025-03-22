#include <Motors.h>

/**
 * jumpers on the a/b drivers are set to high/high/low, corresponding to 1/8 microstep
 *
 */
Motor Motors::motorA('A', MOTOR___STEPS_MM, 4, MOTOR_A_STEP_PIN, MOTOR_A_DRCT_PIN, MOTOR_A_MICR_PIN);
Motor Motors::motorB('B', MOTOR___STEPS_MM, 4, MOTOR_B_STEP_PIN, MOTOR_B_DRCT_PIN, MOTOR_B_MICR_PIN);
Motor Motors::motorZ('Z', MOTOR_Z_STEPS_MM, 1, MOTOR_Z_STEP_PIN, MOTOR_Z_DRCT_PIN, MOTOR_Z_MICR_PIN);

bool Motors::begin() {
    pinMode(MOTOR_ENABLE_PIN, OUTPUT);
    return Motors::motorA.begin() && Motors::motorB.begin() && Motors::motorZ.begin();
}

coord_corexy_t Motors::getCurCorexy() {
    return {Motors::motorA.getCntrCur(), Motors::motorB.getCntrCur(), Motors::motorZ.getCntrCur()};
}
