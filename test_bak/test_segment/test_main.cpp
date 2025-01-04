#include <Arduino.h>
#include <Define.h>
#include <Machine.h>
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

void test_machine_dimensions(void) {
    TEST_ASSERT_EQUAL(297, MACHINE_DIM____X);
    TEST_ASSERT_EQUAL(420, MACHINE_DIM____Y);
    TEST_ASSERT_EQUAL(8, MACHINE_DIM____Z);
}

void test_machine_status_a(void) {
    TEST_ASSERT_NULL(Machine::motorPrim);
    TEST_ASSERT_NULL(Machine::motorSec1);
    TEST_ASSERT_NULL(Machine::motorSec2);
}

void test_machine_status_b(void) {
    Machine::accept({10.0, 0.0, 0.0});
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 200.0, Machine::frequency);
    TEST_ASSERT_EQUAL('A', Machine::motorPrim->id);
    TEST_ASSERT_EQUAL('B', Machine::motorSec1->id);
    TEST_ASSERT_EQUAL('Z', Machine::motorSec2->id);
}

void test_machine_status_c(void) {
    TEST_ASSERT_NULL(Machine::motorPrim);
    TEST_ASSERT_NULL(Machine::motorSec1);
    TEST_ASSERT_NULL(Machine::motorSec2);
    TEST_ASSERT_EQUAL(400, Motors::motorA.cntrCur);
    TEST_ASSERT_EQUAL(400, Motors::motorB.cntrCur);
    TEST_ASSERT_EQUAL(0, Motors::motorZ.cntrCur);
}

void test_machine_status_d(void) {
    Machine::accept({0.0, 0.0, 0.0});
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 200.0, Machine::frequency);
    TEST_ASSERT_EQUAL('A', Machine::motorPrim->id);
    TEST_ASSERT_EQUAL('B', Machine::motorSec1->id);
    TEST_ASSERT_EQUAL('Z', Machine::motorSec2->id);
}

void test_machine_status_e(void) {
    TEST_ASSERT_NULL(Machine::motorPrim);
    TEST_ASSERT_NULL(Machine::motorSec1);
    TEST_ASSERT_NULL(Machine::motorSec2);
    TEST_ASSERT_EQUAL(0, Motors::motorA.cntrCur);
    TEST_ASSERT_EQUAL(0, Motors::motorB.cntrCur);
    TEST_ASSERT_EQUAL(0, Motors::motorZ.cntrCur);
}

void test_machine_status_f(void) {
    Machine::accept({10.0, 10.0, 0.0});
}

void test_machine_status_g(void) {
    Machine::accept({0.0, 20.0, 0.0});
}

void setup() {
    // NOTE!!! Wait for >2 secs
    // if board doesn't support software reset via Serial.DTR/RTS
    delay(2000);

    UNITY_BEGIN();  // IMPORTANT LINE!
    Motors::begin();
    Machine::begin();

    RUN_TEST(test_machine_dimensions);

    RUN_TEST(test_machine_status_a);
    RUN_TEST(test_machine_status_b);

    delay(2000);

    RUN_TEST(test_machine_status_c);
    RUN_TEST(test_machine_status_d);

    delay(2000);

    RUN_TEST(test_machine_status_e);

    // just some POC, no real tests
    RUN_TEST(test_machine_status_f);
    delay(2000);
    RUN_TEST(test_machine_status_g);

    UNITY_END();  // stop unit testing
}

void loop() {
}