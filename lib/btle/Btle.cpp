#include <Btle.h>

BLEDevice Btle::bleCentral;
BLEService Btle::bleService(COMMAND_SERVICE___UUID);
BLEUnsignedIntCharacteristic Btle::bleBuffSizeCharacteristic(COMMAND_BUFF_SIZE_UUID, BLERead);
BLECharacteristic Btle::bleBuffValsCharacteristic(COMMAND_BUFF_VALS_UUID, BLEWrite, sizeof(block_planar_t) * COMMAND_BUFF_VALS_SIZE, true);

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
    BLE.addService(Btle::bleService);
    Btle::bleBuffSizeCharacteristic.writeValue(Coords::getBuffCoordSpace());
    BLE.advertise();
    return true;
}

bool Btle::connect() {

    Btle::bleCentral = BLE.central();
    Serial.println("BT: waiting for central device...");
    delay(500);

    if (Btle::bleCentral) {
        Serial.println("BT: connected to central device!");
        Serial.print("BT: device MAC address: ");
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

void Btle::getBuffVals() {

    if (Btle::bleCentral.connected()) {

        if (Btle::bleBuffValsCharacteristic.written()) {

            // read byte array from characteristic
            uint8_t* newValue = (uint8_t*)Btle::bleBuffValsCharacteristic.value();

            // Serial.println(String(inputBytes[0]));
            // Serial.println(String(inputBytes[4]));
            // Serial.println(String(inputBytes[8]));
            // Serial.println(String(inputBytes[12]));
            // Serial.println(String(inputBytes[16]));
            // Serial.println(String(inputBytes[20]));

            block_planar_t blockPlanar;
            for (uint16_t newValueIndex = 0; newValueIndex < COMMAND_BUFF_VALS_SIZE * sizeof(block_planar_t); newValueIndex += sizeof(block_planar_t)) {

                // Serial.print("newValueIndex: ");
                // Serial.println(String(newValueIndex));

                deserializeData(newValue, newValueIndex, blockPlanar);

                // Serial.print("BT: ");
                // Serial.print(String(blockPlanar.x, 1));
                // Serial.print(", ");
                // Serial.print(String(blockPlanar.y, 1));
                // Serial.print(", ");
                // Serial.print(String(blockPlanar.z, 1));
                // Serial.print(", ");
                // Serial.print(String(blockPlanar.vi, 1));
                // Serial.print(", ");
                // Serial.println(String(blockPlanar.vo, 1));

                Coords::addBlock(blockPlanar);
            }
            Btle::setBuffSize();
        }
    } else {
        Serial.println("BT: disconnected from central device!");
    }
}
