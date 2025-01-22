#include <Arduino.h>
#include <Machine.h>
#include <Wire.h>
#include <unity.h>

void setUp(void) {
    // set stuff up here
}

void tearDown(void) {
    // clean stuff up here
}

void test_pulse_count_is_greater_than_thousand(void) {
    TEST_ASSERT_GREATER_THAN(1000, Machine::pulseCount);
}

void test_pulse_count_is_greater_than_zero(void) {
    TEST_ASSERT_GREATER_THAN(0, Machine::pulseCount);
}

void test_pulse_count_is_zero(void) {
    TEST_ASSERT_EQUAL(0, Machine::pulseCount);
}

void setup() {
    // NOTE!!! Wait for >2 secs
    // if board doesn't support software reset via Serial.DTR/RTS
    delay(2000);

    UNITY_BEGIN();  // IMPORTANT LINE!
    Machine::begin();

    RUN_TEST(test_pulse_count_is_zero);
    delay(1200);
    RUN_TEST(test_pulse_count_is_greater_than_zero);
    Machine::updateFrequency(1000.0);
    delay(1200);
    RUN_TEST(test_pulse_count_is_greater_than_thousand);

    UNITY_END();  // stop unit testing
}

void loop() {
}