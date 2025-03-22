#include <Arduino.h>
#include <Motor.h>
#include <Motors.h>
#include <Wire.h>
#include <unity.h>

void setUp(void) {
    // set stuff up here
}

void tearDown(void) {
    // clean stuff up here
}

void test_motor_config_z(void) {
    TEST_ASSERT_EQUAL(4, MOTOR_Z_STEP_PIN);
    TEST_ASSERT_EQUAL(7, MOTOR_Z_DRCT_PIN);
    TEST_ASSERT_EQUAL(60, MOTOR_Z_STEPS_MM);
    TEST_ASSERT_EQUAL(4800, MOTOR_Z_CNTR_CUR);
    TEST_ASSERT_EQUAL(MOTOR_Z_STEP_PIN, Motors::motorZ.stepPin);
    TEST_ASSERT_EQUAL(MOTOR_Z_DRCT_PIN, Motors::motorZ.drctPin);
    TEST_ASSERT_EQUAL(MOTOR_Z_STEPS_MM, Motors::motorZ.stepsMm);
    TEST_ASSERT_EQUAL(MOTOR_Z_CNTR_CUR, Motors::motorZ.cntrCur);
    TEST_ASSERT_EQUAL(LOW, Motors::motorZ.drctFwd.drctVal);
    TEST_ASSERT_EQUAL(1, Motors::motorZ.drctFwd.cntrInc);
    TEST_ASSERT_EQUAL(HIGH, Motors::motorZ.drctBwd.drctVal);
    TEST_ASSERT_EQUAL(-1, Motors::motorZ.drctBwd.cntrInc);
}

void test_motor_config_b(void) {
    TEST_ASSERT_EQUAL(3, MOTOR_B_STEP_PIN);
    TEST_ASSERT_EQUAL(6, MOTOR_B_DRCT_PIN);
    TEST_ASSERT_EQUAL(40, MOTOR___STEPS_MM);
    TEST_ASSERT_EQUAL(-49200, MOTOR_B_CNTR_CUR);
    TEST_ASSERT_EQUAL(MOTOR_B_STEP_PIN, Motors::motorB.stepPin);
    TEST_ASSERT_EQUAL(MOTOR_B_DRCT_PIN, Motors::motorB.drctPin);
    TEST_ASSERT_EQUAL(MOTOR___STEPS_MM, Motors::motorB.stepsMm);
    TEST_ASSERT_EQUAL(MOTOR_B_CNTR_CUR, Motors::motorB.cntrCur);
    TEST_ASSERT_EQUAL(HIGH, Motors::motorB.drctFwd.drctVal);
    TEST_ASSERT_EQUAL(1, Motors::motorB.drctFwd.cntrInc);
    TEST_ASSERT_EQUAL(LOW, Motors::motorB.drctBwd.drctVal);
    TEST_ASSERT_EQUAL(-1, Motors::motorB.drctBwd.cntrInc);
}

void test_motor_config_a(void) {
    TEST_ASSERT_EQUAL(2, MOTOR_A_STEP_PIN);
    TEST_ASSERT_EQUAL(5, MOTOR_A_DRCT_PIN);
    TEST_ASSERT_EQUAL(40, MOTOR___STEPS_MM);
    TEST_ASSERT_EQUAL(286800, MOTOR_A_CNTR_CUR);
    TEST_ASSERT_EQUAL(MOTOR_A_STEP_PIN, Motors::motorA.stepPin);
    TEST_ASSERT_EQUAL(MOTOR_A_DRCT_PIN, Motors::motorA.drctPin);
    TEST_ASSERT_EQUAL(MOTOR___STEPS_MM, Motors::motorA.stepsMm);
    TEST_ASSERT_EQUAL(MOTOR_A_CNTR_CUR, Motors::motorA.cntrCur);
    TEST_ASSERT_EQUAL(HIGH, Motors::motorA.drctFwd.drctVal);
    TEST_ASSERT_EQUAL(1, Motors::motorA.drctFwd.cntrInc);
    TEST_ASSERT_EQUAL(LOW, Motors::motorA.drctBwd.drctVal);
    TEST_ASSERT_EQUAL(-1, Motors::motorA.drctBwd.cntrInc);
}

void test_motor_direction_a(void) {
    Motors::motorA.setDirection(MOTOR___DRCT_FWD);
    TEST_ASSERT_EQUAL(HIGH, digitalRead(Motors::motorA.drctPin));
    for (uint8_t pulseIndex = 0; pulseIndex < 20; pulseIndex++) {
        Motors::motorA.pulse();  // must count forward
    }
    TEST_ASSERT_EQUAL(20, Motors::motorA.cntrCur);
    Motors::motorA.setDirection(MOTOR___DRCT_BWD);
    TEST_ASSERT_EQUAL(LOW, digitalRead(Motors::motorA.drctPin));
    for (uint8_t pulseIndex = 0; pulseIndex < 10; pulseIndex++) {
        Motors::motorA.pulse();  // must count backward
    }
    TEST_ASSERT_EQUAL(10, Motors::motorA.cntrCur);
}

void test_motor_direction_b(void) {
    Motors::motorB.setDirection(MOTOR___DRCT_FWD);
    TEST_ASSERT_EQUAL(HIGH, digitalRead(Motors::motorB.drctPin));
    for (uint8_t pulseIndex = 0; pulseIndex < 20; pulseIndex++) {
        Motors::motorB.pulse();  // must count forward
    }
    TEST_ASSERT_EQUAL(20, Motors::motorB.cntrCur);
    Motors::motorB.setDirection(MOTOR___DRCT_BWD);
    TEST_ASSERT_EQUAL(LOW, digitalRead(Motors::motorB.drctPin));
    for (uint8_t pulseIndex = 0; pulseIndex < 10; pulseIndex++) {
        Motors::motorB.pulse();  // must count backward
    }
    TEST_ASSERT_EQUAL(10, Motors::motorB.cntrCur);
}

void test_motor_direction_z(void) {
    Motors::motorZ.setDirection(MOTOR___DRCT_FWD);
    TEST_ASSERT_EQUAL(LOW, digitalRead(Motors::motorZ.drctPin));
    for (uint8_t pulseIndex = 0; pulseIndex < 20; pulseIndex++) {
        Motors::motorZ.pulse();  // must count forward
    }
    TEST_ASSERT_EQUAL(20, Motors::motorZ.cntrCur);
    Motors::motorZ.setDirection(MOTOR___DRCT_BWD);
    TEST_ASSERT_EQUAL(HIGH, digitalRead(Motors::motorZ.drctPin));
    for (uint8_t pulseIndex = 0; pulseIndex < 10; pulseIndex++) {
        Motors::motorZ.pulse();  // must count backward
    }
    TEST_ASSERT_EQUAL(10, Motors::motorZ.cntrCur);
}

void test_enable_pin_is_low(void) {
    TEST_ASSERT_EQUAL(LOW, digitalRead(MOTOR_ENABLE_PIN));
}

void setup() {
    // NOTE!!! Wait for >2 secs
    // if board doesn't support software reset via Serial.DTR/RTS
    delay(2000);

    Motors::begin();

    UNITY_BEGIN();  // IMPORTANT LINE!
    RUN_TEST(test_enable_pin_is_low);
    RUN_TEST(test_motor_config_a);
    RUN_TEST(test_motor_config_b);
    RUN_TEST(test_motor_config_z);

    RUN_TEST(test_motor_direction_a);
    RUN_TEST(test_motor_direction_b);
    RUN_TEST(test_motor_direction_z);

    UNITY_END();  // stop unit testing
}

void loop() {
}