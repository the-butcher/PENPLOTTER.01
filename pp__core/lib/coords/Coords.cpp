#include <Coords.h>

block_planar_t Coords::blockBuffer[BLOCK_BUFFER_SIZE];
uint32_t Coords::nextBlockIndex = 0;
uint32_t Coords::blockIndex = 0;

bool Coords::begin() {
    Coords::addBlock({0.0, 0.0, 10.0, MACHINE_HOME_V_Z, MACHINE_HOME_V_Z});               // move until z-swtich touched, z-homing the machine and accepting the z-home coordinate as 0.0
    Coords::addBlock({-MACHINE_DIM____X, 0.0, 0.0, MACHINE_HOME_VXY, MACHINE_HOME_VXY});  // move until x-switch touched, x-homing the machine and accepting the limit x-coordinate as -10.0
    Coords::addBlock({0.0, 0.0, 0.0, MACHINE_HOME_VXY, MACHINE_HOME_VXY});                // backup x to 0.0
    Coords::addBlock({0.0, -MACHINE_DIM____Y, 0.0, MACHINE_HOME_VXY, MACHINE_HOME_VXY});  // move until y-swtich touched, y-homing the machine and accepting the limit y-coordinate as -20.0
    Coords::addBlock({0.0, 0.0, 0.0, MACHINE_HOME_VXY, MACHINE_HOME_VXY});                // backup y to 0.0, the machine will now be at x0.0, y0.0 with a lifted pen at z0.0
}

bool Coords::hasNextBlock() {
    return Coords::nextBlockIndex < Coords::blockIndex;
}

block_planar_t Coords::getNextBlock() {
    return Coords::blockBuffer[Coords::nextBlockIndex++ % BLOCK_BUFFER_SIZE];
}

bool Coords::addBlock(block_planar_t blockPlanar) {
    Coords::blockBuffer[Coords::blockIndex++ % BLOCK_BUFFER_SIZE] = blockPlanar;
    return true;
}

uint16_t Coords::getBuffCoordSpace() {
    return Coords::nextBlockIndex + BLOCK_BUFFER_SIZE - Coords::blockIndex;
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

// bool Coords::hasMaximumAVal(coord_corexy_t& coordCorexy) {
//     return abs(coordCorexy.a) >= max(abs(coordCorexy.b), abs(coordCorexy.z));
// }

// bool Coords::hasMaximumBVal(coord_corexy_t& coordCorexy) {
//     return abs(coordCorexy.b) >= max(abs(coordCorexy.a), abs(coordCorexy.z));
// }