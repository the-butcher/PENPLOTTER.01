#include <Arduino.h>
#include <Coords.h>
#include <Wire.h>
#include <unity.h>

void setUp(void) {
    // set stuff up here
}

void tearDown(void) {
    // clean stuff up here
}

/**
 * x-axis only, positive direction
 */
void test_coords_corexyToPlanarForwardXPos(void) {
    coord_corexy_t corexy = {40, 40, 0};
    coord_planar_t planar = Coords::corexyToPlanar(corexy);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 1.0, planar.x);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar.y);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar.z);
}

/**
 * x-axis only, positive direction
 */
void test_coords_planarToCorexyForwardXPos(void) {
    coord_planar_t planar = {1.0, 0.0, 0.0};
    coord_corexy_t corexy = Coords::planarToCorexy(planar);
    TEST_ASSERT_EQUAL(40, corexy.a);
    TEST_ASSERT_EQUAL(40, corexy.b);
    TEST_ASSERT_EQUAL(0, corexy.z);
}

/**
 * x-axis only, negative direction
 */
void test_coords_corexyToPlanarForwardXNeg(void) {
    coord_corexy_t corexy = {-60, -60, 0};
    coord_planar_t planar = Coords::corexyToPlanar(corexy);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, -1.5, planar.x);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar.y);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar.z);
}

/**
 * x-axis only, negative direction
 */
void test_coords_planarToCorexyForwardXNeg(void) {
    coord_planar_t planar = {-1.5, 0.0, 0.0};
    coord_corexy_t corexy = Coords::planarToCorexy(planar);
    TEST_ASSERT_EQUAL(-60, corexy.a);
    TEST_ASSERT_EQUAL(-60, corexy.b);
    TEST_ASSERT_EQUAL(0, corexy.z);
}

/**
 * y-axis only, positive direction
 */
void test_coords_corexyToPlanarForwardYPos(void) {
    coord_corexy_t corexy = {-40, 40, 0};
    coord_planar_t planar = Coords::corexyToPlanar(corexy);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar.x);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 1.0, planar.y);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar.z);
}

/**
 * y-axis only, positive direction
 */
void test_coords_planarToCorexyForwardYPos(void) {
    coord_planar_t planar = {0.0, 1.0, 0.0};
    coord_corexy_t corexy = Coords::planarToCorexy(planar);
    TEST_ASSERT_EQUAL(-40, corexy.a);
    TEST_ASSERT_EQUAL(40, corexy.b);
    TEST_ASSERT_EQUAL(0, corexy.z);
}

/**
 * y-axis only, negative direction
 */
void test_coords_corexyToPlanarForwardYNeg(void) {
    coord_corexy_t corexy = {40, -40, 0};
    coord_planar_t planar = Coords::corexyToPlanar(corexy);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar.x);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, -1.0, planar.y);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar.z);
}

/**
 * y-axis only, negative direction
 */
void test_coords_planarToCorexyForwardYNeg(void) {
    coord_planar_t planar = {0.0, -1.0, 0.0};
    coord_corexy_t corexy = Coords::planarToCorexy(planar);
    TEST_ASSERT_EQUAL(40, corexy.a);
    TEST_ASSERT_EQUAL(-40, corexy.b);
    TEST_ASSERT_EQUAL(0, corexy.z);
}

/**
 * forward diagonal /, positive direction
 */
void test_coords_corexyToPlanarForwardDiagonalPos(void) {
    coord_corexy_t corexy = {0, 80, 60};
    coord_planar_t planar = Coords::corexyToPlanar(corexy);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 1.0, planar.x);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 1.0, planar.y);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 1.0, planar.z);
}

/**
 * forward diagonal /, positive direction
 */
void test_coords_planarToCorexyForwardDiagonalPos(void) {
    coord_planar_t planar = {1.0, 1.0, 1.0};
    coord_corexy_t corexy = Coords::planarToCorexy(planar);
    TEST_ASSERT_EQUAL(0, corexy.a);
    TEST_ASSERT_EQUAL(80, corexy.b);
    TEST_ASSERT_EQUAL(60, corexy.z);
}

/**
 * forward diagonal /, negative direction
 */
void test_coords_corexyToPlanarForwardDiagonalNeg(void) {
    coord_corexy_t corexy = {0, -80, 0};
    coord_planar_t planar = Coords::corexyToPlanar(corexy);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, -1.0, planar.x);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, -1.0, planar.y);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar.z);
}

