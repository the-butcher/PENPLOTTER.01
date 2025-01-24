// #include <Display.h>
#include <Machine.h>

FspTimer Machine::pulseTimer;
uint64_t Machine::pulseCount = 0;
uint64_t Machine::microsTotal = 0;
uint64_t Machine::microsEntry = 0;
float Machine::frqI = 1.0;
float Machine::frqO = 1.0;
float Machine::frqA2 = 0.0;
float Machine::frqII = 1.0;

Motor *Machine::motorPrim = nullptr;
Motor *Machine::motorSec1 = nullptr;
Motor *Machine::motorSec2 = nullptr;

uint32_t Machine::cPrim = 0;
uint32_t Machine::dPrim = 0;
uint32_t Machine::dSec1 = 0;
uint32_t Machine::dSec2 = 0;
int32_t Machine::eSec1 = 0;
int32_t Machine::eSec2 = 0;

bool Machine::homedX = false;
bool Machine::homedY = false;
bool Machine::homedZ = false;

bool Machine::begin() {

    uint8_t timerType = AGT_TIMER;  //  GPT_TIMER
    int8_t timerIndex = FspTimer::get_available_timer(timerType);
    if (timerIndex < 0) {
        timerIndex = FspTimer::get_available_timer(timerType, true);
    }
    if (timerIndex < 0) {
        return false;
    }

    FspTimer::force_use_of_pwm_reserved_timer();

    if (!Machine::pulseTimer.begin(TIMER_MODE_PERIODIC, timerType, timerIndex, 1.0, 0.0f, Machine::pulse)) {
        return false;
    }

    if (!Machine::pulseTimer.setup_overflow_irq()) {
        return false;
    }
    if (!Machine::pulseTimer.open()) {
        return false;
    }
    if (!Machine::pulseTimer.start()) {
        return false;
    }
    return true;
}

void Machine::yield() {
    Machine::updateFrequency(1.0);
    Machine::motorPrim = nullptr;
    Machine::motorSec1 = nullptr;
    Machine::motorSec2 = nullptr;
}

void Machine::reset(float x, float y) {

    // calculate current position
    coord_corexy_t curCorexy = Motors::getCurCorexy();
    coord_planar_t curPlanar = Coords::corexyToPlanar(curCorexy);

    // adjust current position
    curPlanar = {x, y, curPlanar.z};
    curCorexy = Coords::planarToCorexy(curPlanar);

    // apply counters to motors A and B
    Motors::motorA.cntrCur = curCorexy.a;
    Motors::motorB.cntrCur = curCorexy.b;
}

void Machine::pulse(timer_callback_args_t __attribute((unused)) * p_args) {

    Machine::pulseCount++;

    if (Switches::isAnySwitchPressed()) {

        if (Switches::switchX.isPressed()) {
            if (!Machine::homedX) {
                Machine::yield();
                Machine::homedX = true;
                Machine::reset(-10.0, 0.0);
            } else {
                // TODO :: maybe implement another threshold as yield criteria
            }
        }

        if (Switches::switchY.isPressed()) {
            if (!Machine::homedY) {
                Machine::yield();
                Machine::homedY = true;
                Machine::reset(0.0, -20.0);
            } else {
                // TODO :: maybe implement another threshold as yield criteria
            }
        }

        if (Switches::switchZ.isPressed()) {
            if (!Machine::homedZ) {
                Machine::yield();
                Machine::homedZ = true;
                Motors::motorZ.cntrCur = 0;
            } else {
                // TODO :: maybe implement another threshold as yield criteria
            }
        }

        // Machine::yield();  // resets motor pointers, effectively halting the machine
    }

    // exectute a single bresenham step, https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
    if (Machine::motorPrim != nullptr) {

        Machine::motorPrim->pulse();
        if (eSec1 > 0) {
            Machine::motorSec1->pulse();
            Machine::eSec1 = Machine::eSec1 - 2 * Machine::dPrim;
        }
        if (eSec2 > 0) {
            Machine::motorSec2->pulse();
            Machine::eSec2 = Machine::eSec2 - 2 * Machine::dPrim;
        }
        Machine::eSec1 = Machine::eSec1 + 2 * Machine::dSec1;
        Machine::eSec2 = Machine::eSec2 + 2 * Machine::dSec2;

        Machine::cPrim++;
        if (Machine::cPrim >= Machine::dPrim) {  // counter has reached the segment delta
            // TODO :: segment complete, find new destination coordinate
            Machine::yield();
        } else {
            // uint64_t microsDelta = micros() - Machine::microsEntry;  // microseconds since entry
            // double fraction = microsDelta * 1.0 / Machine::microsTotal;
            // float frequencyC = Machine::frqI + (Machine::frqO - Machine::frqI) * fraction;
            if (Machine::frqI != Machine::frqO) {
                float frequencyC = sqrt(Machine::frqA2 * Machine::cPrim + Machine::frqII);
                Machine::updateFrequency(frequencyC);
            }
        }

    } else {
        // coord_planar_t getNextBlock = Coords::getNextBlock();
        // Machine::accept(getNextBlock, 20);
    }
}

void Machine::updateFrequency(float frequency) {
    Machine::pulseTimer.set_frequency(frequency);
    // Display::printFrequency(frequency);
}

/**
 * TODO :: provide value for exit speed (last exit speed could be kept as class variable)
 * entry and exit speeds would have been precalculated in another place
 * corexy specific acceleration could be calculated for this specific step in this method, i.e. accelerate to a defined max speed, then decelerate to exit speed
 */
