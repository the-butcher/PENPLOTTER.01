#include <Btle.h>
#include <Machine.h>
#include <Motors.h>

BLEDevice Btle::bleCentral;
BLEService Btle::bleService(COMMAND_SERVICE___UUID);
BLEUnsignedIntCharacteristic Btle::bleBuffSizeCharacteristic(COMMAND_BUFF_SIZE_UUID, BLERead);
BLECharacteristic Btle::bleBuffValsCharacteristic(COMMAND_BUFF_VALS_UUID, BLEWrite, sizeof(block_planar_t) * COMMAND_BUFF_VALS_SIZE, true);
BLECharacteristic Btle::blePositionCharacteristic(COMMAND_POSITION__UUID, BLERead, sizeof(block_planar_t), true);

// Function to convert a struct to a byte array
// https://wokwi.com/projects/384215584338530305
template <typename T>
void serializeData(const T& inputStruct, uint8_t* outputBytes) {
    memcpy(outputBytes, &inputStruct, sizeof(T));
}

// Function to convert a byte array to a struct
// https://wokwi.com/projects/384215584338530305
template <typename T>
void deserializeData(const uint8_t* inputBytes, uint16_t offset, T& outputStruct) {
    memcpy(&outputStruct, inputBytes + offset, sizeof(T));
}

bool Btle::begin() {
    BLE.setDeviceName(BTLE_DEVICE_NAME);
    BLE.setLocalName(BTLE_DEVICE_NAME);
    if (!BLE.begin()) {
        return false;
    }
    BLE.setAdvertisedService(Btle::bleService);
    Btle::bleService.addCharacteristic(Btle::bleBuffSizeCharacteristic);
    Btle::bleService.addCharacteristic(Btle::bleBuffValsCharacteristic);
    Btle::bleService.addCharacteristic(Btle::blePositionCharacteristic);
    BLE.addService(Btle::bleService);
    Btle::bleBuffSizeCharacteristic.writeValue(Coords::getBuffCoordSpace());
    BLE.advertise();
    return true;
}

bool Btle::connect() {
    Btle::bleCentral = BLE.central();
    Serial.println("BT: waiting");
    delay(500);

    if (Btle::bleCentral) {
        Serial.print("BT: connected - ");
        Serial.println(Btle::bleCentral.address());
        return true;
    } else {
        return false;
    }
}

void Btle::setBuffSize() {
    if (Btle::bleCentral.connected()) {
        Btle::bleBuffSizeCharacteristic.writeValue(Coords::getBuffCoordSpace());
    }
}

void Btle::setPosition() {
    if (Btle::bleCentral.connected()) {
        coord_corexy_t curCorexy = Motors::getCurCorexy();
        coord_planar_t curPlanar = Coords::corexyToPlanar(curCorexy);
        // Serial.print("x: ");
        // Serial.print(String(curPlanar.x, 3));
        // Serial.print(", y: ");
        // Serial.print(String(curPlanar.y, 3));
        // Serial.print(", z: ");
        // Serial.println(String(curPlanar.z, 3));
        uint8_t outValue[sizeof(curPlanar)];
        serializeData(curPlanar, outValue);
        Btle::blePositionCharacteristic.writeValue(outValue, sizeof(curPlanar));
    }
}

bool Btle::getBuffVals() {

    if (Btle::bleCentral.connected()) {

        if (Btle::bleBuffValsCharacteristic.written()) {

            // read byte array from characteristic
            uint8_t* newValue = (uint8_t*)Btle::bleBuffValsCharacteristic.value();

            block_planar_t blockPlanar;
            for (uint16_t newValueIndex = 0; newValueIndex < COMMAND_BUFF_VALS_SIZE * sizeof(block_planar_t); newValueIndex += sizeof(block_planar_t)) {
                deserializeData(newValue, newValueIndex, blockPlanar);
                // if (blockPlanar.z == 9999.0) {

                //     // Serial.print("resetting to coordinate, x:");
                //     // Serial.print(String(blockPlanar.x, 3));
                //     // Serial.print(", y: ");
                //     // Serial.println(String(blockPlanar.y, 3));
                //     Machine::reset(blockPlanar.x, blockPlanar.y);
                //     Machine::homedZ = false;
                //     Coords::addBlock({0.0, 0.0, 10.0, MACHINE_HOME_VXY, MACHINE_HOME_VXY});  // move along z-axis until z-switch is pressed

                // } else {
                Coords::addBlock(blockPlanar);
                // }
            }

            Btle::setBuffSize();  // update buffer size after reading

            // readin buffer values takes around 5ms (not including the call to written())
            // long millisB = millis();
            // Serial.print("getBuffVals(): ");
            // Serial.println(String(millisB - millisA));

            return true;

        } else {
            return false;  // no values to be read
        }

    } else {
        Serial.println("BT: disconnected");
        return false;  // not connected
    }
}