/**
 * forward diagonal /, negative direction
 */
void test_coords_planarToCorexyForwardDiagonalNeg(void) {
    coord_planar_t planar = {-1.0, -1.0, 0.0};
    coord_corexy_t corexy = Coords::planarToCorexy(planar);
    TEST_ASSERT_EQUAL(0, corexy.a);
    TEST_ASSERT_EQUAL(-80, corexy.b);
    TEST_ASSERT_EQUAL(0, corexy.z);
}

/**
 * backward diagonal \, x-positive direction
 */
void test_coords_corexyToPlanarBackwardDiagonalPos(void) {
    coord_corexy_t corexy = {80, 0, -60};
    coord_planar_t planar = Coords::corexyToPlanar(corexy);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 1.0, planar.x);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, -1.0, planar.y);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, -1.0, planar.z);
}

/**
 * backward diagonal \, x-positive direction
 */
void test_coords_planarToCorexyBackwardDiagonalPos(void) {
    coord_planar_t planar = {1.0, -1.0, -1.0};
    coord_corexy_t corexy = Coords::planarToCorexy(planar);
    TEST_ASSERT_EQUAL(80, corexy.a);
    TEST_ASSERT_EQUAL(0, corexy.b);
    TEST_ASSERT_EQUAL(-60, corexy.z);
}

/**
 * backward diagonal \, x-negative direction
 */
void test_coords_corexyToPlanarBackwardDiagonalNeg(void) {
    coord_corexy_t corexy = {-80, 0, 0};
    coord_planar_t planar = Coords::corexyToPlanar(corexy);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, -1.0, planar.x);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 1.0, planar.y);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar.z);
}

/**
 * backward diagonal \, x-negative direction
 */
void test_coords_planarToCorexyBackwardDiagonalNeg(void) {
    coord_planar_t planar = {-1.0, 1.0, 0.0};
    coord_corexy_t corexy = Coords::planarToCorexy(planar);
    TEST_ASSERT_EQUAL(-80, corexy.a);
    TEST_ASSERT_EQUAL(0, corexy.b);
    TEST_ASSERT_EQUAL(0, corexy.z);
}

void test_coords_toCorexyVectorA(void) {
    coord_corexy_t srcCorexy = {1000, 200, 0};
    coord_corexy_t dstCorexy = {800, 500, 10};
    coord_corexy_t vecCorexy = Coords::toCorexyVector(srcCorexy, dstCorexy);
    TEST_ASSERT_EQUAL(-200, vecCorexy.a);
    TEST_ASSERT_EQUAL(300, vecCorexy.b);
    TEST_ASSERT_EQUAL(10, vecCorexy.z);
}

void test_coords_hasMaximumAVal(void) {
    coord_corexy_t corexyA1 = {1000, 200, 0};
    coord_corexy_t corexyA2 = {-1000, -200, 0};
    coord_corexy_t corexyB1 = {100, 2000, 0};
    coord_corexy_t corexyB2 = {100, -2000, 0};
    TEST_ASSERT_TRUE(Coords::hasMaximumAVal(corexyA1));
    TEST_ASSERT_TRUE(Coords::hasMaximumAVal(corexyA2));
    TEST_ASSERT_FALSE(Coords::hasMaximumAVal(corexyB1));
    TEST_ASSERT_FALSE(Coords::hasMaximumAVal(corexyB2));
}

void test_coords_hasMaximumBVal(void) {
    coord_corexy_t corexyB1 = {100, 2000, 0};
    coord_corexy_t corexyB2 = {100, -2000, 0};
    coord_corexy_t corexyA1 = {1000, 200, 0};
    coord_corexy_t corexyA2 = {-1000, -200, 0};
    TEST_ASSERT_TRUE(Coords::hasMaximumBVal(corexyB1));
    TEST_ASSERT_TRUE(Coords::hasMaximumBVal(corexyB2));
    TEST_ASSERT_FALSE(Coords::hasMaximumBVal(corexyA1));
    TEST_ASSERT_FALSE(Coords::hasMaximumBVal(corexyA2));
}

