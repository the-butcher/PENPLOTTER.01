#include <Switches.h>

Switch Switches::switchX('X', LIMIT_X_STOP_PIN);
Switch Switches::switchY('Y', LIMIT_Y_STOP_PIN);
Switch Switches::switchZ('Z', LIMIT_Z_STOP_PIN);

bool Switches::begin() {
    return Switches::switchX.begin() && Switches::switchY.begin() && Switches::switchZ.begin();
}

bool Switches::isAnySwitchPressed() {
    return Switches::switchX.isPressed() || Switches::switchY.isPressed() || Switches::switchZ.isPressed();
}
