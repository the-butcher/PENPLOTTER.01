#ifndef Motor_h
#define Motor_h

#include <Arduino.h>

// typedef enum {
//     MOTOR___DRCT_FWD,
//     MOTOR___DRCT_BWD
// } motor_direction__e;

// typedef enum {
//     MOTOR___MICR__ON,
//     MOTOR___MICR_OFF
// } motor_microstep__e;

typedef struct {
    PinStatus drctVal;  // status to be set on the direction pin
    PinStatus micrVal;  // status to be set on the microstep pin
    int8_t cntrInc;     // primary counter increment
    uint8_t micrInc;    // secondary counter increment
} motor_direction__t;

class Motor {
   private:
    /**
     * steps per mm
     */
    uint8_t stepsMm;  // (steps-per-revolution * millistepping (half, quarter, ...)) / mm-belt-per-revolution, i.e. (400steps * 4quarterstep) / (20t * 2mm) = 40

    uint8_t stepPin;
    uint8_t drctPin;
    uint8_t micrPin;
    motor_direction__t drctCur;
    int32_t cntrCur;  // current step count
    int8_t micrCur;   // current micro step count

   public:
    Motor(char id, uint8_t stepsMm, uint8_t micrMlt, uint8_t stepPin, uint8_t drctPin, uint8_t micrPin);

    char id;

    uint8_t micrMlt;

    // motor_direction__t drctFwd;
    // motor_direction__t drctBwd;

    /**
     * set everything needed to have a functional motor
     * - set direction pin to output
     * - set step pin to output
     */
    bool begin();

    void setDirection(motor_direction__t drctCur);

    /**
     * send a single motor pulse
     * - set the step pin to HIGH
     * - delay a minimum amount of time, i.e. one microsecond
     * - set the step pin to LOW
     * - increment the step counter with the appropriate value
     */
    void pulse();

    void setCntrCur(int32_t cntrCur);
    int32_t getCntrCur();
};

#endif