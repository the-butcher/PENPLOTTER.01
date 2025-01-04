#include <Coords.h>

coord_planar_t Coords::coordBuffer[COORD_BUFFER_SIZE];
uint16_t Coords::coordBufferIndex = 0;

bool Coords::begin() {
    Coords::coordBuffer[0] = {0.0, 0.0, 10.0};               // move until z-swtich touched, should be homedZ afterwards
    Coords::coordBuffer[1] = {-MACHINE_DIM____X, 0.0, 0.0};  // move until x-swtich touched, should be homedX afterwards
    Coords::coordBuffer[2] = {0.0, 0.0, 0.0};                // backup
    Coords::coordBuffer[3] = {0.0, -MACHINE_DIM____Y, 0.0};  // move until x-swtich touched, should be homedX afterwards
    Coords::coordBuffer[4] = {0.0, 0.0, 0.0};

    float radius = 1;
    float radAngle = 0;
    uint16_t index = 5;
    for (float radius = 1; radius <= 19; radius += 2) {
        // move to start with pen up
        Coords::coordBuffer[index++] = {50.0f + (float)(cos(radAngle) * radius), 50.0f + (float)(sin(radAngle) * radius), 0.0};
        Coords::coordBuffer[index++] = {50.0f + (float)(cos(radAngle) * radius), 50.0f + (float)(sin(radAngle) * radius), MACHINE_DIM____Z};  // pen down
        for (uint16_t gradAngle = 5; gradAngle <= 360; gradAngle += 5) {
            radAngle = gradAngle * PI / 180.0;
            Coords::coordBuffer[index++] = {50.0f + (float)(cos(radAngle) * radius), 50.0f + (float)(sin(radAngle) * radius), MACHINE_DIM____Z};
        }
        Serial.println(index);
        Coords::coordBuffer[index++] = {50.0f + (float)(cos(radAngle) * radius), 50.0f + (float)(sin(radAngle) * radius), 0.0};  // pen up
    }
}

bool Coords::hasNextCoordinate() {
    return Coords::coordBufferIndex < COORD_BUFFER_SIZE;
}

coord_planar_t Coords::nextCoordinate() {
    return Coords::coordBuffer[Coords::coordBufferIndex++ % COORD_BUFFER_SIZE];
}

coord_corexy_t Coords::planarToCorexy(coord_planar_t& coordPlanar) {
    return {(coordPlanar.x - coordPlanar.y) * MOTOR___STEPS_MM, (coordPlanar.x + coordPlanar.y) * MOTOR___STEPS_MM, coordPlanar.z * MOTOR_Z_STEPS_MM};
}

coord_planar_t Coords::corexyToPlanar(coord_corexy_t& coordCorexy) {
    return {(coordCorexy.a + coordCorexy.b) * 0.5 / MOTOR___STEPS_MM, (coordCorexy.b - coordCorexy.a) * 0.5 / MOTOR___STEPS_MM, coordCorexy.z * 1.0 / MOTOR_Z_STEPS_MM};
}

coord_corexy_t Coords::toCorexyVector(coord_corexy_t& srcCorexy, coord_corexy_t& dstCorexy) {
    return {dstCorexy.a - srcCorexy.a, dstCorexy.b - srcCorexy.b, dstCorexy.z - srcCorexy.z};
}

bool Coords::hasMaximumAVal(coord_corexy_t& coordCorexy) {
    return abs(coordCorexy.a) >= max(abs(coordCorexy.b), abs(coordCorexy.z));
}

bool Coords::hasMaximumBVal(coord_corexy_t& coordCorexy) {
    return abs(coordCorexy.b) >= max(abs(coordCorexy.a), abs(coordCorexy.z));
}