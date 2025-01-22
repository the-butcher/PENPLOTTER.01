#ifndef Switch_h
#define Switch_h

#include <Arduino.h>

class Switch {
   private:
   public:
    Switch(char id, uint8_t stopPin);
    char id;
    uint8_t stopPin;
    /**
     * set everything needed to have a functional limit-switch
     * - set stop pin to INPUT_PULLUP
     */
    bool begin();
    /**
     * checks if the limit-switch associated with this limit is pressed
     * NOTE :: the switch is wired to the NC (normally-closed) pin on the switch, so it will report being pressed for contact failure also
     */
    bool isPressed();
};

#endif