bool Machine::accept(coord_planar_t dstPlanar, float vi, float vo) {

    // TODO :: better strategy for trimming coordinates, i.e. find the intersection between target and machine bounds
    if (Machine::homedX) {
        dstPlanar.x = max(0, dstPlanar.x);
        dstPlanar.x = min(MACHINE_DIM____X, dstPlanar.x);
    }
    if (Machine::homedY) {
        dstPlanar.y = max(0, dstPlanar.y);
        dstPlanar.y = min(MACHINE_DIM____Y, dstPlanar.y);
    }
    if (Machine::homedZ) {
        dstPlanar.z = min(0, dstPlanar.z);
        dstPlanar.z = max(MACHINE_DIM____Z, dstPlanar.z);
    }

    if (vi == 0 && vo == 0) {
        vi = MACHINE_HOME_MMS;
        vo = MACHINE_HOME_MMS;
    }

    // corexy source coordinate
    coord_corexy_t srcCorexy = Motors::getCurCorexy();
    // corexy destination coordinate
    coord_corexy_t dstCorexy = Coords::planarToCorexy(dstPlanar);
    // corexy vector to reach destination
    coord_corexy_t vecCorexy = Coords::toCorexyVector(srcCorexy, dstCorexy);

    // planar source coordinate
    coord_planar_t srcPlanar = Coords::corexyToPlanar(srcCorexy);
    float dX = dstPlanar.x - srcPlanar.x;
    float dY = dstPlanar.y - srcPlanar.y;
    float dZ = dstPlanar.z - srcPlanar.z;

    if (vecCorexy.a != 0.0 || vecCorexy.b != 0.0 || vecCorexy.z != 0.0) {

        // planar distance to reach destination
        float lenPlanar = sqrt(dX * dX + dY * dY + dZ * dZ);

        // duration to reach destination (each block needs to have linear acceleration or constant speed)
        Machine::microsTotal = lenPlanar * 2 * MICROSECONDS_PER_SECOND / (vi + vo);  // total microseconds, TODO :: store in Machine::tSecs;

        // TODO :: from vi and vo calculate fi (entry-frequency) and fo (exit-frequency)

        // Serial.print("durSecond: ");
        // Serial.println(String(durSecond, 4));

        // TODO :: introduce alternative finer resolution
        // this may require calculating 5 frequencies, discarding frequencies too high, then using the highest remaining frequency

        // set up primary and secondary axes and axis specific values for bresenham algorithm
        if (Coords::hasMaximumAVal(vecCorexy)) {
            Machine::motorPrim = &Motors::motorA;
            Machine::motorSec1 = &Motors::motorB;
            Machine::motorSec2 = &Motors::motorZ;
            Machine::dPrim = abs(vecCorexy.a);
            Machine::dSec1 = abs(vecCorexy.b);
            Machine::dSec2 = abs(vecCorexy.z);
        } else if (Coords::hasMaximumBVal(vecCorexy)) {
            Machine::motorPrim = &Motors::motorB;
            Machine::motorSec1 = &Motors::motorA;
            Machine::motorSec2 = &Motors::motorZ;
            Machine::dPrim = abs(vecCorexy.b);
            Machine::dSec1 = abs(vecCorexy.a);
            Machine::dSec2 = abs(vecCorexy.z);
        } else {
            Machine::motorPrim = &Motors::motorZ;
            Machine::motorSec1 = &Motors::motorA;
            Machine::motorSec2 = &Motors::motorB;
            Machine::dPrim = abs(vecCorexy.z);
            Machine::dSec1 = abs(vecCorexy.a);
            Machine::dSec2 = abs(vecCorexy.b);
        }

        Machine::frqI = abs(Machine::dPrim) * vi / lenPlanar;
        Machine::frqO = abs(Machine::dPrim) * vo / lenPlanar;
        Machine::frqA2 = (Machine::frqO - Machine::frqI) * 2000000.0 / Machine::microsTotal;
        Machine::frqII = Machine::frqI * Machine::frqI;

        // Serial.print("mPrim: ");
        // Serial.print(Machine::motorPrim->id);

        // Serial.print("Machine::dPrim: ");
        // Serial.print(String(Machine::dPrim));
        // Serial.print(", Machine::dSec1: ");
        // Serial.print(String(Machine::dSec1));
        // Serial.print(", vi: ");
        // Serial.print(String(vi, 4));
        // Serial.print(", vo: ");
        // Serial.print(String(vo, 4));
        // Serial.print(", frqI: ");
        // Serial.print(String(Machine::frqI, 4));
        // Serial.print(", frqO: ");
        // Serial.println(String(Machine::frqO, 4));
        // Serial.print(", frqA2: ");
        // Serial.print(String(Machine::frqA2, 4));
        // Serial.print(", frqII: ");
        // Serial.println(String(Machine::frqII, 4));

        // more bresenham algorithm values
        Machine::cPrim = 0;
        Machine::eSec1 = 2 * Machine::dSec1 - Machine::dPrim;
        Machine::eSec2 = 2 * Machine::dSec2 - Machine::dPrim;

        // point the motors in the proper direction
        Motors::motorA.setDirection(vecCorexy.a >= 0 ? MOTOR___DRCT_FWD : MOTOR___DRCT_BWD);
        Motors::motorB.setDirection(vecCorexy.b >= 0 ? MOTOR___DRCT_FWD : MOTOR___DRCT_BWD);
        Motors::motorZ.setDirection(vecCorexy.z >= 0 ? MOTOR___DRCT_FWD : MOTOR___DRCT_BWD);

        Machine::microsEntry = micros();
        Machine::updateFrequency(Machine::frqI);  // start with entry-frequency

        return true;
    } else {
        return false;  // zero distance
    }
}
