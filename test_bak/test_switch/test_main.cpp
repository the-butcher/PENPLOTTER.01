#include <Arduino.h>
#include <Switch.h>
#include <Switches.h>
#include <Wire.h>
#include <unity.h>

void setUp(void) {
    // set stuff up here
}

void tearDown(void) {
    // clean stuff up here
}

void test_limit_config_x(void) {
    TEST_ASSERT_EQUAL('X', Switches::switchX.id);
    TEST_ASSERT_EQUAL(9, LIMIT_X_STOP_PIN);
    TEST_ASSERT_EQUAL(LIMIT_X_STOP_PIN, Switches::switchX.stopPin);
}

void test_limit_config_y(void) {
    TEST_ASSERT_EQUAL('Y', Switches::switchY.id);
    TEST_ASSERT_EQUAL(10, LIMIT_Y_STOP_PIN);
    TEST_ASSERT_EQUAL(LIMIT_Y_STOP_PIN, Switches::switchY.stopPin);
}

void test_limit_config_z(void) {
    TEST_ASSERT_EQUAL('Z', Switches::switchZ.id);
    TEST_ASSERT_EQUAL(11, LIMIT_Z_STOP_PIN);
    TEST_ASSERT_EQUAL(LIMIT_Z_STOP_PIN, Switches::switchZ.stopPin);
}

void setup() {
    // NOTE!!! Wait for >2 secs
    // if board doesn't support software reset via Serial.DTR/RTS
    delay(2000);

    UNITY_BEGIN();  // IMPORTANT LINE!
    Switches::begin();

    RUN_TEST(test_limit_config_x);
    RUN_TEST(test_limit_config_y);
    RUN_TEST(test_limit_config_z);

    UNITY_END();  // stop unit testing
}

void loop() {
}