void test_next_coordinate(void) {
    TEST_ASSERT_TRUE(Coords::hasNextBlock());
    coord_planar_t planar0 = Coords::getNextBlock();
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar0.x);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar0.y);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 10.0, planar0.z);
    TEST_ASSERT_TRUE(Coords::hasNextBlock());
    coord_planar_t planar1 = Coords::getNextBlock();
    TEST_ASSERT_FLOAT_WITHIN(0.0001, -MACHINE_DIM____X, planar1.x);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar1.y);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar1.z);
    TEST_ASSERT_TRUE(Coords::hasNextBlock());
    coord_planar_t planar2 = Coords::getNextBlock();
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar2.x);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar2.y);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar2.z);
    TEST_ASSERT_TRUE(Coords::hasNextBlock());
    coord_planar_t planar3 = Coords::getNextBlock();
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar3.x);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, -MACHINE_DIM____Y, planar3.y);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar3.z);
    TEST_ASSERT_TRUE(Coords::hasNextBlock());
    coord_planar_t planar4 = Coords::getNextBlock();
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar4.x);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar4.y);
    TEST_ASSERT_FLOAT_WITHIN(0.0001, 0.0, planar4.z);
    TEST_ASSERT_FALSE(Coords::hasNextBlock());
}

void test_initial_buff_values(void) {
    TEST_ASSERT_EQUAL(0, Coords::nextBlockIndex);
    TEST_ASSERT_EQUAL(5, Coords::blockIndex);
    TEST_ASSERT_EQUAL(507, Coords::getBuffCoordSpace());
}

void test_add_buff_values(void) {
    TEST_ASSERT_EQUAL(512, Coords::getBuffCoordSpace());
    TEST_ASSERT_FALSE(Coords::hasNextBlock());
    for (uint16_t i = 0; i < 100; i++) {
        Coords::addBlock({0.0, 0.0, 0.0});
    }
    TEST_ASSERT_EQUAL(412, Coords::getBuffCoordSpace());
    TEST_ASSERT_TRUE(Coords::hasNextBlock());
    for (uint16_t i = 0; i < 99; i++) {
        Coords::getNextBlock();
    }
    TEST_ASSERT_EQUAL(511, Coords::getBuffCoordSpace());
    TEST_ASSERT_TRUE(Coords::hasNextBlock());
    Coords::getNextBlock();
    TEST_ASSERT_EQUAL(512, Coords::getBuffCoordSpace());
    TEST_ASSERT_FALSE(Coords::hasNextBlock());
    for (uint16_t i = 0; i < 512; i++) {
        Coords::addBlock({0.0, 0.0, 0.0});
    }
    TEST_ASSERT_EQUAL(0, Coords::getBuffCoordSpace());
}

void setup() {
    // NOTE!!! Wait for >2 secs
    // if board doesn't support software reset via Serial.DTR/RTS
    delay(2000);
    Coords::begin();

    UNITY_BEGIN();  // IMPORTANT LINE!

    RUN_TEST(test_initial_buff_values);
    RUN_TEST(test_next_coordinate);
    RUN_TEST(test_add_buff_values);

    RUN_TEST(test_coords_corexyToPlanarForwardXPos);
    RUN_TEST(test_coords_planarToCorexyForwardXPos);

    RUN_TEST(test_coords_corexyToPlanarForwardXNeg);
    RUN_TEST(test_coords_planarToCorexyForwardXNeg);

    RUN_TEST(test_coords_corexyToPlanarForwardYPos);
    RUN_TEST(test_coords_planarToCorexyForwardYPos);

    RUN_TEST(test_coords_corexyToPlanarForwardYNeg);
    RUN_TEST(test_coords_planarToCorexyForwardYNeg);

    RUN_TEST(test_coords_corexyToPlanarForwardDiagonalPos);
    RUN_TEST(test_coords_planarToCorexyForwardDiagonalPos);

    RUN_TEST(test_coords_corexyToPlanarForwardDiagonalNeg);
    RUN_TEST(test_coords_planarToCorexyForwardDiagonalNeg);

    RUN_TEST(test_coords_corexyToPlanarBackwardDiagonalPos);
    RUN_TEST(test_coords_planarToCorexyBackwardDiagonalPos);

    RUN_TEST(test_coords_corexyToPlanarBackwardDiagonalNeg);
    RUN_TEST(test_coords_planarToCorexyBackwardDiagonalNeg);

    RUN_TEST(test_coords_toCorexyVectorA);

    RUN_TEST(test_coords_hasMaximumAVal);
    RUN_TEST(test_coords_hasMaximumBVal);

    UNITY_END();  // stop unit testing
}

void loop() {
}